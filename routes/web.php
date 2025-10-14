<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StageController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentRequestController;
use App\Http\Controllers\ShippingLineController;
use App\Http\Controllers\ShipmentPhaseController;

/*
|--------------------------------------------------------------------------
| LOGISTICA PRO - ROTAS COMPLETAS
|--------------------------------------------------------------------------
| Sistema de Gestão de Operações de Importação
| Desenvolvido por: Arnaldo Tomo
|--------------------------------------------------------------------------
*/

// ============================================================================
// HOME / LANDING
// ============================================================================
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('app');

// ============================================================================
// DASHBOARD
// ============================================================================
Route::get('/dashboard', [DashboardController::class,'index'])->middleware(['auth', 'verified'])->name('dashboard');
// ============================================================================
// PROFILE
// ============================================================================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// ============================================================================
// SOLICITAÇÕES DE PAGAMENTO - AÇÕES
// ============================================================================
Route::middleware(['auth'])->prefix('payment-requests')->name('payment-requests.')->group(function () {

    // ========================================
    // OPERAÇÕES - CRIAR E GERENCIAR
    // ========================================

    /**
     * Criar Nova Solicitação
     * Usado por: Operações
     * Requer: Anexar cotação
     */
    Route::post('/{shipment}', [PaymentRequestController::class, 'store'])
        ->name('store')
        ->middleware('can:create_payment_request');

    /**
     * Cancelar Solicitação (apenas quem criou)
     * Status deve estar 'pending'
     */
    Route::post('/{paymentRequest}/cancel', [PaymentRequestController::class, 'cancel'])
        ->name('cancel');

    /**
     * Anexar Recibo do Fornecedor
     * Usado por: Operações (após pagamento confirmado)
     */
    Route::post('/{paymentRequest}/attach-receipt', [PaymentRequestController::class, 'attachReceipt'])
        ->name('attach-receipt')
        ->middleware('can:attach_receipt');

    // ========================================
    // GESTORES - APROVAÇÃO
    // ========================================

    /**
     * Aprovar Solicitação
     * Usado por: Gestores/Admin
     * Ação: pending → approved
     */
    Route::post('/{paymentRequest}/approve', [PaymentRequestController::class, 'approve'])
        ->name('approve')
        ->middleware('can:approve_payment_request');

    /**
     * Rejeitar Solicitação
     * Usado por: Gestores/Admin
     * Ação: pending → rejected
     * Requer: Motivo da rejeição
     */
    Route::post('/{paymentRequest}/reject', [PaymentRequestController::class, 'reject'])
        ->name('reject')
        ->middleware('can:approve_payment_request');

    // ========================================
    // FINANÇAS - PROCESSAMENTO
    // ========================================

    /**
     * Iniciar Processamento de Pagamento
     * Usado por: Finanças
     * Ação: approved → in_payment
     */
    Route::post('/{paymentRequest}/start-payment', [PaymentRequestController::class, 'startPayment'])
        ->name('start-payment')
        ->middleware('can:process_payment');

    /**
     * Confirmar Pagamento com Comprovativo
     * Usado por: Finanças
     * Ação: in_payment → paid
     * Requer: Upload de comprovativo
     */
    Route::post('/{paymentRequest}/confirm-payment', [PaymentRequestController::class, 'confirmPayment'])
        ->name('confirm-payment')
        ->middleware('can:process_payment');

    // ========================================
    // VISUALIZAÇÃO E DETALHES
    // ========================================

    /**
     * Ver Detalhes da Solicitação
     * Todos os departamentos podem ver
     */
    Route::get('/{paymentRequest}', [PaymentRequestController::class, 'show'])
        ->name('show');

    /**
     * Lista de Solicitações (para o usuário logado)
     */
    Route::get('/', [PaymentRequestController::class, 'index'])
        ->name('index');

    /**
     * Download de Documentos da Solicitação
     */
    Route::get('/{paymentRequest}/documents/{type}', [PaymentRequestController::class, 'downloadDocument'])
        ->name('download-document')
        ->where('type', 'quotation|payment_proof|receipt');
});

