<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique(); // Número da cotação (QT-2025-001)
            $table->foreignId('client_id')->constrained('clients')->onDelete('restrict');
            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->onDelete('set null');

            // Informações básicas
            $table->string('title'); // Título/Referência
            $table->text('description')->nullable();
            $table->date('quote_date'); // Data da cotação
            $table->date('valid_until'); // Válido até

            // Status
            $table->enum('status', [
                'draft', // Rascunho
                'sent', // Enviada ao cliente
                'viewed', // Visualizada pelo cliente
                'accepted', // Aceita
                'rejected', // Rejeitada
                'expired', // Expirada
                'converted' // Convertida em fatura
            ])->default('draft');

            // Valores
            $table->decimal('subtotal', 12, 2)->default(0); // Subtotal (sem impostos)
            $table->decimal('discount_percentage', 5, 2)->default(0); // Desconto em %
            $table->decimal('discount_amount', 10, 2)->default(0); // Desconto em valor
            $table->decimal('tax_amount', 10, 2)->default(0); // Total de impostos
            $table->decimal('total', 12, 2)->default(0); // Total final

            // Termos e condições
            $table->text('terms')->nullable(); // Termos e condições
            $table->text('notes')->nullable(); // Notas internas
            $table->text('customer_notes')->nullable(); // Notas para o cliente

            // Condições de pagamento
            $table->string('payment_terms')->nullable(); // Ex: "30 dias", "À vista"
            $table->enum('currency', ['MZN', 'USD', 'EUR'])->default('MZN');

            // Conversão para fatura
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->timestamp('converted_at')->nullable();

            // Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'quote_date']);
            $table->index(['client_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
