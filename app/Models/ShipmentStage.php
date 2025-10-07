<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShipmentStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'stage',
        'status',
        'started_at',
        'completed_at',
        'notes',
        'metadata',
        'updated_by'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array'
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