// ============================================================================
// GESTÃO - APROVAÇÕES PENDENTES (Para Gestores)
// ============================================================================
Route::middleware(['auth', 'can:approve_payment_request'])
    ->prefix('approvals')
    ->name('approvals.')
    ->group(function () {

        /**
         * Dashboard de Aprovações
         * Lista todas solicitações pendentes
         */
        Route::get('/', [PaymentRequestController::class, 'approvalsDashboard'])
            ->name('dashboard');

        /**
         * Aprovação em Lote
         * Aprovar múltiplas solicitações de uma vez
         */
        Route::post('/batch-approve', [PaymentRequestController::class, 'batchApprove'])
            ->name('batch-approve');
    });

// ============================================================================
// NOTIFICAÇÕES - Sistema de Notificações
// ============================================================================
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->group(function () {

    /**
     * Marcar notificação como lida
     */
    Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('mark-read');

    /**
     * Marcar todas como lidas
     */
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('mark-all-read');
});

// ============================================================================
// WEBHOOKS - Para integrações externas (opcional)
// ============================================================================
Route::post('/webhooks/payment-confirmation', [PaymentRequestController::class, 'webhookPaymentConfirmation'])
    ->name('webhooks.payment-confirmation');


// ============================================================================
// FINANÇAS - DEPARTAMENTO FINANCEIRO
// ============================================================================
Route::middleware(['auth'])->prefix('finance')->name('finance.')->group(function () {

    // Dashboard Financeiro
    Route::get('/', [PaymentRequestController::class, 'financeDashboard'])
        ->name('dashboard')
        ->middleware('can:view_finance_dashboard');

    // Solicitações Pendentes (Para Processar)
    Route::get('/pending', [PaymentRequestController::class, 'pendingRequests'])
        ->name('pending')
        ->middleware('can:process_payment');

    // Histórico de Pagamentos
    Route::get('/payments', [PaymentRequestController::class, 'paymentsHistory'])
        ->name('payments')
        ->middleware('can:view_payments');

    // Relatórios Financeiros
    Route::get('/reports', [PaymentRequestController::class, 'financialReports'])
        ->name('reports')
        ->middleware('can:view_finance_reports');
});

// ============================================================================
// SHIPMENTS (Processos de Importação) - CRUD Completo
// ============================================================================
Route::middleware(['auth'])->group(function () {
    // CRUD
   // ============================================================================
// SHIPMENTS - ADICIONAR ESTAS ROTAS AQUI 👇👇👇
// ============================================================================
    Route::resource('shipments', ShipmentController::class);

    // ========================================
    // SHIPMENTS - GESTÃO DE FASES (NOVAS ROTAS)
    // ========================================
    Route::prefix('shipments/{shipment}')->group(function () {

        // Avançar/Iniciar Fase
        Route::post('/advance', [ShipmentController::class, 'advance'])
            ->name('shipments.advance');

        // Completar Fase
        Route::post('/complete-phase', [ShipmentController::class, 'completePhase'])
            ->name('shipments.complete-phase');

        // Pausar Fase
        Route::post('/pause-phase', [ShipmentController::class, 'pausePhase'])
            ->name('shipments.pause-phase');

        // API: Validação de Fase
        Route::get('/phase/{phase}/validation', [ShipmentController::class, 'getPhaseValidation'])
            ->name('shipments.phase-validation');

        // Upload de Documentos
        Route::post('/documents', [DocumentController::class, 'store'])
            ->name('documents.store');
    });

     // APIs
    Route::get('/shipments/{shipment}/progress', [ShipmentController::class, 'getProgress'])
        ->name('shipments.progress');

    Route::get('/shipments/{shipment}/checklist', [ShipmentController::class, 'getChecklist'])
        ->name('shipments.checklist');

            // Advance
    Route::post('/shipments/{shipment}/advance', [ShipmentController::class, 'advance'])
        ->name('shipments.advance');
    // ========================================
    // DOCUMENTS - Outras Ações
    // ========================================
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])
        ->name('documents.download');

    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])
        ->name('documents.destroy');

          // Documents
    Route::post('/shipments/{shipment}/documents', [DocumentController::class, 'store'])
        ->name('documents.store');
});




