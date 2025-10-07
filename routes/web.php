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
use App\Http\Controllers\ShipmentPhaseController;


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

// Fase 1: Coleta de Dispersa
Route::middleware(['auth', 'verified'])->group(function () {

    // CRUD de Shipments
    Route::resource('shipments', ShipmentController::class);

    // Avançar para próxima etapa
    Route::post('/shipments/{shipment}/advance', [\App\Http\Controllers\ShipmentController::class, 'advance'])
        ->name('shipments.advance');

    // Upload de documentos
    Route::post('/shipments/{shipment}/documents/{docType}', [ShipmentController::class, 'uploadDocument'])
        ->name('shipments.documents.upload');

    // ===== FASE 1: COLETA DE DISPERSA =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-004: Solicitar Cotações
        Route::post('/quotation/request', [ShipmentPhaseController::class, 'requestQuotation'])
            ->name('shipments.quotation.request');

        // RF-005: Registrar Cotação Recebida
        Route::post('/quotation/register', [ShipmentPhaseController::class, 'registerQuotation'])
            ->name('shipments.quotation.register');

        // RF-006: Registrar Pagamento
        Route::post('/payment/register', [ShipmentPhaseController::class, 'registerPayment'])
            ->name('shipments.payment.register');

        // RF-007: Registrar Recibo
        Route::post('/receipt/register', [ShipmentPhaseController::class, 'registerReceipt'])
            ->name('shipments.receipt.register');
    });

    // ===== FASE 2: LEGALIZAÇÃO =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-008: Iniciar Legalização
        Route::post('/legalization/start', [ShipmentPhaseController::class, 'startLegalization'])
            ->name('shipments.legalization.start');

        // RF-009: Registrar BL Carimbado
        Route::post('/bl/stamped', [ShipmentPhaseController::class, 'registerStampedBL'])
            ->name('shipments.bl.stamped');

        // RF-010: Registrar Delivery Order
        Route::post('/delivery-order', [ShipmentPhaseController::class, 'registerDeliveryOrder'])
            ->name('shipments.delivery-order');
    });

    // ===== FASE 3: ALFÂNDEGAS =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-011: Submeter Declaração Aduaneira
        Route::post('/customs/declaration', [ShipmentPhaseController::class, 'submitCustomsDeclaration'])
            ->name('shipments.customs.declaration');

        // RF-012: Registrar Aviso de Taxação
        Route::post('/customs/notice', [ShipmentPhaseController::class, 'registerCustomsNotice'])
            ->name('shipments.customs.notice');

        // RF-013: Registrar Pagamento Alfândega
        Route::post('/customs/payment', [ShipmentPhaseController::class, 'registerCustomsPayment'])
            ->name('shipments.customs.payment');

        // RF-014: Registrar Autorização de Saída
        Route::post('/customs/authorization', [ShipmentPhaseController::class, 'registerCustomsAuthorization'])
            ->name('shipments.customs.authorization');
    });

    // ===== FASE 4: CORNELDER =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-015: Solicitar Cotação Cornelder
        Route::post('/cornelder/quotation', [ShipmentPhaseController::class, 'requestCornelderQuotation'])
            ->name('shipments.cornelder.quotation');

        // RF-016: Registrar Draft e Storage
        Route::post('/cornelder/draft', [ShipmentPhaseController::class, 'registerDraftStorage'])
            ->name('shipments.cornelder.draft');

        // RF-017: Registrar Pagamento Cornelder
        Route::post('/cornelder/payment', [ShipmentPhaseController::class, 'registerCornelderPayment'])
            ->name('shipments.cornelder.payment');

        // RF-018: Registrar Recibo Cornelder
        Route::post('/cornelder/receipt', [ShipmentPhaseController::class, 'registerCornelderReceipt'])
            ->name('shipments.cornelder.receipt');
    });

    // ===== FASE 5: TAXAÇÃO =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-019: Preparar Documentos de Taxação
        Route::post('/taxation/prepare', [ShipmentPhaseController::class, 'prepareTaxationDocuments'])
            ->name('shipments.taxation.prepare');

        // RF-020: Gerar Carta de Taxação
        Route::post('/taxation/letter', [ShipmentPhaseController::class, 'generateTaxationLetter'])
            ->name('shipments.taxation.letter');
    });

    // ===== FASE 6: FATURAÇÃO =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-021: Calcular Custos Totais
        Route::get('/invoice/calculate', [ShipmentPhaseController::class, 'calculateTotalCosts'])
            ->name('shipments.invoice.calculate');

        // RF-022: Gerar Fatura
        Route::post('/invoice/generate', [ShipmentPhaseController::class, 'generateInvoice'])
            ->name('shipments.invoice.generate');

        // RF-023: Enviar Fatura ao Cliente
        Route::post('/invoice/send', [ShipmentPhaseController::class, 'sendInvoice'])
            ->name('shipments.invoice.send');

        // RF-024: Registrar Pagamento do Cliente
        Route::post('/invoice/payment', [ShipmentPhaseController::class, 'registerClientPayment'])
            ->name('shipments.invoice.payment');
    });

    // ===== FASE 7: POD (Proof of Delivery) =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // RF-025: Registrar Devolução de Container
        Route::post('/pod/return', [ShipmentPhaseController::class, 'registerContainerReturn'])
            ->name('shipments.pod.return');

        // Completar Processo
        Route::post('/complete', [ShipmentPhaseController::class, 'completeProcess'])
            ->name('shipments.complete');
    });

    // ===== UTILIDADES =====
    Route::prefix('shipments/{shipment}')->group(function () {

        // Obter checklist de documentos
        Route::get('/checklist', [ShipmentPhaseController::class, 'getChecklist'])
            ->name('shipments.checklist');

        // Obter progresso
        Route::get('/progress', [ShipmentPhaseController::class, 'getProgress'])
            ->name('shipments.progress');

        // Ver documento
        Route::get('/documents/{document}', [ShipmentPhaseController::class, 'viewDocument'])
            ->name('shipments.documents.view');

        // Download documento
        Route::get('/documents/{document}/download', [ShipmentPhaseController::class, 'downloadDocument'])
            ->name('shipments.documents.download');
    });
});
require __DIR__.'/auth.php';
