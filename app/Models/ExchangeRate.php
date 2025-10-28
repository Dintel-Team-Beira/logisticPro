<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'previous_rate',
        'change_percentage',
        'fetched_at',
        'source',
    ];

    protected $casts = [
        'rate' => 'decimal:6',
        'previous_rate' => 'decimal:6',
        'change_percentage' => 'decimal:4',
        'fetched_at' => 'datetime',
    ];

    /**
     * Get current exchange rate from cache or database
     */
    public static function getCurrentRate(string $fromCurrency, string $toCurrency = 'MZN'): ?float
    {
        $cacheKey = "exchange_rate_{$fromCurrency}_{$toCurrency}";

        return Cache::remember($cacheKey, 3600, function() use ($fromCurrency, $toCurrency) {
            $rate = self::where('from_currency', $fromCurrency)
                ->where('to_currency', $toCurrency)
                ->latest('fetched_at')
                ->first();

            return $rate?->rate;
        });
    }

    /**
     * Get all latest rates
     */
    public static function getLatestRates(string $toCurrency = 'MZN'): array
    {
        $cacheKey = "exchange_rates_latest_{$toCurrency}";

        return Cache::remember($cacheKey, 3600, function() use ($toCurrency) {
            return self::where('to_currency', $toCurrency)
                ->whereIn('from_currency', ['USD', 'EUR', 'ZAR', 'GBP', 'CNY'])
                ->orderBy('fetched_at', 'desc')
                ->get()
                ->groupBy('from_currency')
                ->map(fn($rates) => $rates->first())
                ->values()
                ->toArray();
        });
    }

    /**
     * Convert amount from one currency to MZN
     */
    public static function convert(float $amount, string $fromCurrency, string $toCurrency = 'MZN'): ?float
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        $rate = self::getCurrentRate($fromCurrency, $toCurrency);

        return $rate ? round($amount * $rate, 2) : null;
    }

    /**
     * Get currency flag emoji
     */
    public function getFlagAttribute(): string
    {
        return match($this->from_currency) {
            'USD' => '🇺🇸',
            'EUR' => '🇪🇺',
            'GBP' => '🇬🇧',
            'ZAR' => '🇿🇦',
            'CNY' => '🇨🇳',
            default => '🌍',
        };
    }

    /**
     * Get currency name
     */
    public function getCurrencyNameAttribute(): string
    {
        return match($this->from_currency) {
            'USD' => 'Dólar Americano',
            'EUR' => 'Euro',
            'GBP' => 'Libra Esterlina',
            'ZAR' => 'Rand Sul-Africano',
            'CNY' => 'Yuan Chinês',
            default => $this->from_currency,
        };
    }

    /**
     * Check if rate increased
     */
    public function getIsIncreasingAttribute(): bool
    {
        return $this->change_percentage > 0;
    }

    /**
     * Get formatted change
     */
    public function getFormattedChangeAttribute(): string
    {
        $arrow = $this->is_increasing ? '↗' : '↘';
        $color = $this->is_increasing ? 'green' : 'red';

        return "{$arrow} " . abs($this->change_percentage) . "%";
    }
}