// web.php
Route::middleware(['auth'])->group(function () {

    // FINANÇAS
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/', [PaymentRequestController::class, 'financeDashboard'])
            ->name('dashboard');
        Route::get('/pending', [PaymentRequestController::class, 'pendingRequests'])
            ->name('pending');
        Route::get('/payments', [PaymentRequestController::class, 'paymentsHistory'])
            ->name('payments');
    });

    // SOLICITAÇÕES
    Route::prefix('payment-requests')->name('payment-requests.')->group(function () {
        Route::post('/{shipment}', [PaymentRequestController::class, 'store'])
            ->name('store');
        Route::post('/{paymentRequest}/approve', [PaymentRequestController::class, 'approve'])
            ->name('approve');
        Route::post('/{paymentRequest}/reject', [PaymentRequestController::class, 'reject'])
            ->name('reject');
        Route::post('/{paymentRequest}/start-payment', [PaymentRequestController::class, 'startPayment'])
            ->name('start-payment');
        Route::post('/{paymentRequest}/confirm-payment', [PaymentRequestController::class, 'confirmPayment'])
            ->name('confirm-payment');
        Route::post('/{paymentRequest}/attach-receipt', [PaymentRequestController::class, 'attachReceipt'])
            ->name('attach-receipt');
    });
});


   // 🆕 ROTAS DE CLIENTES 🆕
    Route::prefix('clients')->name('clients.')->group(function () {
        // CRUD Routes
        Route::get('/', [ClientController::class, 'index'])->name('index');
        Route::get('/create', [ClientController::class, 'create'])->name('create');
        Route::post('/', [ClientController::class, 'store'])->name('store');
        Route::get('/{client}', [ClientController::class, 'show'])->name('show');
        Route::get('/{client}/edit', [ClientController::class, 'edit'])->name('edit');
        Route::put('/{client}', [ClientController::class, 'update'])->name('update');
        Route::delete('/{client}', [ClientController::class, 'destroy'])->name('destroy');

        // Action Routes
        Route::post('/{client}/toggle-active', [ClientController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/{client}/block', [ClientController::class, 'block'])->name('block');
        Route::post('/{client}/unblock', [ClientController::class, 'unblock'])->name('unblock');

        // Export Route
        Route::get('/export', [ClientController::class, 'export'])->name('export');

        // AJAX Routes
        Route::get('/{client}/shipments', [ClientController::class, 'getShipments'])->name('shipments');
        Route::get('/{client}/stats', [ClientController::class, 'getStats'])->name('stats');
    });

// ============================================================================
// OPERAÇÕES - 7 FASES DO PROCESSO DE IMPORTAÇÃO
// ============================================================================
Route::middleware(['auth'])->prefix('operations')->name('operations.')->group(function () {

    // ====================================
    // FASE 1: COLETA DE DISPERSA
    // ====================================
    Route::get('/coleta', [OperationsController::class, 'coletaDispersa'])
        ->name('coleta');

    // RF-004: Solicitar Cotações
    Route::post('/shipments/{shipment}/quotations/request', [ShipmentPhaseController::class, 'requestQuotation'])
        ->name('shipments.quotations.request');

    // RF-005: Registrar Cotação Recebida
    Route::post('/shipments/{shipment}/quotations/register', [ShipmentPhaseController::class, 'registerQuotation'])
        ->name('shipments.quotations.register');

    // RF-006: Escolher Linha e Pagar Frete
    Route::post('/shipments/{shipment}/select-line', [ShipmentPhaseController::class, 'selectShippingLine'])
        ->name('shipments.select-line');
    Route::post('/shipments/{shipment}/pay-freight', [ShipmentPhaseController::class, 'payFreight'])
        ->name('shipments.pay-freight');

    // ====================================
    // FASE 2: LEGALIZAÇÃO
    // ====================================
    Route::get('/legalizacao', [OperationsController::class, 'legalizacao'])
        ->name('legalizacao');

    // RF-007: Carimbar BL
    Route::post('/shipments/{shipment}/stamp-bl', [ShipmentPhaseController::class, 'stampBL'])
        ->name('shipments.stamp-bl');

    // RF-008: Emitir Delivery Order
    Route::post('/shipments/{shipment}/issue-delivery-order', [ShipmentPhaseController::class, 'issueDeliveryOrder'])
        ->name('shipments.issue-delivery-order');

    // ====================================
    // FASE 3: ALFÂNDEGAS
    // ====================================
    Route::get('/alfandegas', [OperationsController::class, 'alfandegas'])
        ->name('alfandegas');

    // RF-009: Submeter Documentos à Alfândega
    Route::post('/shipments/{shipment}/submit-customs', [ShipmentPhaseController::class, 'submitToCustoms'])
        ->name('shipments.submit-customs');

    // RF-010: Obter Aviso de Taxação
    Route::post('/shipments/{shipment}/get-tax-notice', [ShipmentPhaseController::class, 'getTaxNotice'])
        ->name('shipments.get-tax-notice');

    // RF-011: Pagar Taxas Alfandegárias
    Route::post('/shipments/{shipment}/pay-customs', [ShipmentPhaseController::class, 'payCustomsTax'])
        ->name('shipments.pay-customs');

    // RF-012: Obter Autorização de Saída
    Route::post('/shipments/{shipment}/get-authorization', [ShipmentPhaseController::class, 'getCustomsAuthorization'])
        ->name('shipments.get-authorization');

    // ====================================
    // FASE 4: CORNELDER
    // ====================================
    Route::get('/cornelder', [OperationsController::class, 'cornelder'])
        ->name('cornelder');

    // RF-013: Obter Draft Cornelder
    Route::post('/shipments/{shipment}/get-draft', [ShipmentPhaseController::class, 'getCornelderDraft'])
        ->name('shipments.get-draft');

    // RF-014: Pagar Storage
    Route::post('/shipments/{shipment}/pay-storage', [ShipmentPhaseController::class, 'payStorage'])
        ->name('shipments.pay-storage');

    // RF-015: Emitir Recibo Cornelder
    Route::post('/shipments/{shipment}/cornelder-receipt', [ShipmentPhaseController::class, 'issueCornelderReceipt'])
        ->name('shipments.cornelder-receipt');

    // ====================================
    // FASE 5: TAXAÇÃO
    // ====================================
    Route::get('/taxacao', [OperationsController::class, 'taxacao'])
        ->name('taxacao');

    // RF-016: Emitir SAD
    Route::post('/shipments/{shipment}/issue-sad', [ShipmentPhaseController::class, 'issueSAD'])
        ->name('shipments.issue-sad');

    // RF-017: Processar IDO
    Route::post('/shipments/{shipment}/process-ido', [ShipmentPhaseController::class, 'processIDO'])
        ->name('shipments.process-ido');

    // ====================================
    // FASE 6: FATURAÇÃO
    // ====================================
    Route::get('/faturacao', [OperationsController::class, 'faturacao'])
        ->name('financas'); // Alias financas

    // RF-020: Calcular Custos Totais
    Route::post('/shipments/{shipment}/calculate-costs', [ShipmentPhaseController::class, 'calculateTotalCosts'])
        ->name('shipments.calculate-costs');

    // RF-021: Aplicar Margem de Lucro
    Route::post('/shipments/{shipment}/apply-margin', [ShipmentPhaseController::class, 'applyProfitMargin'])
        ->name('shipments.apply-margin');

    // RF-022: Gerar Fatura ao Cliente
    Route::post('/shipments/{shipment}/generate-invoice', [ShipmentPhaseController::class, 'generateClientInvoice'])
        ->name('shipments.generate-invoice');

    // RF-023: Enviar Fatura ao Cliente
    Route::post('/shipments/{shipment}/send-invoice', [ShipmentPhaseController::class, 'sendInvoice'])
        ->name('shipments.send-invoice');

    // RF-024: Registrar Pagamento do Cliente
    Route::post('/shipments/{shipment}/register-payment', [ShipmentPhaseController::class, 'registerClientPayment'])
        ->name('shipments.register-payment');

    // ====================================
    // FASE 7: POD (Proof of Delivery)
    // ====================================
    Route::get('/pod', [OperationsController::class, 'pod'])
        ->name('pod');

    // RF-025: Registrar Devolução de Container
    Route::post('/shipments/{shipment}/register-return', [ShipmentPhaseController::class, 'registerContainerReturn'])
        ->name('shipments.register-return');

    // Completar Processo
    Route::post('/shipments/{shipment}/complete', [ShipmentPhaseController::class, 'completeProcess'])
        ->name('shipments.complete');
});

// ============================================================================
// DOCUMENTOS - Gestão de Documentos
// ============================================================================
Route::middleware(['auth'])->group(function () {

    // RF-035: Repositório Centralizado de Documentos
    Route::get('/documents', [DocumentController::class, 'index'])
        ->name('documents.index');

    // Upload de Documentos
    Route::post('/shipments/{shipment}/documents', [DocumentController::class, 'store'])
        ->name('documents.store');

    // Visualizar Documento
    Route::get('/documents/{document}', [DocumentController::class, 'show'])
        ->name('documents.show');

    // Download Documento
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])
        ->name('documents.download');

    // Deletar Documento
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])
        ->name('documents.destroy');

    // Buscar Documentos
    Route::get('/documents/search', [DocumentController::class, 'search'])
        ->name('documents.search');
});

