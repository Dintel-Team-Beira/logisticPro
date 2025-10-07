<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\ShippingLineController;


// routes/web.php
// Route::get('/', function () {
//     return Inertia::render('Landing'); // Página de apresentação
// })->name('home');

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('app');


// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });



Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => [
            'total_revenue' => 234567,
            'active_shipments' => 23,
            'in_customs' => 5,
            'completion_rate' => 94.2,
        ],
        'shipments' => [], // Depois você busca do banco
        'revenue' => [], // Dados de receita
        'activities' => [], // Atividades recentes
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



// Protected routes
Route::middleware(['auth'])->group(function () {



    // Shipments
    Route::resource('shipments', ShipmentController::class);

    // Documents
    Route::prefix('shipments/{shipment}')->group(function () {
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    });
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Stages
    Route::post('/shipments/{shipment}/stages/{stage}/status', [StageController::class, 'updateStatus'])
        ->name('stages.update-status');

    // Invoices
    Route::resource('invoices', InvoiceController::class);
    Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'markAsPaid'])
        ->name('invoices.pay');

    // Shipping Lines (Admin/Manager only)
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::resource('shipping-lines', ShippingLineController::class);
    });

    // Reports (Admin/Manager only)
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // Users (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('users', UserController::class);
    });

    // Reports com rotas extras
Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::post('/reports/custom-range', [ReportController::class, 'customRange'])->name('reports.custom-range');
});

// Shipping Lines com toggle status
Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::resource('shipping-lines', ShippingLineController::class);
    Route::patch('/shipping-lines/{shippingLine}/toggle-status', [ShippingLineController::class, 'toggleStatus'])
        ->name('shipping-lines.toggle-status');
});

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
require __DIR__.'/auth.php';
