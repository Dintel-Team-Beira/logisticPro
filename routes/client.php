<?php
// ============================================================================
// CLIENT PORTAL - Área exclusiva para clientes
// ============================================================================
use App\Http\Controllers\Client\ClientAuthController;
use App\Http\Controllers\Client\ClientPortalController;
use Illuminate\Support\Facades\Route;

// Client Authentication Routes (public)
Route::prefix('client')->name('client.')->group(function () {
    // Login
    Route::get('/login', [ClientAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [ClientAuthController::class, 'login']);

    // Initial Setup (first access with token)
    Route::get('/setup', [ClientAuthController::class, 'showInitialSetup'])->name('initial-setup.show');
    Route::post('/setup', [ClientAuthController::class, 'initialSetup'])->name('initial-setup');

    // Forgot Password
    Route::get('/forgot-password', [ClientAuthController::class, 'showForgotPassword'])->name('forgot-password');
    Route::post('/forgot-password', [ClientAuthController::class, 'forgotPassword']);

    // Logout
    Route::post('/logout', [ClientAuthController::class, 'logout'])->middleware('auth:client')->name('logout');
});

// Client Portal Routes (authenticated)
Route::prefix('client')->name('client.')->middleware('auth:client')->group(function () {
    // Dashboard
    Route::get('/dashboard', [ClientPortalController::class, 'dashboard'])->name('dashboard');

    // Shipments
    Route::get('/shipments', [ClientPortalController::class, 'shipments'])->name('shipments');
    Route::get('/shipments/{id}', [ClientPortalController::class, 'shipmentShow'])->name('shipments.show');

    // Documents
    Route::get('/documents', [ClientPortalController::class, 'documents'])->name('documents');
    Route::get('/documents/{id}/download', [ClientPortalController::class, 'documentDownload'])->name('documents.download');

    // Invoices
    Route::get('/invoices', [ClientPortalController::class, 'invoices'])->name('invoices');
    Route::get('/invoices/{id}', [ClientPortalController::class, 'invoiceShow'])->name('invoices.show');

    // Quotes
    Route::get('/quotes', [ClientPortalController::class, 'quotes'])->name('quotes');
    Route::get('/quotes/{id}', [ClientPortalController::class, 'quoteShow'])->name('quotes.show');
    Route::post('/quotes/{id}/accept', [ClientPortalController::class, 'quoteAccept'])->name('quotes.accept');
    Route::post('/quotes/{id}/reject', [ClientPortalController::class, 'quoteReject'])->name('quotes.reject');
});
