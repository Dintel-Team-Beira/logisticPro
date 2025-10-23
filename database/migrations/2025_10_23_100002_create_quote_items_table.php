<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained('quotes')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('service_catalog')->onDelete('set null');

            // Item details
            $table->string('service_code')->nullable(); // Código do serviço (snapshot)
            $table->string('service_name'); // Nome do serviço
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // Categoria (snapshot)

            // Pricing
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('unit'); // Unidade
            $table->decimal('unit_price', 10, 2); // Preço unitário
            $table->decimal('subtotal', 12, 2); // Quantidade × Preço unitário

            // Tax
            $table->enum('tax_type', ['included', 'excluded', 'exempt'])->default('excluded');
            $table->decimal('tax_rate', 5, 2)->default(17.00); // Taxa de IVA
            $table->decimal('tax_amount', 10, 2)->default(0); // Valor do IVA
            $table->decimal('total', 12, 2); // Total com IVA

            // Order
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            $table->index(['quote_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};
