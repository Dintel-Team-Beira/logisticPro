<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditNoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'credit_note_id',
        'invoice_item_id',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'subtotal',
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
    ];

    /**
     * Relacionamentos
     */
    public function creditNote()
    {
        return $this->belongsTo(CreditNote::class);
    }

    public function invoiceItem()
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    /**
     * Calcular totais do item
     * Não salva automaticamente - deixa o controller decidir quando salvar
     */
    public function calculateTotals()
    {
        $this->subtotal = $this->quantity * $this->unit_price;
        $this->tax_amount = $this->subtotal * ($this->tax_rate / 100);
        $this->total = $this->subtotal + $this->tax_amount;

        // Não chamar save() aqui porque o credit_note_id pode não estar definido ainda
        // O controller fará o save através de $creditNote->items()->save($item)
    }
}
