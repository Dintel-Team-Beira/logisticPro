<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_requests', function (Blueprint $table) {
            $table->id();

            // ========================================
            // RELACIONAMENTOS
            // ========================================
            $table->foreignId('shipment_id')
                ->constrained('shipments')
                ->onDelete('cascade');

            $table->foreignId('requested_by')
                ->constrained('users')
                ->onDelete('restrict')
                ->comment('Usuário de Operações que solicitou');

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('restrict')
                ->comment('Gestor que aprovou/rejeitou');

            $table->foreignId('paid_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('restrict')
                ->comment('Usuário de Finanças que processou');

            // ========================================
            // INFORMAÇÕES DO PAGAMENTO
            // ========================================
            $table->string('phase', 50)
                ->comment('Fase: coleta_dispersa, alfandegas, cornelder, etc');

            $table->string('request_type', 50)
                ->comment('Tipo: quotation_payment, customs_tax, storage_fee, etc');

            $table->string('payee', 255)
                ->comment('Destinatário do pagamento (linha, alfândega, cornelder)');

            $table->decimal('amount', 12, 2)
                ->comment('Valor a ser pago');

            $table->char('currency', 3)->default('MZN')
                ->comment('Moeda: MZN, USD, EUR');

            $table->text('description')
                ->comment('Descrição/Justificativa do pagamento');

            // ========================================
            // WORKFLOW & STATUS
            // ========================================
            $table->enum('status', [
                'pending',      // Aguardando aprovação do gestor
                'approved',     // Aprovado, aguardando finanças processar
                'in_payment',   // Finanças está processando
                'paid',         // Pago, comprovativo anexado
                'rejected',     // Rejeitado pelo gestor
                'cancelled'     // Cancelado pelo solicitante
            ])->default('pending')
                ->index()
                ->comment('Status atual da solicitação');

            $table->timestamp('approved_at')->nullable()
                ->comment('Data de aprovação/rejeição');

            $table->timestamp('paid_at')->nullable()
                ->comment('Data do pagamento');

            $table->text('rejection_reason')->nullable()
                ->comment('Motivo da rejeição (se aplicável)');

            $table->text('approval_notes')->nullable()
                ->comment('Observações do aprovador');

            // ========================================
            // DOCUMENTOS RELACIONADOS
            // ========================================
            $table->foreignId('quotation_document_id')
                ->nullable()
                ->constrained('documents')
                ->onDelete('set null')
                ->comment('Cotação anexada (obrigatório para criar)');

            $table->foreignId('payment_proof_id')
                ->nullable()
                ->constrained('documents')
                ->onDelete('set null')
                ->comment('Comprovativo de pagamento (anexado por Finanças)');

            $table->foreignId('receipt_document_id')
                ->nullable()
                ->constrained('documents')
                ->onDelete('set null')
                ->comment('Recibo do fornecedor (anexado por Operações)');

            // ========================================
            // METADADOS & AUDITORIA
            // ========================================
            $table->json('metadata')->nullable()
                ->comment('Dados extras: referências, observações, etc');

            $table->string('payment_reference', 100)->nullable()
                ->comment('Referência bancária do pagamento');

            $table->date('payment_date')->nullable()
                ->comment('Data real do pagamento no banco');

            $table->date('due_date')->nullable()
                ->comment('Data de vencimento (se aplicável)');

            $table->timestamps();
            $table->softDeletes();

            // ========================================
            // ÍNDICES PARA PERFORMANCE
            // ========================================
            $table->index('phase');
            $table->index('request_type');
            $table->index('status');
            $table->index('created_at');
            $table->index(['shipment_id', 'phase']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_requests');
    }
};