// ============================================================================
// FINANÇAS / INVOICES - Gestão de Faturas
// ============================================================================
Route::middleware(['auth'])->group(function () {

    // CRUD de Faturas
    Route::resource('invoices', InvoiceController::class);

    // Marcar Fatura como Paga
    Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'markAsPaid'])
        ->name('invoices.pay');

    // Gerar PDF da Fatura
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'generatePDF'])
        ->name('invoices.pdf');

    // Enviar Fatura por Email
    Route::post('/invoices/{invoice}/send', [InvoiceController::class, 'sendEmail'])
        ->name('invoices.send');

    // Dashboard Financeiro
    Route::get('/financial-dashboard', [InvoiceController::class, 'dashboard'])
        ->name('invoices.dashboard');


    // ->middleware('role:admin');
});

    Route::put('/invoices', [SettingsController::class, 'updateInvoiceSettings'])
    ->name('settings.invoices.update');
// ============================================================================
// RELATÓRIOS - RF-028, RF-029, RF-030
// ============================================================================
Route::middleware(['auth'])->prefix('reports')->name('reports.')->group(function () {

    // Dashboard de Relatórios
    Route::get('/', [ReportController::class, 'index'])
        ->name('index');

    // RF-028: Relatório de Processos
    Route::get('/processes', [ReportController::class, 'processesReport'])
        ->name('processes');
    Route::post('/processes/export', [ReportController::class, 'exportProcesses'])
        ->name('processes.export');

    // RF-029: Relatório Financeiro
    Route::get('/financial', [ReportController::class, 'financialReport'])
        ->name('financial');
    Route::post('/financial/export', [ReportController::class, 'exportFinancial'])
        ->name('financial.export');

    // RF-030: Relatório de Performance Operacional
    Route::get('/performance', [ReportController::class, 'performanceReport'])
        ->name('performance');
    Route::post('/performance/export', [ReportController::class, 'exportPerformance'])
        ->name('performance.export');

    // Exportação Geral
    Route::post('/export', [ReportController::class, 'export'])
        ->name('export');

    // Relatório Customizado
    Route::post('/custom-range', [ReportController::class, 'customRange'])
        ->name('custom-range');
});

