<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * INSTRUÇÕES:
 * Adicionar/atualizar estas propriedades e métodos no Model Shipment existente
 * Localização: app/Models/Shipment.php
 */
class Shipment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * ATUALIZAR $fillable - Adicionar novos campos
     */
    protected $fillable = [
        'reference_number',
        'client_id',                // NOVO
        'shipping_line_id',
        'bl_number',
        'container_number',
        'container_type',           // NOVO
        'vessel_name',
        'arrival_date',
        'origin_port',
        'destination_port',
        'cargo_description',
        'cargo_weight',             // NOVO
        'cargo_value',              // NOVO
        'storage_deadline',         // NOVO
        'storage_alert',            // NOVO
        'total_cost',               // NOVO
        'invoice_amount',           // NOVO
        'profit_margin',            // NOVO
        'status',
        'metadata',                 // NOVO
        'created_by',
    ];

    /**
     * ATUALIZAR $casts - Adicionar casts para novos campos
     */
    protected $casts = [
        'arrival_date' => 'date',
        'storage_deadline' => 'date',       // NOVO
        'storage_alert' => 'boolean',       // NOVO
        'cargo_weight' => 'decimal:2',      // NOVO
        'cargo_value' => 'decimal:2',       // NOVO
        'total_cost' => 'decimal:2',        // NOVO
        'invoice_amount' => 'decimal:2',    // NOVO
        'profit_margin' => 'decimal:2',     // NOVO
        'metadata' => 'array',              // NOVO
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELACIONAMENTOS - ADICIONAR
    |--------------------------------------------------------------------------
    */

    /**
     * Relacionamento com Cliente
     * NOVO - Adicionar este método
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relacionamento com Linha de Navegação
     * (Já deve existir, manter)
     */
    public function shippingLine()
    {
        return $this->belongsTo(ShippingLine::class);
    }

    /**
     * Relacionamento com Documentos
     * (Já deve existir, manter)
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Relacionamento com Atividades
     * (Já deve existir, manter)
     */
    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('created_at', 'desc');
    }

    /**
     * Relacionamento com Usuário Criador
     * (Já deve existir, manter)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES - ADICIONAR NOVOS
    |--------------------------------------------------------------------------
    */

    /**
     * Scope para shipments com alerta de storage
     * NOVO
     */
    public function scopeWithStorageAlert($query)
    {
        return $query->where('storage_alert', true);
    }

    /**
     * Scope para shipments próximos do deadline
     * NOVO
     */
    public function scopeNearDeadline($query, $days = 2)
    {
        return $query->whereNotNull('storage_deadline')
            ->where('storage_deadline', '<=', now()->addDays($days))
            ->where('storage_deadline', '>=', now());
    }

    /**
     * Scope por tipo de container
     * NOVO
     */
    public function scopeByContainerType($query, $type)
    {
        return $query->where('container_type', $type);
    }

    /**
     * Scope por cliente
     * NOVO
     */
    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS - ADICIONAR NOVOS
    |--------------------------------------------------------------------------
    */

    /**
     * Get tipo de container formatado
     * NOVO
     */
    public function getContainerTypeFormattedAttribute(): ?string
    {
        if (!$this->container_type) {
            return null;
        }

        $types = [
            '20DC' => "20' Dry Container",
            '40DC' => "40' Dry Container",
            '40HC' => "40' High Cube",
            '20RF' => "20' Reefer",
            '40RF' => "40' Reefer",
            '20OT' => "20' Open Top",
            '40OT' => "40' Open Top",
        ];

        return $types[$this->container_type] ?? $this->container_type;
    }

    /**
     * Get peso formatado
     * NOVO
     */
    public function getCargoWeightFormattedAttribute(): ?string
    {
        if (!$this->cargo_weight) {
            return null;
        }

        return number_format($this->cargo_weight, 2, ',', '.') . ' kg';
    }

    /**
     * Get valor formatado
     * NOVO
     */
    public function getCargoValueFormattedAttribute(): ?string
    {
        if (!$this->cargo_value) {
            return null;
        }

        return '$' . number_format($this->cargo_value, 2, '.', ',');
    }

    /**
     * Get custo total formatado
     * NOVO
     */
    public function getTotalCostFormattedAttribute(): ?string
    {
        if (!$this->total_cost) {
            return null;
        }

        return '$' . number_format($this->total_cost, 2, '.', ',');
    }

    /**
     * Get valor da fatura formatado
     * NOVO
     */
    public function getInvoiceAmountFormattedAttribute(): ?string
    {
        if (!$this->invoice_amount) {
            return null;
        }

        return '$' . number_format($this->invoice_amount, 2, '.', ',');
    }

    /**
     * Get margem de lucro formatada
     * NOVO
     */
    public function getProfitMarginFormattedAttribute(): ?string
    {
        if (!$this->profit_margin) {
            return null;
        }

        return number_format($this->profit_margin, 2, ',', '.') . '%';
    }

    /**
     * Get dias até o deadline
     * NOVO
     */
    public function getDaysUntilDeadlineAttribute(): ?int
    {
        if (!$this->storage_deadline) {
            return null;
        }

        return now()->diffInDays($this->storage_deadline, false);
    }

    /**
     * Check se está próximo do deadline (< 2 dias)
     * NOVO
     */
    public function getIsNearDeadlineAttribute(): bool
    {
        if (!$this->storage_deadline) {
            return false;
        }

        $days = $this->days_until_deadline;
        return $days !== null && $days >= 0 && $days <= 2;
    }

    /**
     * Check se passou do deadline
     * NOVO
     */
    public function getIsOverdueAttribute(): bool
    {
        if (!$this->storage_deadline) {
            return false;
        }

        return $this->storage_deadline->isPast();
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTODOS - ADICIONAR NOVOS
    |--------------------------------------------------------------------------
    */

    /**
     * Calcular lucro real
     * NOVO
     */
    public function calculateProfit(): float
    {
        if (!$this->invoice_amount || !$this->total_cost) {
            return 0;
        }

        return $this->invoice_amount - $this->total_cost;
    }

    /**
     * Calcular margem de lucro percentual
     * NOVO
     */
    public function calculateProfitMargin(): float
    {
        if (!$this->invoice_amount || !$this->total_cost) {
            return 0;
        }

        $profit = $this->calculateProfit();
        return ($profit / $this->total_cost) * 100;
    }

    /**
     * Atualizar alerta de storage
     * NOVO
     */
    public function updateStorageAlert(): bool
    {
        if (!$this->storage_deadline) {
            $this->storage_alert = false;
            return $this->save();
        }

        $this->storage_alert = $this->is_near_deadline || $this->is_overdue;
        return $this->save();
    }

    /**
     * Verificar se documento existe (já deve existir, manter)
     */
    public function hasDocument(string $type): bool
    {
        return $this->documents()->where('type', $type)->exists();
    }

    /**
     * Obter documento específico (já deve existir, manter)
     */
    public function getDocument(string $type)
    {
        return $this->documents()->where('type', $type)->first();
    }

    /**
     * Enviar notificação (já deve existir, manter)
     */
    public function notify(string $message): void
    {
        $this->activities()->create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'notification',
            'description' => $message,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BOOT METHOD - ADICIONAR
    |--------------------------------------------------------------------------
    */

    /**
     * The "booted" method of the model.
     * NOVO
     */
    protected static function booted(): void
    {
        // Auto-update storage alert quando storage_deadline mudar
        static::saving(function ($shipment) {
            if ($shipment->isDirty('storage_deadline')) {
                $shipment->updateStorageAlert();
            }
        });
    }
}
