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
   // database/migrations/xxxx_create_budgets_table.php
Schema::create('budgets', function (Blueprint $table) {
    $table->id();
    $table->string('category'); // Categoria do orçamento
    $table->text('description')->nullable();
    $table->decimal('amount', 12, 2); // Valor do orçamento
    $table->decimal('spent', 12, 2)->default(0); // Quanto já foi gasto
    $table->year('year'); // Ano do orçamento
    $table->timestamps();

    // Índices
    $table->index(['year', 'category']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