// ============================================================================
// CLIENTES - RF-031: CRUD de Clientes
// ============================================================================
Route::middleware(['auth'])->group(function () {

    // CRUD Completo de Clientes
    Route::resource('clients', ClientController::class);

    // Ativar/Desativar Cliente
    Route::patch('/clients/{client}/toggle-status', [ClientController::class, 'toggleStatus'])
        ->name('clients.toggle-status');

    // Histórico de Processos do Cliente
    Route::get('/clients/{client}/shipments', [ClientController::class, 'shipments'])
        ->name('clients.shipments');

    // Relatório Financeiro do Cliente
    Route::get('/clients/{client}/financial', [ClientController::class, 'financial'])
        ->name('clients.financial');
});

// ============================================================================
// LINHAS DE NAVEGAÇÃO - RF-032: CRUD de Linhas
// ============================================================================
Route::middleware(['auth'])->group(function () {

    // CRUD Completo de Shipping Lines
    Route::resource('shipping-lines', ShippingLineController::class);

    // Ativar/Desativar Linha
    Route::patch('/shipping-lines/{shippingLine}/toggle-status', [ShippingLineController::class, 'toggleStatus'])
        ->name('shipping-lines.toggle-status');

    // Histórico de Processos da Linha
    Route::get('/shipping-lines/{shippingLine}/shipments', [ShippingLineController::class, 'shipments'])
        ->name('shipping-lines.shipments');

    // Estatísticas da Linha
    Route::get('/shipping-lines/{shippingLine}/stats', [ShippingLineController::class, 'statistics'])
        ->name('shipping-lines.stats');
});

