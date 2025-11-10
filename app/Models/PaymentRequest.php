<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model PaymentRequest
 * Sistema de Solicitação de Pagamentos entre Operações e Finanças
 *
 * @author Arnaldo Tomo
 */
class PaymentRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shipment_id',
        'phase',
        'request_type',
        'payee',
        'amount',
        'currency',
        'description',
        'metadata',
        'status',
        'requested_by',
        'approved_by',
        'paid_by',
        'approved_at',
        'paid_at',
        'rejection_reason',
        'quotation_document_id',
        'payment_proof_id',
        'receipt_document_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
    'request_type_label',
    'status_label',
    'status_color',
    'formatted_amount',
    'related_phases'
];



    // * Accessor: Retorna as fases onde esta despesa deve aparecer

    //  * Este accessor é automaticamente serializado no JSON
    public function getRelatedPhasesAttribute(): array

    {

        return $this->calculateRelatedPhases();

    }


      /**

     * Retorna as fases onde esta despesa deve aparecer

     * baseado no tipo de despesa

     */

    public function calculateRelatedPhases(): array

    {

        $phaseMapping = [

            // Fase 1: Coleta Dispersa

            'shipping_line_quotation' => [1],

            'cdm_fee' => [1,4],

            'customs_preliminary' => [1, 3], // Aparece em Coleta e Alfândegas

            'transport_fee' => [1, 7], // Aparece em Coleta e POD

            'other_coleta' => [1],



            // Fase 2: Legalização

            'legalization_advance' => [1, 2], // Aparece em Coleta e Legalização

            'legalization_fee' => [1, 2], // Aparece em Coleta e Legalização



            // Fase 3: Alfândegas

            'customs_tax' => [1, 3], // Aparece em Coleta e Alfândegas



            // Fase 4: Cornelder

            'storage_fee' => [1, 4], // Aparece em Coleta e Cornelder



            // Fase 5: Taxação

            'tax_payment' => [1, 5], // Aparece em Coleta e Taxação



            // Fase 6: Faturação

            'invoice_related' => [1, 6], // Aparece em Coleta e Faturação



            // Fase 7: POD

            'delivery_fee' => [1, 7], // Aparece em Coleta e POD

        ];



        // Se não encontrar o tipo, retorna apenas a fase atual

        return $phaseMapping[$this->request_type] ?? [$this->phase];

    }


     public function shouldShowInPhase(int $phase): bool

    {

        // return in_array($phase, $this->getRelatedPhases());

        return in_array($phase, $this->calculateRelatedPhases());

    }
    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payer()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function quotationDocument()
    {
        return $this->belongsTo(Document::class, 'quotation_document_id');
    }

    public function paymentProof()
    {
        return $this->belongsTo(Document::class, 'payment_proof_id');
    }

    public function receiptDocument()
    {
        return $this->belongsTo(Document::class, 'receipt_document_id');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeInPayment($query)
    {
        return $query->where('status', 'in_payment');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeForPhase($query, string $phase)
    {
        return $query->where('phase', $phase);
    }

    public function scopeAwaitingFinance($query)
    {
        return $query->whereIn('status', ['approved', 'in_payment']);
    }

    // ========================================
    // MÉTODOS DE AÇÃO
    // ========================================

    /**
     * Aprovar solicitação (Gestor)
     */
    public function approve(int $userId, ?string $notes = null): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
            'metadata' => array_merge($this->metadata ?? [], [
                'approval_notes' => $notes
            ])
        ]);

        // Notificar Finanças
        // $this->notifyFinance();

        return true;
    }

    /**
     * Rejeitar solicitação
     */
    public function reject(int $userId, string $reason): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        // Notificar Operações
        // $this->notifyOperations('rejected');

        return true;
    }

    /**
     * Iniciar processamento de pagamento (Finanças)
     */
    public function startPayment(int $userId): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }

        $this->update([
            'status' => 'in_payment',
            'paid_by' => $userId,
        ]);

        return true;
    }

    /**
     * Confirmar pagamento com comprovativo
     */
    public function confirmPayment(int $documentId): bool
    {
        // if ($this->status !== 'in_payment') {
        //     return false;
        // }

        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_proof_id' => $documentId,
        ]);

        // Notificar Operações que pagamento foi feito
        // $this->notifyOperations('paid');

        // Avançar fase do shipment se aplicável
        $this->advanceShipmentPhase();

        return true;
    }

    /**
     * Anexar recibo recebido do fornecedor
     */
    public function attachReceipt(int $documentId): void
    {
        $this->update([
            'receipt_document_id' => $documentId,
        ]);

        // Marcar checklist do shipment como completo
        $this->completeShipmentChecklist();

        // Opcional: Marcar checklist do shipment como completo
    // $this->completeShipmentChecklist();

    // Opcional: Se quiser avançar automaticamente a fase após recibo
    $this->advanceShipmentPhaseIfComplete();
    }

    /**
 * ✅ Verificar se todos os pagamentos da fase estão completos
 * e avançar fase se necessário
 */
