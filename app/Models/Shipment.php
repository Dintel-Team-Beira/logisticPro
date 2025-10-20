<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Log;

/**
 * Model Shipment - VERSÃO MELHORADA
 * Gestão flexível de processos de importação
 *
 * Melhorias implementadas:
 * - Fases paralelas
 * - Status intermediários
 * - Validação flexível
 * - Checklist dinâmico
 * - Cálculo de progresso real
 *
 * @author Arnaldo Tomo
 */
class Shipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference_number',
        'client_id',
        'shipping_line_id',
        'bl_number',
        'container_number',
        'container_type',
        'vessel_name',
        'arrival_date',
        'origin_port',
        'destination_port',
        'cargo_description',
        'cargo_type', // NOVO: normal, perishable, hazardous, oversized
        'cargo_weight',
        'cargo_value',
        'storage_deadline',
        'storage_alert',
        'total_cost',
        'invoice_amount',
        'profit_margin',
        'status',
        'has_tax_exemption', // NOVO
        'is_reexport', // NOVO
        'requires_inspection', // NOVO
        'metadata',
        'created_by',
        // Campos de status por fase (agora com mais granularidade)
        'quotation_status', // not_requested, requested, received, accepted, paid
        'payment_status',
        'customs_status',
        'customs_payment_status',
        'cornelder_status', // NOVO: requested, draft_received, paid
        'cornelder_payment_status',
        'taxation_status', // NOVO: pending, documents_ready, completed
        'client_invoice_id',
        'client_payment_status',
        'pod_status', // NOVO: awaiting, received, confirmed
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'storage_deadline' => 'date',
        'storage_alert' => 'boolean',
        'has_tax_exemption' => 'boolean',
        'is_reexport' => 'boolean',
        'requires_inspection' => 'boolean',
        'cargo_weight' => 'decimal:2',
        'cargo_value' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'invoice_amount' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'metadata' => 'array',



    'freight_cost' => 'decimal:2',
    'customs_cost' => 'decimal:2',
    'cornelder_cost' => 'decimal:2',
    'other_costs' => 'decimal:2',
    ];

    protected $appends = ['request_type_label'];

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



/**
 * Obter checklist de documentos para uma fase específica
 *
 * @param int $phase
 * @return array
 */