// ============================================================================
// USUÁRIOS - Gestão de Usuários (Admin Only)
// ============================================================================
Route::middleware(['auth'])->prefix('users')->name('users.')->group(function () {

    // CRUD de Usuários
    Route::resource('/', UserController::class)->parameters(['' => 'user']);

    // Ativar/Desativar Usuário
    Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('toggle-status');

    // Redefinir Senha
    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('reset-password');

    // Histórico de Atividades do Usuário
    Route::get('/{user}/activities', [UserController::class, 'activities'])
        ->name('activities');

    // Atualizar Permissões
    Route::patch('/{user}/permissions', [UserController::class, 'updatePermissions'])
        ->name('permissions');
});

// ============================================================================
// CONFIGURAÇÕES - RF-033: Configurações Gerais
// ============================================================================
Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function () {

    // Dashboard de Configurações
    Route::get('/', [SettingsController::class, 'index'])
        ->name('index');

    // Configurações Financeiras
    Route::get('/financial', [SettingsController::class, 'financial'])
        ->name('financial');
    Route::post('/financial', [SettingsController::class, 'updateFinancial'])
        ->name('financial.update');

    // Configurações de Notificações
    Route::get('/notifications', [SettingsController::class, 'notifications'])
        ->name('notifications');
    Route::post('/notifications', [SettingsController::class, 'updateNotifications'])
        ->name('notifications.update');

    // Configurações de Documentos
    Route::get('/documents', [SettingsController::class, 'documents'])
        ->name('documents');
    Route::post('/documents', [SettingsController::class, 'updateDocuments'])
        ->name('documents.update');
    Route::post('/documents/logo', [SettingsController::class, 'uploadLogo'])
        ->name('documents.logo');

    // Configurações de Usuários/Permissões
    Route::get('/permissions', [SettingsController::class, 'permissions'])
        ->name('permissions');
    Route::post('/permissions', [SettingsController::class, 'updatePermissions'])
        ->name('permissions.update');

    // Backup
    Route::post('/backup', [SettingsController::class, 'backup'])
        ->name('backup');
});

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->group(function () {

    // Listar Notificações
    Route::get('/', [NotificationController::class, 'index'])
        ->name('index');

    // Marcar como Lida
    Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('read');

    // Marcar Todas como Lidas
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('read-all');

    // Deletar Notificação
    Route::delete('/{notification}', [NotificationController::class, 'destroy'])
        ->name('destroy');

    // Contar Não Lidas
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])
        ->name('unread-count');
});

