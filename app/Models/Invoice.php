<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model Invoice - Gerencia Faturas ao Cliente
 * RF-022: Gerar Fatura ao Cliente
 *
 * Usa a estrutura de Documents existente com type='client_invoice'
 * Armazena dados calculados no metadata JSON
 *
 * @author Arnaldo Tomo
 */
class Invoice extends Model
{
    use HasFactory;

    protected $table = 'documents';

    protected $fillable = [
        'shipment_id',
        'type',
        'name',
        'file_path',
        'file_type',
        'file_size',
        'metadata',
        'uploaded_by',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Escopo para buscar apenas faturas
     */
    public function scopeInvoices($query)
    {
        return $query->where('type', 'client_invoice');
    }

    /**
     * Relacionamentos
     */
    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // ========================================
    // MÉTODOS DE CÁLCULO AUTOMÁTICO
    // ========================================

    /**
     * Calcula todos os custos do shipment
     */
    public static function calculateShipmentCosts(Shipment $shipment): array
    {
        // 1. Buscar todas as PaymentRequests PAGAS
        $paymentRequests = $shipment->paymentRequests()
            ->where('status', 'paid')
            ->get();

        // 2. Agrupar por fase
        $costsByPhase = [
            'coleta_dispersa' => [],
            'alfandegas' => [],
            'cornelder' => [],
            'outros' => [],
        ];

        $totalPaid = 0;

        foreach ($paymentRequests as $pr) {
            $amount = (float) $pr->amount;
            $totalPaid += $amount;

            $cost = [
                'description' => $pr->description,
                'payee' => $pr->payee,
                'amount' => $amount,
                'currency' => $pr->currency,
                'request_type' => $pr->request_type,
            ];

            // Agrupar por fase
            switch ($pr->phase) {
                case 'coleta_dispersa':
                    $costsByPhase['coleta_dispersa'][] = $cost;
                    break;
                case 'alfandegas':
                    $costsByPhase['alfandegas'][] = $cost;
                    break;
                case 'cornelder':
                    $costsByPhase['cornelder'][] = $cost;
                    break;
                default:
                    $costsByPhase['outros'][] = $cost;
            }
        }

        // 3. Adicionar custos padrões (Base Rates)
        $baseRates = self::getBaseRates();
        $containerCount = $shipment->containers()->count() ?: 1;

        $baseRatesCosts = [
            [
                'description' => 'Container Clearing Fee',
                'payee' => 'Logistica Pro',
                'amount' => $baseRates['container_clearing'] * $containerCount,
                'currency' => 'USD',
                'request_type' => 'base_rate',
            ],
            [
                'description' => 'SL Container Fee',
                'payee' => 'Logistica Pro',
                'amount' => $baseRates['sl_container'] * $containerCount,
                'currency' => 'USD',
                'request_type' => 'base_rate',
            ],
            [
                'description' => 'Bond Fee',
                'payee' => 'Logistica Pro',
                'amount' => $baseRates['bond'],
                'currency' => 'USD',
                'request_type' => 'base_rate',
            ],
            [
                'description' => 'Agency Services',
                'payee' => 'Logistica Pro',
                'amount' => $baseRates['agency'] * $containerCount,
                'currency' => 'USD',
                'request_type' => 'base_rate',
            ],
        ];

        $totalBaseRates = array_sum(array_column($baseRatesCosts, 'amount'));

        // 4. Total antes da margem
        $subtotal = $totalPaid + $totalBaseRates;

        return [
            'costs_by_phase' => $costsByPhase,
            'base_rates' => $baseRatesCosts,
            'total_paid_costs' => $totalPaid,
            'total_base_rates' => $totalBaseRates,
            'subtotal' => $subtotal,
            'container_count' => $containerCount,
            'currency' => 'USD', // Principal
        ];
    }

    /**
     * Aplica margem de lucro
     */
    public static function applyProfitMargin(float $subtotal, float $marginPercent = 15): array
    {
        $marginAmount = $subtotal * ($marginPercent / 100);
        $totalInvoice = $subtotal + $marginAmount;

        return [
            'subtotal' => $subtotal,
            'margin_percent' => $marginPercent,
            'margin_amount' => $marginAmount,
            'total_invoice' => $totalInvoice,
        ];
    }

    /**
     * Custos Padrões (Base Rates) - Configuráveis
     */
    public static function getBaseRates(): array
    {
        // TODO: Mover para configurações do sistema (RF-033)
        return [
            'container_clearing' => 25.00, // USD por container
            'sl_container' => 40.00,       // USD por container
            'bond' => 50.00,               // USD fixo
            'agency' => 50.00,             // USD por container
        ];
    }

    /**
     * Gera número sequencial de fatura
     */
    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $lastInvoice = self::invoices()
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? ((int) substr($lastInvoice->metadata['invoice_number'] ?? '0', -4)) + 1 : 1;

        return sprintf('INV-%s-%04d', $year, $sequence);
    }

    /**
     * Verifica se shipment pode gerar fatura
     */
    public static function canGenerateInvoice(Shipment $shipment): array
    {
        $validation = [
            'can_generate' => true,
            'errors' => [],
            'warnings' => [],
        ];

        // 1. Verificar se Fase 1 está completa
        $phase1Complete = $shipment->stages()
            ->where('stage', 'coleta_dispersa')
            ->where('status', 'completed')
            ->exists();

        if (!$phase1Complete) {
            $validation['can_generate'] = false;
            $validation['errors'][] = 'Fase 1 (Coleta Dispersa) deve estar completa.';
        }

        // 2. Verificar se existem PaymentRequests pendentes
        $pendingRequests = $shipment->paymentRequests()
            ->whereIn('status', ['pending', 'approved', 'in_payment'])
            ->count();

        if ($pendingRequests > 0) {
            $validation['can_generate'] = false;
            $validation['errors'][] = "Existem {$pendingRequests} solicitação(ões) de pagamento pendentes.";
        }

        // 3. Verificar se já existe fatura
        $existingInvoice = self::invoices()
            ->where('shipment_id', $shipment->id)
            ->exists();

        if ($existingInvoice) {
            $validation['warnings'][] = 'Já existe uma fatura gerada para este shipment. Gerar nova fatura irá substituir a anterior.';
        }

        // 4. Verificar se existem containers
        $containerCount = $shipment->containers()->count();
        if ($containerCount === 0) {
            $validation['warnings'][] = 'Nenhum container registrado. Base rates serão calculados para 1 container.';
        }

        return $validation;
    }

    /**
     * Accessor para obter dados da fatura
     */
    public function getInvoiceDataAttribute(): ?array
    {
        return $this->metadata['invoice_data'] ?? null;
    }

    /**
     * Accessor para número da fatura
     */
    public function getInvoiceNumberAttribute(): ?string
    {
        return $this->metadata['invoice_number'] ?? null;
    }

    /**
     * Accessor para total
     */
    public function getTotalAttribute(): float
    {
        return $this->metadata['invoice_data']['total_invoice'] ?? 0;
    }

    /**
     * Accessor para status de pagamento
     */
    public function getPaymentStatusAttribute(): string
    {
        return $this->metadata['payment_status'] ?? 'pending';
    }
}
