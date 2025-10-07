<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference_number',
        'shipping_line_id',
        'bl_number',
        'container_number',
        'vessel_name',
        'arrival_date',
        'origin_port',
        'destination_port',
        'cargo_description',
        'status',
        'created_by'
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'metadata' => 'array',
    'storage_alert' => 'boolean',
    'cargo_weight' => 'decimal:2',
    'cargo_value' => 'decimal:2',
    'total_cost' => 'decimal:2',
    'invoice_amount' => 'decimal:2',
    'profit_margin' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shipment) {
            if (!$shipment->reference_number) {
                $shipment->reference_number = 'SHP-' . date('Y') . '-' . str_pad(static::max('id') + 1, 5, '0', STR_PAD_LEFT);
            }
        });
    }


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

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function stages()
    {
        return $this->hasMany(ShipmentStage::class);
    }



    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getCurrentStage()
    {
        return $this->stages()->where('status', 'in_progress')->first()
            ?? $this->stages()->where('status', 'pending')->first();
    }



    /**
     * Relacionamento com atividades
     */
    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('created_at', 'desc');
    }

    /**
     * Helper para verificar se documento existe
     */
    public function hasDocument(string $type): bool
    {
        return $this->documents()->where('type', $type)->exists();
    }

    /**
     * Helper para obter documento específico
     */
    public function getDocument(string $type)
    {
        return $this->documents()->where('type', $type)->first();
    }

    /**
     * Helper para notificações (pode integrar com sistema de notificações)
     */
    public function notify(string $message): void
    {
        // Implementar sistema de notificações
        // Por exemplo: enviar email, push notification, etc.

        $this->activities()->create([
            'user_id' => auth()->id() ?? 1,
            'action' => 'notification',
            'description' => $message,
        ]);
    }



}
