<?php

use App\Http\Controllers\SearchController;
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
});