protected function advanceShipmentPhaseIfComplete(): void
{
    $shipment = $this->shipment;
    $phase = $this->phase;

    // Verificar se todos os payment_requests desta fase têm recibos
    $pendingRequests = $shipment->paymentRequests()
        ->where('phase', $phase)
        ->where('status', 'paid')
        ->whereNull('receipt_document_id')
        ->count();

    // Se não há solicitações pendentes, pode avançar
    if ($pendingRequests === 0) {
        $this->advanceShipmentPhase();
    }
}



    // ========================================
    // HELPERS
    // ========================================

    /**
     * Verifica se pode ser aprovado
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'pending' && $this->quotation_document_id !== null;
    }

    /**
     * Verifica se pode ser pago
     */
    public function canBePaid(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Obter label do tipo de solicitação
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'quotation_payment' => 'Pagamento de Cotação',
            'customs_tax' => 'Taxas Alfandegárias',
            'storage_fee' => 'Taxa de Armazenamento',
            'cornelder_fee' => 'Despesas Cornelder',
            'transport_fee' => 'Frete/Transporte',
            'other' => 'Outros',
        ];

        return $labels[$this->request_type] ?? 'Desconhecido';
    }

    /**
     * Obter badge de status
     */
    public function getStatusBadge(): array
    {
        $badges = [
            'pending' => ['label' => 'Pendente', 'color' => 'yellow'],
            'approved' => ['label' => 'Aprovado', 'color' => 'blue'],
            'in_payment' => ['label' => 'Em Pagamento', 'color' => 'purple'],
            'paid' => ['label' => 'Pago', 'color' => 'green'],
            'rejected' => ['label' => 'Rejeitado', 'color' => 'red'],
            'cancelled' => ['label' => 'Cancelado', 'color' => 'gray'],
        ];

        return $badges[$this->status] ?? ['label' => 'Desconhecido', 'color' => 'gray'];
    }

    // ========================================
    // NOTIFICAÇÕES
    // ========================================

    protected function notifyFinance(): void
    {
        // Implementar notificação para equipe de finanças
        // Notification::send($financeTeam, new PaymentRequestApproved($this));
    }

    protected function notifyOperations(string $action): void
    {
        // Notificar equipe de operações
        // Notification::send($this->requester, new PaymentRequestUpdated($this, $action));
    }

    // ========================================
    // INTEGRAÇÃO COM SHIPMENT
    // ========================================

    protected function advanceShipmentPhase(): void
    {
        // Lógica para avançar fase do shipment após pagamento
        // Depende da fase e tipo de pagamento
    }

    protected function completeShipmentChecklist(): void
    {
        // Marcar item do checklist como completo
    }

  // Accessors
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2, ',', '.') . ' ' . $this->currency;
    }


    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'pending' => 'Pendente',
            'approved' => 'Aprovado',
            'rejected' => 'Rejeitado',
            'paid' => 'Pago',
            default => 'Desconhecido'
        };
    }

     public function getRequestTypeLabelAttribute()
    {
        $labels = [
            'shipping_line_quotation' => 'Cotação Linha de Navegação',
            'cdm_fee' => 'Despesas CDM',
            'customs_preliminary' => 'Taxas Alfandegárias Preliminares',
            'legalization_advance' => 'Adiantamento Legalização',
            'transport_fee' => 'Taxa de Transporte',
            'other_coleta' => 'Outras Despesas Coleta',
            'legalization_fee' => 'Taxas de Legalização',
            'customs_tax' => 'Impostos Alfandegários',
            'storage_fee' => 'Taxa de Armazenamento',
            'tax_payment' => 'Pagamento de Impostos',
            'invoice_related' => 'Custos de Faturação',
            'delivery_fee' => 'Taxa de Entrega/Transporte',
        ];

        return $labels[$this->request_type] ?? $this->request_type;
    }

        public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'blue',
            'rejected' => 'red',
            'paid' => 'green',
            default => 'gray'
        };
    }

}
