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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3); // USD, EUR, ZAR, etc
            $table->string('to_currency', 3)->default('MZN');
            $table->decimal('rate', 12, 6); // Taxa de câmbio
            $table->decimal('previous_rate', 12, 6)->nullable(); // Taxa anterior (para calcular variação)
            $table->decimal('change_percentage', 8, 4)->nullable(); // Variação %
            $table->timestamp('fetched_at'); // Quando foi buscado
            $table->string('source')->default('exchangerate-api'); // Fonte dos dados
            $table->timestamps();

            // Índices
            $table->index(['from_currency', 'to_currency', 'fetched_at']);
            $table->unique(['from_currency', 'to_currency', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
