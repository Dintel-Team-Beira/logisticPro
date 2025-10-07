<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'shipment_id',
        'user_id',
        'action',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Relacionamento com Shipment
     */
    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Relacionamento com User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para ordenar por mais recente
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}


