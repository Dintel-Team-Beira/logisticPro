<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebitNoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'debit_note_id',
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
    public function debitNote()
    {
        return $this->belongsTo(DebitNote::class);
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

        // Não chamar save() aqui porque o debit_note_id pode não estar definido ainda
        // O controller fará o save através de $debitNote->items()->save($item)
    }
}