// ============================================================================
// STAGES - Atualização de Status de Fases
// ============================================================================
Route::middleware(['auth'])->group(function () {
    Route::post('/shipments/{shipment}/stages/{stage}/status', [StageController::class, 'updateStatus'])
        ->name('stages.update-status');
});

// ============================================================================
// API ENDPOINTS (Opcional - para futuro mobile app)
// ============================================================================
Route::middleware(['auth:sanctum'])->prefix('api')->name('api.')->group(function () {

    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
        ->name('dashboard.stats');

    // Shipments API
    Route::apiResource('shipments', ShipmentController::class);

    // Quick Search
    Route::get('/search', [ShipmentController::class, 'quickSearch'])
        ->name('search');
});

// ============================================================================
// AUDITORIA - RF-036: Logs de Auditoria (Admin Only)
// ============================================================================
Route::middleware(['auth'])->prefix('audit')->name('audit.')->group(function () {

    Route::get('/', [AuditController::class, 'index'])
        ->name('index');

    Route::get('/logs', [AuditController::class, 'logs'])
        ->name('logs');

    Route::get('/export', [AuditController::class, 'export'])
        ->name('export');
});



// ============================================================================
// CONFIGURAÇÕES - RF-033: Configurações Gerais do Sistema
// ============================================================================
Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function () {

    // Dashboard de Configurações
    Route::get('/', [SettingsController::class, 'index'])->name('index');

    // ========================================
    // PERFIL DO USUÁRIO
    // ========================================

    // RF-033.1: Atualizar Perfil
    Route::put('/profile', [SettingsController::class, 'updateProfile'])
        ->name('profile.update');

    // RF-033.2: Upload de Avatar
    Route::post('/profile/avatar', [SettingsController::class, 'uploadAvatar'])
        ->name('profile.avatar');

    // RF-033.3: Alterar Senha
    Route::put('/password', [SettingsController::class, 'updatePassword'])
        ->name('password.update');

    // ========================================
    // PREFERÊNCIAS DO SISTEMA
    // ========================================

    // RF-033.4: Preferências de Interface
    Route::put('/preferences', [SettingsController::class, 'updatePreferences'])
        ->name('preferences.update');

    // RF-033.5: Configurações de Notificação
    Route::put('/notifications', [SettingsController::class, 'updateNotifications'])
        ->name('notifications.update');

    // ========================================
    // CONFIGURAÇÕES DA EMPRESA (Admin Only)
    // ========================================

    // RF-033.6: Dados da Empresa
    Route::put('/company', [SettingsController::class, 'updateCompany'])
        ->name('company.update');
        // ->middleware('role:admin');

    // RF-033.7: Configurações de Faturação
    Route::put('/invoices', [SettingsController::class, 'updateInvoiceSettings'])
        ->name('invoices.update');
        // ->middleware('role:admin');

    // ========================================
    // API E INTEGRAÇÕES
    // ========================================

    // RF-033.8: Gerar Token API
    Route::post('/api-token', [SettingsController::class, 'generateApiToken'])
        ->name('api-token.generate');

    // RF-033.9: Configurar Webhooks
    Route::put('/webhooks', [SettingsController::class, 'updateWebhooks'])
        ->name('webhooks.update');
        // ->middleware('role:admin');
});

// ============================================================================
// API ROUTES - Para acesso externo
// ============================================================================
Route::middleware(['auth:sanctum'])->prefix('api/v1')->group(function () {

    // Obter configurações do usuário
    Route::get('/settings', function () {
        return response()->json([
            'user' => auth()->user(),
            'settings' => auth()->user()->settings,
        ]);
    });

    // Obter configurações da empresa
    Route::get('/company-settings', function () {
        return response()->json(
            \App\Models\CompanySetting::getInstance()
        );
    });
});
// ============================================================================
// AUTENTICAÇÃO
// ============================================================================
require __DIR__.'/auth.php';
