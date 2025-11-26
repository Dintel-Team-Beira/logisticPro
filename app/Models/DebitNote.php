<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebitNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'debit_note_number',
        'invoice_id',
        'client_id',
        'issue_date',
        'reason',
        'reason_description',
        'subtotal',
        'tax_amount',
        'total',
        'currency',
        'status',
        'notes',
        'file_path',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'reason_label',
        'status_badge',
    ];

    /**
     * Gera número sequencial de nota de débito
     */
    public static function generateDebitNoteNumber(): string
    {
        $year = date('Y');
        $lastNote = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastNote ? ((int) substr($lastNote->debit_note_number, -4)) + 1 : 1;

        return sprintf('DN-%s-%04d', $year, $sequence);
    }

    /**
     * Relacionamentos
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(DebitNoteItem::class)->orderBy('sort_order');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scopes
     */
    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeIssued($query)
    {
        return $query->whereIn('status', ['issued', 'applied']);
    }

    /**
     * Calcular totais a partir dos itens
     */
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->tax_amount = $this->items->sum('tax_amount');
        $this->total = $this->items->sum('total');
        $this->save();
    }

    /**
     * Métodos auxiliares
     */
    public function getReasonLabelAttribute(): string
    {
        $reasons = [
            'additional_charges' => 'Custos Adicionais',
            'late_fees' => 'Juros de Mora',
            'penalties' => 'Multas',
            'billing_correction' => 'Correção de Faturação',
            'exchange_difference' => 'Diferença Cambial',
            'other' => 'Outro Motivo',
        ];

        return $reasons[$this->reason] ?? $this->reason;
    }

    public function getStatusBadgeAttribute(): array
    {
        $badges = [
            'draft' => ['label' => 'Rascunho', 'color' => 'gray'],
            'issued' => ['label' => 'Emitida', 'color' => 'blue'],
            'applied' => ['label' => 'Aplicada', 'color' => 'green'],
            'cancelled' => ['label' => 'Cancelada', 'color' => 'red'],
        ];

        return $badges[$this->status] ?? $badges['draft'];
    }
}
