<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabela de Recibos - Comprovantes de pagamento de faturas
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique(); // REC-2025-0001

            // Relacionamentos
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('restrict');
            $table->foreignId('client_id')->constrained('clients')->onDelete('restrict');

            // Informações de pagamento
            $table->date('payment_date');
            $table->decimal('amount', 12, 2); // Valor pago
            $table->enum('payment_method', [
                'cash',           // Dinheiro
                'bank_transfer',  // Transferência bancária
                'cheque',         // Cheque
                'mpesa',          // M-Pesa
                'emola',          // E-Mola
                'credit_card',    // Cartão de crédito
                'debit_card',     // Cartão de débito
                'other'           // Outro
            ]);
            $table->string('payment_reference')->nullable(); // Nº transferência, cheque, etc.
            $table->enum('currency', ['MZN', 'USD', 'EUR'])->default('MZN');

            // Informações adicionais
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable(); // PDF do recibo

            // Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['client_id', 'payment_date']);
            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
