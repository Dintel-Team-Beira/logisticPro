<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    use HasFactory;

    protected $table = 'service_catalog';

    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'unit_price',
        'unit',
        'tax_type',
        'tax_rate',
        'is_active',
        'sort_order',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Generate unique service code
     */
    public static function generateCode(): string
    {
        $lastService = static::orderBy('id', 'desc')->first();
        $nextNumber = $lastService ? ((int) substr($lastService->code, 4)) + 1 : 1;
        return 'SRV-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope: Active services only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: By category
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get formatted category name
     */
    public function getCategoryNameAttribute(): string
    {
        $categories = [
            'freight' => 'Frete',
            'customs' => 'Desembaraço Aduaneiro',
            'warehousing' => 'Armazenagem',
            'handling' => 'Manuseio',
            'transport' => 'Transporte',
            'insurance' => 'Seguro',
            'documentation' => 'Documentação',
            'inspection' => 'Inspeção',
            'consulting' => 'Consultoria',
            'other' => 'Outros',
        ];

        return $categories[$this->category] ?? $this->category;
    }

    /**
     * Calculate price with tax
     */
    public function getPriceWithTaxAttribute(): float
    {
        if ($this->tax_type === 'included' || $this->tax_type === 'exempt') {
            return (float) $this->unit_price;
        }

        return (float) $this->unit_price * (1 + ($this->tax_rate / 100));
    }

    /**
     * Quote items using this service
     */
    public function quoteItems()
    {
        return $this->hasMany(QuoteItem::class, 'service_id');
    }

    /**
     * Invoice items using this service
     */
    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class, 'service_id');
    }
}
