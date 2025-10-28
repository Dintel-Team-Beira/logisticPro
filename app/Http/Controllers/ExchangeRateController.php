<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ExchangeRateController extends Controller
{
    /**
     * Get current exchange rates for dashboard
     */
    public function getCurrent()
    {
        $rates = ExchangeRate::getLatestRates('MZN');

        if (empty($rates)) {
            return response()->json([
                'message' => 'Taxas não disponíveis. Execute: php artisan exchange:update',
                'rates' => [],
                'updated_at' => null,
            ], 404);
        }

        return response()->json([
            'rates' => collect($rates)->map(function($rate) {
                return [
                    'from_currency' => $rate['from_currency'],
                    'to_currency' => $rate['to_currency'],
                    'flag' => $this->getFlag($rate['from_currency']),
                    'currency_name' => $this->getCurrencyName($rate['from_currency']),
                    'rate' => number_format($rate['rate'], 2, '.', ''),
                    'change_percentage' => number_format($rate['change_percentage'], 2, '.', ''),
                    'is_increasing' => $rate['change_percentage'] > 0,
                    'fetched_at' => $rate['fetched_at'],
                ];
            }),
            'updated_at' => $rates[0]['fetched_at'] ?? null,
            'last_update' => Cache::get('exchange_rates_last_update'),
        ]);
    }

    /**
     * Convert amount from one currency to another
     */
    public function convert(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3',
            'to' => 'nullable|string|size:3',
        ]);

        $result = ExchangeRate::convert(
            $validated['amount'],
            strtoupper($validated['from']),
            strtoupper($validated['to'] ?? 'MZN')
        );

        if ($result === null) {
            return response()->json([
                'error' => 'Taxa de câmbio não disponível para esta moeda',
            ], 404);
        }

        return response()->json([
            'original_amount' => $validated['amount'],
            'from_currency' => strtoupper($validated['from']),
            'to_currency' => strtoupper($validated['to'] ?? 'MZN'),
            'converted_amount' => $result,
            'rate' => ExchangeRate::getCurrentRate(strtoupper($validated['from'])),
        ]);
    }

    /**
     * Get historical rates for a currency
     */
    public function getHistory(string $currency, Request $request)
    {
        $days = $request->get('days', 7);

        $history = ExchangeRate::where('from_currency', strtoupper($currency))
            ->where('to_currency', 'MZN')
            ->where('fetched_at', '>=', now()->subDays($days))
            ->orderBy('fetched_at', 'desc')
            ->get(['rate', 'fetched_at'])
            ->map(function($rate) {
                return [
                    'date' => $rate->fetched_at->format('Y-m-d H:i'),
                    'rate' => $rate->rate,
                ];
            });

        return response()->json([
            'currency' => strtoupper($currency),
            'period_days' => $days,
            'data_points' => $history->count(),
            'history' => $history,
        ]);
    }

    /**
     * Manual trigger to update rates (admin only)
     */
    public function forceUpdate()
    {
        \Artisan::call('exchange:update', ['--force' => true]);
        $output = \Artisan::output();

        return response()->json([
            'message' => 'Atualização de taxas iniciada',
            'output' => $output,
        ]);
    }

    /**
     * Helper: Get currency flag
     */
    private function getFlag(string $currency): string
    {
        return match($currency) {
            'USD' => '🇺🇸',
            'EUR' => '🇪🇺',
            'GBP' => '🇬🇧',
            'ZAR' => '🇿🇦',
            'CNY' => '🇨🇳',
            default => '🌍',
        };
    }

    /**
     * Helper: Get currency name
     */
    private function getCurrencyName(string $currency): string
    {
        return match($currency) {
            'USD' => 'Dólar',
            'EUR' => 'Euro',
            'GBP' => 'Libra',
            'ZAR' => 'Rand',
            'CNY' => 'Yuan',
            default => $currency,
        };
    }
}
