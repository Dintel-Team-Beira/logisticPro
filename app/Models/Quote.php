<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'quote_number',
        'client_id',
        'shipment_id',
        'title',
        'description',
        'quote_date',
        'valid_until',
        'status',
        'subtotal',
        'discount_percentage',
        'discount_amount',
        'tax_amount',
        'total',
        'terms',
        'notes',
        'customer_notes',
        'payment_terms',
        'currency',
        'invoice_id',
        'converted_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'quote_date' => 'date',
        'valid_until' => 'date',
        'subtotal' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'converted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Generate unique quote number
     */
    public static function generateQuoteNumber(): string
    {
        $year = date('Y');
        $lastQuote = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastQuote ? ((int) substr($lastQuote->quote_number, -4)) + 1 : 1;
        return 'QT-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Relationships
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function items()
    {
        return $this->hasMany(QuoteItem::class)->orderBy('sort_order');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeExpired($query)
    {
        return $query->where('valid_until', '<', now())
            ->whereNotIn('status', ['accepted', 'rejected', 'converted']);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'sent', 'viewed']);
    }

    /**
     * Check if quote is expired
     */
    public function isExpired(): bool
    {
        return $this->valid_until < now() &&
               !in_array($this->status, ['accepted', 'rejected', 'converted']);
    }

    /**
     * Check if quote can be converted to invoice
     */
    public function canConvertToInvoice(): bool
    {
        return $this->status === 'accepted' &&
               !$this->invoice_id &&
               !$this->isExpired();
    }

    /**
     * Calculate totals from items
     */
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');

        // Apply discount
        if ($this->discount_percentage > 0) {
            $this->discount_amount = $this->subtotal * ($this->discount_percentage / 100);
        }

        $subtotalAfterDiscount = $this->subtotal - $this->discount_amount;

        // Calculate tax on items
        $this->tax_amount = $this->items->sum('tax_amount');

        // Total
        $this->total = $subtotalAfterDiscount + $this->tax_amount;

        $this->save();
    }

    /**
     * Get status badge info
     */
    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'draft' => ['label' => 'Rascunho', 'color' => 'gray'],
            'sent' => ['label' => 'Enviada', 'color' => 'blue'],
            'viewed' => ['label' => 'Visualizada', 'color' => 'indigo'],
            'accepted' => ['label' => 'Aceita', 'color' => 'green'],
            'rejected' => ['label' => 'Rejeitada', 'color' => 'red'],
            'expired' => ['label' => 'Expirada', 'color' => 'orange'],
            'converted' => ['label' => 'Convertida', 'color' => 'purple'],
        ];

        return $badges[$this->status] ?? $badges['draft'];
    }
}
