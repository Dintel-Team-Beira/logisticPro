<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'service_id',
        'service_code',
        'service_name',
        'description',
        'category',
        'quantity',
        'unit',
        'unit_price',
        'subtotal',
        'tax_type',
        'tax_rate',
        'tax_amount',
        'total',
        'sort_order',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function service()
    {
        return $this->belongsTo(ServiceCatalog::class, 'service_id');
    }

    /**
     * Calculate item totals
     */
    public function calculateTotals()
    {
        // Subtotal
        $this->subtotal = $this->quantity * $this->unit_price;

        // Tax calculation
        if ($this->tax_type === 'exempt') {
            $this->tax_amount = 0;
            $this->total = $this->subtotal;
        } elseif ($this->tax_type === 'included') {
            // Tax is included in unit price
            $this->tax_amount = $this->subtotal - ($this->subtotal / (1 + ($this->tax_rate / 100)));
            $this->total = $this->subtotal;
        } else {
            // Tax is excluded (added on top)
            $this->tax_amount = $this->subtotal * ($this->tax_rate / 100);
            $this->total = $this->subtotal + $this->tax_amount;
        }

        $this->save();
    }

    /**
     * Create from quote item
     */
    public static function createFromQuoteItem(QuoteItem $quoteItem): self
    {
        return new static([
            'service_id' => $quoteItem->service_id,
            'service_code' => $quoteItem->service_code,
            'service_name' => $quoteItem->service_name,
            'description' => $quoteItem->description,
            'category' => $quoteItem->category,
            'quantity' => $quoteItem->quantity,
            'unit' => $quoteItem->unit,
            'unit_price' => $quoteItem->unit_price,
            'subtotal' => $quoteItem->subtotal,
            'tax_type' => $quoteItem->tax_type,
            'tax_rate' => $quoteItem->tax_rate,
            'tax_amount' => $quoteItem->tax_amount,
            'total' => $quoteItem->total,
            'sort_order' => $quoteItem->sort_order,
        ]);
    }
}
