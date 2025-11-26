<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'invoice_id',
        'client_id',
        'payment_date',
        'amount',
        'payment_method',
        'payment_reference',
        'currency',
        'notes',
        'file_path',
        'created_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'payment_method_label',
    ];

    /**
     * Gera número sequencial de recibo
     */
    public static function generateReceiptNumber(): string
    {
        $year = date('Y');
        $lastReceipt = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastReceipt ? ((int) substr($lastReceipt->receipt_number, -4)) + 1 : 1;

        return sprintf('REC-%s-%04d', $year, $sequence);
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

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Métodos auxiliares
     */
    public function getPaymentMethodLabelAttribute(): string
    {
        $methods = [
            'cash' => 'Dinheiro',
            'bank_transfer' => 'Transferência Bancária',
            'cheque' => 'Cheque',
            'mpesa' => 'M-Pesa',
            'emola' => 'E-Mola',
            'credit_card' => 'Cartão de Crédito',
            'debit_card' => 'Cartão de Débito',
            'other' => 'Outro',
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }
}
