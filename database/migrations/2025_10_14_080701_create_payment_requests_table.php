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
       // Migration: create_payment_requests_table.php
Schema::create('payment_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('shipment_id')->constrained();
    $table->string('phase'); // coleta_dispersa, alfandegas, cornelder
    $table->string('request_type'); // quotation_payment, customs_tax, storage_fee
    $table->string('payee'); // shipping_line, customs, cornelder

    // Valores
    $table->decimal('amount', 10, 2);
    $table->string('currency', 3)->default('MZN');
    $table->text('description');
    $table->json('metadata')->nullable(); // docs, referências

    // Workflow
    $table->enum('status', [
        'pending',           // Aguardando aprovação
        'approved',          // Aprovado por gestor
        'in_payment',        // Finanças processando
        'paid',              // Pago
        'rejected',          // Rejeitado
        'cancelled'          // Cancelado
    ])->default('pending');

    // Controle
    $table->foreignId('requested_by')->constrained('users'); // Operações
    $table->foreignId('approved_by')->nullable()->constrained('users'); // Gestor
    $table->foreignId('paid_by')->nullable()->constrained('users'); // Finanças
    $table->timestamp('approved_at')->nullable();
    $table->timestamp('paid_at')->nullable();
    $table->text('rejection_reason')->nullable();

    // Documentos
    $table->foreignId('quotation_document_id')->nullable()->constrained('documents');
    $table->foreignId('payment_proof_id')->nullable()->constrained('documents');
    $table->foreignId('receipt_document_id')->nullable()->constrained('documents');

    $table->timestamps();
    $table->softDeletes();
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
