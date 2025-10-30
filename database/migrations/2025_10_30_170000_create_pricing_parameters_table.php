<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabela de parâmetros de precificação para cotações automáticas
     */
    public function up(): void
    {
        Schema::create('pricing_parameters', function (Blueprint $table) {
            $table->id();

            // Categoria do parâmetro
            $table->enum('category', [
                'container_type',      // Tipo de container (20DC, 40DC, etc.)
                'cargo_type',          // Tipo de mercadoria (normal, perecível, perigosa)
                'regime',              // Regime (nacional, trânsito)
                'destination',         // Destino (Malawi, Zâmbia, etc.)
                'additional_service'   // Serviços adicionais (transporte, descarga, etc.)
            ])->comment('Categoria do parâmetro de precificação');

            // Identificador único dentro da categoria (ex: 20DC, 40DC)
            $table->string('code')->comment('Código único do parâmetro');

            // Nome exibido
            $table->string('name')->comment('Nome do parâmetro');

            // Descrição detalhada
            $table->text('description')->nullable()->comment('Descrição do parâmetro');

            // Preço base em MZN
            $table->decimal('price', 15, 2)->default(0)->comment('Preço em MZN');

            // Moeda (para futuras expansões)
            $table->string('currency', 3)->default('MZN')->comment('Moeda do preço');

            // Status ativo/inativo
            $table->boolean('active')->default(true)->comment('Parâmetro ativo');

            // Ordenação para exibição
            $table->integer('order')->default(0)->comment('Ordem de exibição');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('category');
            $table->index('code');
            $table->index('active');
            $table->unique(['category', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_parameters');
    }
};
