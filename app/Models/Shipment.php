<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model Shipment
 * Gestão de processos de importação usando shipment_stages
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
        'cargo_weight',
        'cargo_value',
        'storage_deadline',
        'storage_alert',
        'total_cost',
        'invoice_amount',
        'profit_margin',
        'status',
        'metadata',
        'created_by',
        // Campos de status por fase
        'quotation_status',
        'payment_status',
        'customs_status',
        'customs_payment_status',
        'cornelder_payment_status',
        'client_invoice_id',
        'client_payment_status',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'storage_deadline' => 'date',
        'storage_alert' => 'boolean',
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
    public function shipping_line()
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

    public function clientInvoice()
    {
        return $this->hasOne(Invoice::class)
            ->where('type', 'cliente')
            ->orWhere('type', 'faturacao');
    }

    // ========================================
    // HELPER METHODS - GESTÃO DE STAGES
    // ========================================

 /**
 * Obter o stage atual (prioriza in_progress, depois completed)
 *
 * @return ShipmentStage|null
 */
public function currentStage()
{
    // Primeiro, procurar por stage em progresso
    $inProgressStage = $this->stages()
        ->where('status', 'in_progress')
        ->latest('id')
        ->first();

    if ($inProgressStage) {
        return $inProgressStage;
    }

    // Se não encontrar, retornar o último completado
    return $this->stages()
        ->where('status', 'completed')
        ->latest('id')
        ->first();
}

  /**
 * Obter o número da fase atual (1-7)
 *
 * @return int
 */
public function getCurrentPhaseAttribute(): int
{
    $currentStage = $this->currentStage();

    if (!$currentStage) {
        return 1; // Fase inicial
    }

    // Mapear stage para número de fase
    $stageMap = [
        'coleta_dispersa' => 1,
        'legalizacao' => 2,
        'alfandegas' => 3,
        'cornelder' => 4,
        'taxacao' => 5,
        'financas' => 6,  // Adicionado
        'faturacao' => 6, // Alias
        'pod' => 7,       // Adicionado
    ];

    return $stageMap[$currentStage->stage] ?? 1;
}

    /**
     * Verificar se está em um stage específico
     *
     * @param string $stageName
     * @return bool
     */
    public function isInStage(string $stageName): bool
    {
        $currentStage = $this->currentStage();
        return $currentStage && $currentStage->stage === $stageName;
    }

    /**
     * Verificar se está em uma fase específica
     *
     * @param int $phase
     * @return bool
     */
    public function isInPhase(int $phase): bool
    {
        return $this->current_phase === $phase;
    }

    /**
     * Obter o nome do stage baseado no número da fase
     *
     * @param int $phase
     * @return string
     */
    public static function getStageNameFromPhase(int $phase): string
    {
        $phases = [
            1 => 'coleta_dispersa',
            2 => 'legalizacao',
            3 => 'alfandegas',
            4 => 'cornelder',
            5 => 'taxacao',
        ];

        return $phases[$phase] ?? 'coleta_dispersa';
    }

    // ========================================
    // QUERY SCOPES - FILTRAR POR STAGE
    // ========================================

    /**
     * Scope para filtrar shipments em um stage específico
     *
     * Uso: Shipment::inStage('coleta_dispersa')->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $stageName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInStage($query, string $stageName)
    {
        return $query->whereHas('stages', function($q) use ($stageName) {
            $q->where('stage', $stageName)
              ->where('status', 'in_progress');
        });
    }

    /**
     * Scope para filtrar shipments por número de fase
     *
     * Uso: Shipment::inPhase(1)->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $phase
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInPhase($query, int $phase)
    {
        $stageName = self::getStageNameFromPhase($phase);
        return $query->inStage($stageName);
    }


    /**
     * Scope para filtrar shipments que completaram um stage
     *
     * Uso: Shipment::completedStage('coleta_dispersa')->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $stageName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompletedStage($query, string $stageName)
    {
        return $query->whereHas('stages', function($q) use ($stageName) {
            $q->where('stage', $stageName)
              ->where('status', 'completed');
        });
    }

    /**
     * Scope para filtrar shipments pendentes em um stage
     *
     * Uso: Shipment::pendingStage('coleta_dispersa')->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $stageName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePendingStage($query, string $stageName)
    {
        return $query->whereHas('stages', function($q) use ($stageName) {
            $q->where('stage', $stageName)
              ->where('status', 'pending');
        });
    }

    /**
     * Scope para filtrar shipments com stage bloqueado
     *
     * Uso: Shipment::blockedStage('alfandegas')->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $stageName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBlockedStage($query, string $stageName)
    {
        return $query->whereHas('stages', function($q) use ($stageName) {
            $q->where('stage', $stageName)
              ->where('status', 'blocked');
        });
    }

    /**
     * Scope para buscar shipments (referência, BL, container)
     *
     * Uso: Shipment::search('BL123')->get()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('reference_number', 'like', "%{$search}%")
              ->orWhere('bl_number', 'like', "%{$search}%")
              ->orWhere('container_number', 'like', "%{$search}%");
        });
    }

    // ========================================
    // HELPER METHODS - AVANÇAR FASES
    // ========================================

    /**
     * Iniciar um novo stage
     *
     * @param string $stageName
     * @return ShipmentStage
     */
    public function startStage(string $stageName)
    {
        return $this->stages()->create([
            'stage' => $stageName,
            'status' => 'in_progress',
            'started_at' => now(),
            'updated_by' => auth()->id(),
        ]);
    }

