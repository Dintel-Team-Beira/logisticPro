<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

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

   public function getPhase1Progress(): float
{
    $steps = [
        // BL já anexado na criação
        $this->documents()->where('type', 'bl')->exists() ? 25 : 0,

        // Cotação solicitada
        $this->quotation_status === 'requested' ? 25 : 0,

        // Pagamento efetuado
        $this->payment_status === 'paid' ? 25 : 0,

        // Recibo anexado
        $this->documents()->where('type', 'receipt')->exists() ? 25 : 0,
    ];

    return array_sum($steps);
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
            'warnings' => [],
            'risks' => [],
            'missing_items' => [],
        ];

        switch ($phase) {
            case 1: // Coleta Dispersa
                $result['can_advance'] = $this->quotation_status === 'received';

                if ($this->payment_status !== 'paid') {
                    $result['warnings'][] = 'Pagamento ainda não confirmado';
                    $result['risks'][] = 'delay';
                }

                if (!$this->documents()->where('type', 'receipt')->exists()) {
                    $result['warnings'][] = 'Recibo de pagamento não anexado';
                    $result['missing_items'][] = 'receipt';
                }
                break;

            case 2: // Legalização
                $hasBL = $this->documents()->where('type', 'bl')->exists();
                $result['can_advance'] = $hasBL;

                if (!$hasBL) {
                    $result['warnings'][] = 'BL original necessário';
                    $result['missing_items'][] = 'bl';
                }

                if (!$this->documents()->where('type', 'carta_endosso')->exists()) {
                    $result['warnings'][] = 'Carta de endosso pendente';
                    $result['risks'][] = 'cannot_proceed_to_customs';
                }
                break;

            case 3: // Alfândegas
                $result['can_advance'] = $this->documents()->where('type', 'bl_carimbado')->exists();

                if ($this->customs_payment_status !== 'paid' && !$this->has_tax_exemption) {
                    $result['warnings'][] = 'Pagamento alfandegário pendente';
                    $result['risks'][] = 'high_delay';
                }

                if ($this->has_tax_exemption && !$this->documents()->where('type', 'certificado_isencao')->exists()) {
                    $result['warnings'][] = 'Certificado de isenção necessário';
                }
                break;

            case 4: // Cornelder
                // Pode iniciar em paralelo com Fase 3 se >= 70%
                $phase3Progress = $this->getPhase3Progress();
                $result['can_advance'] = $phase3Progress >= 70;

                if ($this->cornelder_payment_status !== 'paid') {
                    $result['warnings'][] = 'Pagamento Cornelder pendente';
                }

                // Alerta de storage deadline
                if ($this->storage_deadline && $this->storage_deadline->isPast()) {
                    $result['warnings'][] = 'URGENTE: Prazo de armazenamento expirado!';
                    $result['risks'][] = 'storage_fees';
                }
                break;

            case 5: // Taxação
                // Requer Fase 3 e 4 completas
                $result['can_advance'] =
                    $this->getPhase3Progress() >= 100 &&
                    $this->getPhase4Progress() >= 100;

                $requiredDocs = $this->getRequiredTaxationDocuments();
                foreach ($requiredDocs as $doc) {
                    if (!$this->documents()->where('type', $doc)->exists()) {
                        $result['missing_items'][] = $doc;
                    }
                }
                break;

            case 6: // Faturação
                $result['can_advance'] = $this->taxation_status === 'completed';

                if (!$this->total_cost) {
                    $result['warnings'][] = 'Custos totais não calculados';
                }

                if (!$this->profit_margin) {
                    $result['warnings'][] = 'Margem de lucro não definida';
                }
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

    /**
     * Completar uma fase
     */
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

        // Auto-iniciar próxima fase se aplicável
        $this->autoStartNextPhase($phase);

        return true;
    }

    /**
     * Auto-iniciar próxima fase baseado em dependências
     */
    public function autoStartNextPhase(int $completedPhase): void
    {
        $autoStart = [
            1 => 2, // Coleta completa → iniciar Legalização
            2 => 3, // Legalização completa → iniciar Alfândegas
            5 => 6, // Taxação completa → iniciar Faturação
        ];

        if (isset($autoStart[$completedPhase])) {
            $this->startPhase($autoStart[$completedPhase]);
        }
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
}
