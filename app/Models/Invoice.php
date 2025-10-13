<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
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
        'client_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'payment_date' => 'date'
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function isOverdue()
    {
        return $this->status === 'pending' &&
               $this->due_date &&
               $this->due_date->isPast();
    }
}
