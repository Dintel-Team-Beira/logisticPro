<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model Invoice - Gerencia TODAS as Faturas
 * - Faturas de fornecedores (coleta_dispersa, alfandegas, cornelder)
 * - Faturas ao cliente final (client_invoice)
 *
 * @author Arnaldo Tomo
 */
class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'client_id',
        'invoice_number',
        'type',
        'issuer',
        'amount',
        'currency',
        'issue_date',
        'due_date',
        'status',
        'payment_date',
        'payment_reference',
        'notes',
        'file_path',
        'metadata'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'payment_date' => 'date',
        'metadata' => 'array'
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Faturas ao cliente final
     */
    public function scopeClientInvoices($query)
    {
        return $query->where('type', 'client_invoice');
    }

    /**
     * Faturas de fornecedores
     */
    public function scopeSupplierInvoices($query)
    {
        return $query->whereIn('type', ['coleta_dispersa', 'alfandegas', 'cornelder', 'outros']);
    }

    // ========================================
    // MÉTODOS DE CÁLCULO AUTOMÁTICO
    // ========================================

    /**
     * Calcula todos os custos do shipment baseado em PaymentRequests
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
        $containerCount = 1; // 1 shipment = 1 container

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
            'currency' => 'USD',
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
     * Gera número sequencial de fatura ao cliente
     */
    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $lastInvoice = self::clientInvoices()
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? ((int) substr($lastInvoice->invoice_number, -4)) + 1 : 1;

        return sprintf('INV-%s-%04d', $year, $sequence);
    }

    /**
     * Verifica se shipment pode gerar fatura ao cliente
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

        // 3. Verificar se já existe fatura ao cliente
        $existingInvoice = self::clientInvoices()
            ->where('shipment_id', $shipment->id)
            ->exists();

        if ($existingInvoice) {
            $validation['warnings'][] = 'Já existe uma fatura gerada para este shipment. Gerar nova fatura irá criar uma adicional.';
        }

        // 4. Verificar se existe container
        if (empty($shipment->container_number)) {
            $validation['warnings'][] = 'Nenhum container registrado no shipment.';
        }

        return $validation;
    }

    /**
     * Accessor para obter dados da fatura do metadata
     */
    public function getInvoiceDataAttribute(): ?array
    {
        return $this->metadata['invoice_data'] ?? null;
    }

    /**
     * Accessor para total da fatura
     */
    public function getTotalAttribute(): float
    {
        // 1. Se já tem amount definido (campo direto), usar
        if (isset($this->attributes['amount']) && $this->attributes['amount'] !== null) {
            return (float) $this->attributes['amount'];
        }

        // 2. Se for fatura ao cliente, tentar pegar do metadata
        if ($this->type === 'client_invoice' && isset($this->metadata['invoice_data']['total_invoice'])) {
            return (float) $this->metadata['invoice_data']['total_invoice'];
        }

        // 3. Fallback para 0
        return 0.0;
    }
}
