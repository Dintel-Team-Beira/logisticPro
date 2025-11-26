<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabela de Notas de Débito - Cobranças adicionais
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('debit_note_number')->unique(); // DN-2025-0001

            // Relacionamentos
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('restrict');
            $table->foreignId('client_id')->constrained('clients')->onDelete('restrict');

            // Informações básicas
            $table->date('issue_date');
            $table->enum('reason', [
                'additional_charges',  // Custos adicionais
                'late_fees',          // Juros de mora
                'penalties',          // Multas
                'billing_correction', // Correção de faturação
                'exchange_difference',// Diferença cambial
                'other'               // Outro motivo
            ]);
            $table->text('reason_description')->nullable();

            // Valores
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->enum('currency', ['MZN', 'USD', 'EUR'])->default('MZN');

            // Status
            $table->enum('status', [
                'draft',    // Rascunho
                'issued',   // Emitida
                'applied',  // Aplicada (adicionada à fatura)
                'cancelled' // Cancelada
            ])->default('draft');

            // Informações adicionais
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable();

            // Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['client_id', 'issue_date']);
            $table->index('invoice_id');
        });

        // Itens da nota de débito
        Schema::create('debit_note_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debit_note_id')->constrained('debit_notes')->onDelete('cascade');

            // Detalhes do item
            $table->string('description');
            $table->decimal('quantity', 10, 2);
            $table->string('unit')->default('unit');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_rate', 5, 2)->default(17.00);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('total', 12, 2);

            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debit_note_items');
        Schema::dropIfExists('debit_notes');
    }
};