/**
 * Completar o stage atual e avançar para o próximo
 * CORREÇÃO: Agora inclui todas as 7 fases
 *
 * @return ShipmentStage|null
 */
public function advanceToNextStage()
{
    $currentStage = $this->currentStage();

    if (!$currentStage) {
        // Iniciar na primeira fase
        return $this->startStage('coleta_dispersa');
    }

    // Completar stage atual
    $currentStage->update([
        'status' => 'completed',
        'completed_at' => now(),
        'updated_by' => auth()->id(),
    ]);

    // Determinar próximo stage (TODAS as 7 fases)
    $nextStages = [
        'coleta_dispersa' => 'legalizacao',
        'legalizacao' => 'alfandegas',
        'alfandegas' => 'cornelder',
        'cornelder' => 'taxacao',
        'taxacao' => 'faturacao',    // Fase 6
        'faturacao' => 'pod',         // Fase 7
        'financas' => 'pod',          // Alias para faturacao
        'pod' => null,                // Última fase
    ];

    $nextStage = $nextStages[$currentStage->stage] ?? null;

    if ($nextStage) {
        return $this->startStage($nextStage);
    }

    // Se chegou aqui, o processo está completo
    $this->update(['status' => 'completed']);
    return null;
}

    /**
     * Bloquear o stage atual
     *
     * @param string $reason
     * @return bool
     */
    public function blockCurrentStage(string $reason = '')
    {
        $currentStage = $this->currentStage();

        if ($currentStage) {
            return $currentStage->update([
                'status' => 'blocked',
                'notes' => $reason,
                'updated_by' => auth()->id(),
            ]);
        }

        return false;
    }

    // ========================================
    // ACCESSORS & MUTATORS
    // ========================================

    /**
     * Calcular dias de storage
     */
    public function getStorageDaysAttribute()
    {
        if (!$this->arrival_date) {
            return 0;
        }

        $arrivalDate = \Carbon\Carbon::parse($this->arrival_date);
        return $arrivalDate->diffInDays(now());
    }

    /**
     * Calcular dias restantes de storage FREE
     */
    public function getDaysToStorageDeadlineAttribute()
    {
        $freeDays = $this->shippingLine->free_storage_days ?? 7;
        return $freeDays - $this->storage_days;
    }

    /**
     * Verificar se storage está crítico
     */
    public function getIsStorageCriticalAttribute()
    {
        return $this->days_to_storage_deadline <= 2;
    }

    /**
     * Calcular dias decorridos desde criação
     */
    public function getDaysElapsedAttribute()
    {
        $startDate = \Carbon\Carbon::parse($this->created_at);
        $endDate = $this->completed_at
            ? \Carbon\Carbon::parse($this->completed_at)
            : now();

        return $startDate->diffInDays($endDate);
    }
}
