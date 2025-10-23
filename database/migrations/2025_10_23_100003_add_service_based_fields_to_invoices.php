<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Tipo de fatura
            $table->enum('invoice_type', ['process', 'service'])
                ->default('process')
                ->after('invoice_number')
                ->comment('process = baseada em despesas do processo, service = baseada em serviços');

            // Referência à cotação (se veio de uma cotação)
            $table->foreignId('quote_id')
                ->nullable()
                ->after('shipment_id')
                ->constrained('quotes')
                ->onDelete('set null');

            // Campos profissionais adicionais
            $table->text('description')->nullable()->after('status');
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_percentage');
            $table->decimal('subtotal', 12, 2)->nullable()->after('discount_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');

            $table->text('terms')->nullable()->after('notes');
            $table->text('customer_notes')->nullable()->after('terms');
            $table->string('payment_terms')->nullable()->after('customer_notes');
            $table->enum('currency', ['MZN', 'USD', 'EUR'])->default('MZN')->after('payment_terms');
        });

        // Criar tabela para itens de fatura (quando tipo = service)
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('service_catalog')->onDelete('set null');

            // Item details
            $table->string('service_code')->nullable();
            $table->string('service_name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();

            // Pricing
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('unit');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 12, 2);

            // Tax
            $table->enum('tax_type', ['included', 'excluded', 'exempt'])->default('excluded');
            $table->decimal('tax_rate', 5, 2)->default(17.00);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 12, 2);

            // Order
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            $table->index(['invoice_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['quote_id']);
            $table->dropColumn([
                'invoice_type',
                'quote_id',
                'description',
                'discount_percentage',
                'discount_amount',
                'subtotal',
                'tax_amount',
                'terms',
                'customer_notes',
                'payment_terms',
                'currency',
            ]);
        });
    }
};