public function getDocumentChecklistForPhase(int $phase): array
{
    $documentsByPhase = [
        1 => ['bl', 'carta_endosso'],
        2 => ['bl_carimbado', 'delivery_order'],
        3 => ['packing_list', 'commercial_invoice', 'aviso', 'autorizacao'],
        4 => ['draft', 'storage', 'termo'],
        5 => ['sad', 'ido'],
        6 => ['invoice'],
        7 => ['pod', 'signature'],
    ];

    $labels = [
        'bl' => 'BL Original',
        'carta_endosso' => 'Carta de Endosso',
        'bl_carimbado' => 'BL Carimbado',
        'delivery_order' => 'Delivery Order',
        'packing_list' => 'Packing List',
        'commercial_invoice' => 'Commercial Invoice',
        'aviso' => 'Aviso de Taxação',
        'autorizacao' => 'Autorização de Saída',
        'draft' => 'Draft Cornelder',
        'storage' => 'Storage',
        'termo' => 'Termo da Linha',
        'sad' => 'SAD (Documento Trânsito)',
        'ido' => 'IDO',
        'invoice' => 'Fatura ao Cliente',
        'pod' => 'POD (Proof of Delivery)',
        'signature' => 'Assinatura do Cliente',
    ];

    $requiredTypes = $documentsByPhase[$phase] ?? [];
    $checklist = [];

    // Buscar documentos anexados
    $attachedDocs = $this->documents()
        ->whereIn('type', $requiredTypes)
        ->get()
        ->keyBy('type');

    foreach ($requiredTypes as $type) {
        $document = $attachedDocs->get($type);

        $checklist[] = [
            'type' => $type,
            'label' => $labels[$type] ?? ucfirst($type),
            'required' => in_array($type, ['bl', 'bl_carimbado', 'delivery_order', 'sad', 'pod']),
            'attached' => $document !== null,
            'document_id' => $document ? $document->id : null,
            'uploaded_at' => $document ? $document->created_at->toIso8601String() : null,
            'file_name' => $document ? $document->name : null,
        ];
    }

    return $checklist;
}

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function shippingLine()
    {
        return $this->belongsTo(ShippingLine::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function stages()
    {
        return $this->hasMany(ShipmentStage::class)->orderBy('id', 'asc');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    // ========================================
    // ACCESSORS - NOVOS
    // ========================================

    /**
     * Obter todas as fases ativas simultaneamente
     */
    public function getActiveStagesAttribute()
    {
        return $this->stages()
            ->where('status', 'in_progress')
            ->get();
    }

    /**
     * Obter fases completadas
     */
    public function getCompletedStagesAttribute()
    {
        return $this->stages()
            ->where('status', 'completed')
            ->get();
    }

    /**
     * Calcular progresso real baseado em sub-etapas
     */
    public function getRealProgressAttribute(): float
    {
        $phases = [
            1 => $this->getPhase1Progress(),
            2 => $this->getPhase2Progress(),
            3 => $this->getPhase3Progress(),
            4 => $this->getPhase4Progress(),
            5 => $this->getPhase5Progress(),
            6 => $this->getPhase6Progress(),
            7 => $this->getPhase7Progress(),
        ];

        return round(array_sum($phases) / 7, 2);
    }

    // ========================================
    // MÉTODOS DE PROGRESSO POR FASE (PÚBLICOS)
    // ========================================

// ========================================
// 🔄 ATUALIZAR O MÉTODO getPhase1Progress()
// Substituir o código existente por este:
// ========================================

public function getPhase1Progress(): float
{
    // Verificar se há payment_requests para esta fase
    $hasRequests = $this->paymentRequests()->where('phase', 1)->exists();

    if ($hasRequests) {
        // Usar nova lógica baseada em PaymentRequests
        return $this->getPhaseProgressFromPaymentRequests(1);
    }

    // Fallback: Lógica antiga (inline, sem método separado)
    $steps = [
        $this->documents()->where('type', 'bl')->exists() ? 25 : 0,
        $this->quotation_status === 'requested' ? 25 : 0,
        $this->payment_status === 'paid' ? 25 : 0,
        $this->documents()->where('type', 'receipt')->exists() ? 25 : 0,
    ];

    return array_sum($steps);
}



/**
 * 🎯 MÉTODO UNIFICADO: Obter progresso de qualquer fase
 * Usa PaymentRequests quando disponível, senão usa métodos legados
 */
public function getPhaseProgress(int $phase): float
{
    // Verificar se há payment_requests para esta fase
    $hasRequests = $this->paymentRequests()->where('phase', $phase)->exists();

    if ($hasRequests) {
        return $this->getPhaseProgressFromPaymentRequests($phase);
    }

    // Fallback: Usar métodos de progresso existentes
    switch ($phase) {
        case 1:
            return $this->getPhase1Progress();
        case 2:
            return $this->getPhase2Progress();
        case 3:
            return $this->getPhase3Progress();
        case 4:
            return $this->getPhase4Progress();
        case 5:
            return $this->getPhase5Progress();
        case 6:
            return $this->getPhase6Progress();
        case 7:
            return $this->getPhase7Progress();
        default:
            return 0;
    }
}


/**
 * 🆕 OBTER CHECKLIST BASEADO EM PAYMENT REQUESTS
 * Retorna array com status de cada payment_request
 */
public function getPaymentRequestsChecklist(int $phase): array
{
    $requests = $this->paymentRequests()
        ->where('phase', $phase)
        ->with(['quotationDocument', 'paymentProof', 'receiptDocument'])
        ->get();

    $checklist = [];

    foreach ($requests as $request) {
        $checklist[] = [
            'id' => $request->id,
            'label' => $request->getTypeLabel() . ' - ' . $request->payee,
            'type' => $request->request_type,
            'amount' => $request->formatted_amount,
            'status' => $request->status,

            // Sub-itens do checklist
            'steps' => [
                [
                    'label' => 'Cotação Anexada',
                    'completed' => $request->quotation_document_id !== null,
                    'icon' => 'FileText',
                    'document' => $request->quotationDocument,
                ],
                [
                    'label' => 'Aprovação Recebida',
                    'completed' => in_array($request->status, ['approved', 'paid']),
                    'icon' => 'CheckCircle2',
                    'approved_at' => $request->approved_at,
                    'approved_by' => $request->approver?->name,
                ],
                [
                    'label' => 'Pagamento Efetuado',
                    'completed' => $request->payment_proof_id !== null,
                    'icon' => 'DollarSign',
                    'document' => $request->paymentProof,
                    'paid_at' => $request->paid_at,
                ],
                [
                    'label' => 'Recibo Anexado',
                    'completed' => $request->receipt_document_id !== null,
                    'icon' => 'Receipt',
                    'document' => $request->receiptDocument,
                ],
            ],

            // Progresso individual deste request (0-100%)
            'progress' => $this->calculateSingleRequestProgress($request),

            // Status geral
            'is_complete' => $request->receipt_document_id !== null,
            'can_advance' => $request->payment_proof_id !== null && $request->receipt_document_id !== null,
        ];
    }

    return $checklist;
}

/**
 * 🆕 CALCULAR PROGRESSO DE UM ÚNICO PAYMENT REQUEST
 */
private function calculateSingleRequestProgress($request): int
{
    $points = 0;

    // 25%: Request criado e aprovado
    if (in_array($request->status, ['approved', 'paid'])) {
        $points += 33;
    }

    // 33%: Pagamento efetuado
    if ($request->payment_proof_id !== null) {
        $points += 34;
    }

    // 33%: Recibo anexado
    if ($request->receipt_document_id !== null) {
        $points += 33;
    }

    return $points;
}


/**
 * 🆕 VERIFICAR SE FASE PODE AVANÇAR (baseado em PaymentRequests)
 */
public function canAdvancePhaseFromPaymentRequests(int $phase): array
{
    $result = [
        'can_advance' => false,
        'missing_items' => [],
        'warnings' => [],
        'progress' => 0,
    ];

    // Obter todos os payment_requests da fase
    $requests = $this->paymentRequests()->where('phase', $phase)->get();

    // Se não há requests, pode avançar (não bloqueia)
    if ($requests->isEmpty()) {
        $result['can_advance'] = true;
        return $result;
    }

    $result['progress'] = $this->getPhaseProgressFromPaymentRequests($phase);

    // Verificar cada request
    foreach ($requests as $request) {
        // Deve estar aprovado
        if (!in_array($request->status, ['approved', 'paid'])) {
            $result['missing_items'][] = "{$request->getTypeLabel()} - Aguardando aprovação";
            continue;
        }

        // Deve ter comprovativo de pagamento
        if ($request->payment_proof_id === null) {
            $result['warnings'][] = "{$request->getTypeLabel()} - Pagamento ainda não confirmado";
        }

        // Deve ter recibo
        if ($request->receipt_document_id === null) {
            $result['warnings'][] = "{$request->getTypeLabel()} - Recibo de pagamento não anexado";
        }
    }

    // Pode avançar se todos os requests têm pelo menos comprovativo
    // (Recibo é opcional para avançar, mas aparece como warning)
    $allPaid = $requests->every(function ($request) {
        return in_array($request->status, ['approved', 'paid']) &&
               $request->payment_proof_id !== null;
    });

    $result['can_advance'] = $allPaid && empty($result['missing_items']);

    return $result;
}

    /**
     * 🆕 RELACIONAMENTO COM PAYMENT REQUESTS
     * Todas as solicitações de pagamento deste shipment
     */
    public function paymentRequests()
    {
        return $this->hasMany(PaymentRequest::class);
    }


    public function getPhase2Progress(): float
    {
        $steps = [
            $this->documents()->where('type', 'bl')->exists() ? 33 : 0,
            $this->documents()->where('type', 'bl_carimbado')->exists() ? 34 : 0,
            $this->documents()->where('type', 'delivery_order')->exists() ? 33 : 0,
        ];
        return array_sum($steps);
    }

    public function getPhase3Progress(): float
    {
        $steps = [
            $this->customs_status === 'declaration_submitted' ? 25 : 0,
            $this->customs_status === 'notice_received' ? 25 : 0,
            $this->customs_payment_status === 'paid' ? 25 : 0,
            $this->documents()->where('type', 'autorizacao')->exists() ? 25 : 0,
        ];
        return array_sum($steps);
    }

    public function getPhase4Progress(): float
    {
        $steps = [
            $this->cornelder_status === 'requested' ? 25 : 0,
            $this->cornelder_status === 'draft_received' ? 25 : 0,
            $this->cornelder_payment_status === 'paid' ? 25 : 0,
            $this->documents()->where('type', 'receipt')->where('metadata->phase', 'cornelder')->exists() ? 25 : 0,
        ];
        return array_sum($steps);
    }

    public function getPhase5Progress(): float
    {
        $requiredDocs = ['sad', 'termo', 'bl_carimbado', 'autorizacao'];
        $uploadedCount = $this->documents()
            ->whereIn('type', $requiredDocs)
            ->count();

        return ($uploadedCount / count($requiredDocs)) * 100;
    }

    public function getPhase6Progress(): float
    {
        $steps = [
            $this->client_invoice_id !== null ? 50 : 0,
            $this->client_payment_status === 'paid' ? 50 : 0,
        ];
        return array_sum($steps);
    }

    public function getPhase7Progress(): float
    {
        $steps = [
            $this->pod_status === 'awaiting' ? 33 : 0,
            $this->documents()->where('type', 'pod')->exists() ? 34 : 0,
            $this->pod_status === 'confirmed' ? 33 : 0,
        ];
        return array_sum($steps);
    }


// ========================================
// ACCESSORS ÚTEIS
// ========================================

/**
 * Obter formatted amount para PaymentRequest
 */
public function getFormattedAmountAttribute(): string
{
    return number_format($this->amount, 2, ',', '.') . ' ' . $this->currency;
}

/**
 * Verificar se payment_request está completo
 */
public function getIsCompleteAttribute(): bool
{
    return $this->payment_proof_id !== null &&
           $this->receipt_document_id !== null;
}

/**
 * Obter label de status traduzido
 */
public function getStatusLabelAttribute(): string
{
    return match($this->status) {
        'pending' => 'Pendente',
        'approved' => 'Aprovado',
        'paid' => 'Pago',
        'rejected' => 'Rejeitado',
        default => 'Desconhecido'
    };
}


    // ========================================
    // VALIDAÇÃO FLEXÍVEL - NOVO
    // ========================================

    /**
     * Verificar se pode avançar com validação flexível
     * Retorna array com can_advance, warnings e risks
     */
    public function canAdvanceToPhase(int $phase): array
    {
        $result = [
        'can_advance' => false,
        'missing_items' => [],
        'warnings' => [],
        'risks' => [],
        'progress' => 0,
        'show_payment_request' => false,
    ];

    switch ($phase) {
        case 1: // Coleta Dispersa
            // 🆕 USAR NOVA LÓGICA
            $paymentValidation = $this->canAdvancePhaseFromPaymentRequests(1);
            $result = array_merge($result, $paymentValidation);

            // Sempre mostrar botão de solicitar orçamento na fase 1
            $result['show_payment_request'] = true;

            // Verificar BL
            if (!$this->documents()->where('type', 'bl')->exists()) {
                $result['missing_items'][] = 'BL Original deve estar anexado';
                $result['can_advance'] = false;
            }
            break;

        case 2: // Legalização
            // Similar para outras fases...
            $paymentValidation = $this->canAdvancePhaseFromPaymentRequests(2);
            $result = array_merge($result, $paymentValidation);

            // Verificar documentos necessários
            if (!$this->documents()->where('type', 'bl_carimbado')->exists()) {
                $result['missing_items'][] = 'BL Carimbado';
            }
            break;

        case 3: // Alfândegas
            $paymentValidation = $this->canAdvancePhaseFromPaymentRequests(3);
            $result = array_merge($result, $paymentValidation);

            $result['show_payment_request'] = true;
            break;

        case 4: // Cornelder
            $paymentValidation = $this->canAdvancePhaseFromPaymentRequests(4);
            $result = array_merge($result, $paymentValidation);

            $result['show_payment_request'] = true;
            break;

        case 5: // Taxação
            $paymentValidation = $this->canAdvancePhaseFromPaymentRequests(5);
            $result = array_merge($result, $paymentValidation);

            $requiredDocs = $this->getRequiredTaxationDocuments();
            foreach ($requiredDocs as $doc) {
                if (!$this->documents()->where('type', $doc)->exists()) {
                    $result['missing_items'][] = $doc;
                }
            }
            break;

         case 6: // Faturação
    // ✅ CORREÇÃO: Verificar usando shipment_stages ao invés de taxation_status
    $taxacaoCompleta = $this->stages()
        ->where('stage', 'taxacao')
        ->where('status', 'completed')
        ->exists();

    $result['can_advance'] = $taxacaoCompleta;

    // Se Taxação completa, calcular custos automaticamente
    if ($taxacaoCompleta) {
        // Calcular total_cost se não existir
        if (!$this->total_cost || $this->total_cost <= 0) {
            $this->calculateTotalCost();
            $this->refresh(); // Recarregar valores
        }

        // Definir profit_margin se não existir
        if (!$this->profit_margin || $this->profit_margin <= 0) {
            $this->setDefaultProfitMargin();
            $this->refresh();
        }
    }

    // Warnings informativos (não bloqueiam)
    if (!$this->total_cost || $this->total_cost <= 0) {
        $result['warnings'][] = 'Custos totais não calculados';
    }

    if (!$this->profit_margin || $this->profit_margin <= 0) {
        $result['warnings'][] = 'Margem de lucro não definida';
    }

    // 🔒 OPCIONAL: Tornar bloqueante (descomentar se quiser bloquear)
    // if (!$this->total_cost || $this->total_cost <= 0) {
    //     $result['can_advance'] = false;
    //     $result['missing_items'][] = 'Custos totais devem ser calculados';
    // }

    break;

            case 7: // POD
                $result['can_advance'] =
                    $this->client_invoice_id !== null &&
                    $this->client_payment_status === 'paid';

                if ($this->client_payment_status !== 'paid') {
                    $result['warnings'][] = 'Cliente ainda não pagou';
                    $result['risks'][] = 'payment_pending';
                }
                break;
        }

        return $result;
    }

    /**
     * Obter documentos necessários para taxação (dinâmico)
     */
    public function getRequiredTaxationDocuments(): array
    {
        $docs = ['sad', 'termo', 'bl_carimbado', 'autorizacao'];

        if ($this->cargo_type === 'perishable') {
            $docs[] = 'certificado_sanitario';
        }

        if ($this->cargo_type === 'hazardous') {
            $docs[] = 'certificado_msds';
        }

        if ($this->requires_inspection) {
            $docs[] = 'certificado_inspecao';
        }

        if ($this->has_tax_exemption) {
            $docs[] = 'certificado_isencao';
        }

        return $docs;
    }

    /**
 * Calcular custos totais do processo
 * Soma todos os custos registrados nas fases anteriores
 *
 * @return float
 */
public function calculateTotalCost(): float
{
    // Opção 1: Calcular baseado em payment_requests aprovados
    $costFromRequests = $this->paymentRequests()
        ->whereIn('status', ['approved', 'paid'])
        ->sum('amount');

    // Opção 2: Calcular baseado nos campos do shipment
    $costFromFields = ($this->freight_cost ?? 0) +
                      ($this->customs_cost ?? 0) +
                      ($this->cornelder_cost ?? 0) +
                      ($this->other_costs ?? 0);

    // Usar o maior valor entre os dois
    $totalCost = max($costFromRequests, $costFromFields);

    // Se houver custo, atualizar o registro
    if ($totalCost > 0) {
        $this->update(['total_cost' => $totalCost]);

        // Registrar atividade
        Activity::create([
            'shipment_id' => $this->id,
            'user_id' => auth()->id() ?? 1,
            'action' => 'cost_calculated',
            'description' => "Custos totais calculados: " . number_format($totalCost, 2) . " MZN",
        ]);
    }

    return $totalCost;
}


/**
 * Definir margem de lucro padrão
 * Usa configuração global ou 15% como padrão
 *
 * @return void
 */
public function setDefaultProfitMargin(): void
{
    if (!$this->profit_margin || $this->profit_margin <= 0) {
        // Buscar configuração global (se existir)
        // $defaultMargin = Setting::get('default_profit_margin', 15);
        $defaultMargin = 15; // 15% padrão

        $this->update(['profit_margin' => $defaultMargin]);

        // Registrar atividade
        Activity::create([
            'shipment_id' => $this->id,
            'user_id' => auth()->id() ?? 1,
            'action' => 'profit_margin_set',
            'description' => "Margem de lucro definida: {$defaultMargin}%",
        ]);
    }
}

/**
 * Obter breakdown detalhado de custos
 *
 * @return array
 */
public function getCostBreakdown(): array
{
    return [
        'freight' => [
            'label' => 'Linha de Navegação',
            'amount' => $this->freight_cost ?? 0,
        ],
        'customs' => [
            'label' => 'Alfândegas',
            'amount' => $this->customs_cost ?? 0,
        ],
        'cornelder' => [
            'label' => 'Cornelder',
            'amount' => $this->cornelder_cost ?? 0,
        ],
        'others' => [
            'label' => 'Outras Despesas',
            'amount' => $this->other_costs ?? 0,
        ],
        'total' => [
            'label' => 'Total de Custos',
            'amount' => $this->total_cost ?? 0,
        ],
        'profit_margin' => [
            'label' => 'Margem de Lucro',
            'percentage' => $this->profit_margin ?? 0,
            'amount' => ($this->total_cost ?? 0) * (($this->profit_margin ?? 0) / 100),
        ],
        'total_revenue' => [
            'label' => 'Total a Faturar',
            'amount' => $this->calculateTotalRevenue(),
        ],
    ];
}

/**
 * Calcular receita total baseado em custos e margem
 *
 * @return float
 */
public function calculateTotalRevenue(): float
{
    if (!$this->total_cost || !$this->profit_margin) {
        return 0;
    }

    return $this->total_cost * (1 + $this->profit_margin / 100);
}



    // ========================================
    // GESTÃO DE FASES PARALELAS - NOVO
    // ========================================

    /**
     * Iniciar uma fase (permite múltiplas fases ativas)
     */
    public function startPhase(int $phase, bool $force = false): ?ShipmentStage
    {
        $stageName = $this->getStageNameFromPhase($phase);

        // Verificar se já existe
        $existingStage = $this->stages()->where('stage', $stageName)->first();

        if ($existingStage) {
            if ($existingStage->status === 'completed') {
                return $existingStage; // Já completada
            }

            // Reativar se estava pausada
            $existingStage->update([
                'status' => 'in_progress',
                'started_at' => $existingStage->started_at ?? now(),
                'updated_by' => auth()->id() ?? 1,
            ]);

            return $existingStage;
        }

        // Validar se pode iniciar
        if (!$force) {
            $validation = $this->canAdvanceToPhase($phase);
            if (!$validation['can_advance']) {
                return null;
            }
        }

        // Criar novo stage
        return $this->stages()->create([
            'stage' => $stageName,
            'status' => 'in_progress',
            'started_at' => now(),
            'updated_by' => auth()->id() ?? 1,
        ]);
    }

 // 3️⃣ ATUALIZAR O MÉTODO completePhase
// Localizar o método completePhase e SUBSTITUIR ou ADICIONAR após $stage->update():

public function completePhase(int $phase): bool
{
    $stageName = $this->getStageNameFromPhase($phase);
    $stage = $this->stages()->where('stage', $stageName)->first();

    if (!$stage) {
        return false;
    }

    $stage->update([
        'status' => 'completed',
        'completed_at' => now(),
        'updated_by' => auth()->id() ?? 1,
    ]);

    // ✅ ADICIONAR: Hook específico para Fase 5 (Taxação)
    if ($phase === 5) {
        // Calcular custos automaticamente
        $this->calculateTotalCost();

        // Definir margem de lucro padrão
        $this->setDefaultProfitMargin();

        // Registrar que está pronto para faturação
        Activity::create([
            'shipment_id' => $this->id,
            'user_id' => auth()->id() ?? 1,
            'action' => 'ready_for_invoice',
            'description' => 'Processo pronto para faturação. Custos calculados.',
        ]);
    }

    // Auto-iniciar próxima fase se aplicável
    $this->autoStartNextPhase($phase);

    return true;
}



// 4️⃣ VERIFICAR/ATUALIZAR O MÉTODO autoStartNextPhase
// Garantir que tem a linha 5 => 6

public function autoStartNextPhase(int $completedPhase): void
{
    $autoStart = [
        1 => 2, // Coleta completa → iniciar Legalização
        2 => 3, // Legalização completa → iniciar Alfândegas
        5 => 6, // Taxação completa → iniciar Faturação ✅ GARANTIR QUE EXISTE
    ];

    if (isset($autoStart[$completedPhase])) {
        $this->startPhase($autoStart[$completedPhase]);
    }
}


// 5️⃣ OPCIONAL: ADICIONAR ACCESSOR PARA FORMATTED COSTS
// Facilita exibição nos components

public function getFormattedTotalCostAttribute(): string
{
    return number_format($this->total_cost ?? 0, 2, ',', '.') . ' MZN';
}

public function getFormattedProfitMarginAttribute(): string
{
    return ($this->profit_margin ?? 0) . '%';
}

public function getFormattedTotalRevenueAttribute(): string
{
    return number_format($this->calculateTotalRevenue(), 2, ',', '.') . ' MZN';
}


    // ========================================
    // HELPERS
    // ========================================

    public function currentStage()
    {
        return $this->stages()
            ->where('status', 'in_progress')
            ->latest('id')
            ->first()
            ??
            $this->stages()
            ->where('status', 'completed')
            ->latest('id')
            ->first();
    }

    public function getCurrentPhaseAttribute(): int
    {
        $currentStage = $this->currentStage();
        if (!$currentStage) return 1;

        $stageMap = [
            'coleta_dispersa' => 1,
            'legalizacao' => 2,
            'alfandegas' => 3,
            'cornelder' => 4,
            'taxacao' => 5,
            'faturacao' => 6,
            'pod' => 7,
        ];

        return $stageMap[$currentStage->stage] ?? 1;
    }

    public static function getStageNameFromPhase(int $phase): string
    {
        $phases = [
            1 => 'coleta_dispersa',
            2 => 'legalizacao',
            3 => 'alfandegas',
            4 => 'cornelder',
            5 => 'taxacao',
            6 => 'faturacao',
            7 => 'pod',
        ];

        return $phases[$phase] ?? 'coleta_dispersa';
    }

    /**
     * Obter checklist dinâmico para uma fase
     */
    public function getDynamicChecklist(int $phase): array
    {
        $baseDocuments = [
            1 => ['cotacao', 'comprovativo_pagamento', 'recibo'],
            2 => ['bl', 'carta_endosso', 'delivery_order'],
            3 => ['bl_carimbado', 'packing_list', 'commercial_invoice', 'autorizacao'],
            4 => ['draft', 'storage', 'recibo_cornelder'],
            5 => ['sad', 'termo', 'ido'],
            6 => ['client_invoice'],
            7 => ['pod', 'container_return'],
        ];

        $docs = $baseDocuments[$phase] ?? [];

        // Adicionar documentos específicos
        if ($this->cargo_type === 'perishable' && in_array($phase, [2, 3])) {
            $docs[] = 'certificado_sanitario';
        }

        if ($this->has_tax_exemption && $phase === 3) {
            $docs[] = 'certificado_isencao';
            // Remover documentos de pagamento
            $docs = array_diff($docs, ['comprovativo_pagamento_alfandega']);
        }

        if ($this->is_reexport && $phase === 3) {
            $docs[] = 'certificado_reexportacao';
        }

        // Retornar com status
        return collect($docs)->map(function($docType) {
            return [
                'type' => $docType,
                'label' => ucfirst(str_replace('_', ' ', $docType)),
                'attached' => $this->documents()->where('type', $docType)->exists(),
                'required' => true,
            ];
        })->toArray();
    }


/**
 * 🆕 MÉTODO PRINCIPAL: Calcular progresso de fase baseado em PaymentRequests
 * VERSÃO SIMPLIFICADA (sem fallback)
 */
public function getPhaseProgressFromPaymentRequests(int $phase): float
{
    // Obter todos os payment_requests desta fase
    $requests = $this->paymentRequests()->where('phase', $phase)->get();

    // Se não há requests, retornar 0
    if ($requests->isEmpty()) {
        return 0;
    }

    $totalRequests = $requests->count();
    $completedSteps = 0;

    foreach ($requests as $request) {
        // Cada payment_request contribui com pontos baseado no status
        $points = 0;

        // 33%: Request criado e aprovado
        if (in_array($request->status, ['approved', 'paid'])) {
            $points += 0.33;
        }

        // 34%: Pagamento efetuado (tem payment_proof)
        if ($request->payment_proof_id !== null) {
            $points += 0.34;
        }

        // 33%: Recibo anexado
        if ($request->receipt_document_id !== null) {
            $points += 0.33;
        }

        $completedSteps += $points;
    }

    // Calcular porcentagem: (soma dos pontos / total de requests) * 100
    return round(($completedSteps / $totalRequests) * 100, 2);
}

/**
 * 📊 MÉTODO LEGACY: Cálculo antigo da Fase 1
 * Usado apenas quando não há payment_requests
 */
private function getPhase1ProgressLegacy(): float
{
    $steps = [
        // BL já anexado na criação
        $this->documents()->where('type', 'bl')->exists() ? 25 : 0,

        // Cotação solicitada (campo antigo)
        $this->quotation_status === 'requested' ? 25 : 0,

        // Pagamento efetuado (campo antigo)
        $this->payment_status === 'paid' ? 25 : 0,

        // Recibo anexado
        $this->documents()->where('type', 'receipt')->exists() ? 25 : 0,
    ];

    return array_sum($steps);
}


/**
 * Método temporário para evitar erro
 * @deprecated Remover após refatoração completa
 */
private function getLegacyPhaseProgress(int $phase): float
{
    // Simplesmente retornar o método de progresso específico
    try {
        $method = "getPhase{$phase}Progress";
        if (method_exists($this, $method)) {
            return $this->$method();
        }
    } catch (\Exception $e) {
        Log::warning("Erro ao calcular progresso legacy da fase {$phase}: " . $e->getMessage());
    }

    return 0;
}


}
