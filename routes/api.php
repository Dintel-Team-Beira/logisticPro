<?php

use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Global Search
|--------------------------------------------------------------------------
|
| Adicione estas rotas ao seu arquivo routes/api.php existente
|
*/

// Global Search API
Route::middleware(['auth:sanctum'])->group(function () {
    // Pesquisa completa
    Route::get('/search', [SearchController::class, 'search']);

    // Pesquisa rápida (para autocomplete no header)
    Route::get('/quick-search', [SearchController::class, 'quickSearch']);

    Route::get('/exchange-rates', function () {
    // Retrieve from cache or database
    $rates = Cache::get('exchange_rates', function () {
        // Fallback to database if cache is empty
        $dbRates = ExchangeRate::where('date', now()->toDateString())->first();
        return $dbRates ? [
            'USD_MZN' => $dbRates->usd_mzn,
            'EUR_MZN' => $dbRates->usd_mzn * 1.084, // Example conversion factor
            'ZAR_MZN' => $dbRates->usd_mzn * 0.055, // Example conversion factor
            'updated_at' => $dbRates->updated_at,
        ] : null;
    });

    if (!$rates) {
        // Fetch from API if no data in cache or DB
        $response = Http::get('https://api.exchangerate-api.com/v4/latest/USD');
        $rates = $response->json()['rates'];
        $data = [
            'USD_MZN' => $rates['MZN'],
            'EUR_MZN' => $rates['EUR'] * $rates['MZN'],
            'ZAR_MZN' => $rates['ZAR'] * $rates['MZN'],
            'updated_at' => now(),
        ];

        // Save to cache
        Cache::put('exchange_rates', $data, 3600);

        // Save to database
        ExchangeRate::updateOrCreate(
            ['date' => now()->toDateString()],
            ['usd_mzn' => $rates['MZN'], 'updated_at' => now()]
        );

        return response()->json($data);
    }

    return response()->json($rates);
});
});

