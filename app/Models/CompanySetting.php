<?php

// app/Models/CompanySetting.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
        'tax_id',
        'logo',
        'invoice_settings',
        'webhooks',
        'maintenance_mode',
        'session_timeout',
        'two_factor_enabled',
    ];

    protected $casts = [
        'invoice_settings' => 'array',
        'webhooks' => 'array',
        'maintenance_mode' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'session_timeout' => 'integer',
    ];

    /**
     * Obter URL completa do logo
     */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? Storage::url($this->logo) : null;
    }

    /**
     * Obter configuração de invoice específica
     */
    public function getInvoiceSetting(string $key, $default = null)
    {
        return $this->invoice_settings[$key] ?? $default;
    }

    /**
     * Obter próximo número de invoice
     */
    public function getNextInvoiceNumber(): string
    {
        $prefix = $this->getInvoiceSetting('invoice_prefix', 'INV');
        $number = $this->getInvoiceSetting('next_invoice_number', 1);

        return $prefix . '-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Incrementar número de invoice
     */
    public function incrementInvoiceNumber(): void
    {
        $settings = $this->invoice_settings;
        $settings['next_invoice_number'] = ($settings['next_invoice_number'] ?? 1) + 1;

        $this->update(['invoice_settings' => $settings]);
    }

    /**
     * Singleton: sempre retorna a mesma instância
     */
    public static function getInstance(): self
    {
        return self::firstOrCreate(['id' => 1]);
    }
}
