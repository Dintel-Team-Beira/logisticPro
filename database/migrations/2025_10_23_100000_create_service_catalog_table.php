<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Código do serviço (ex: SRV-001)
            $table->string('name'); // Nome do serviço
            $table->text('description')->nullable(); // Descrição detalhada
            $table->enum('category', [
                'freight', // Frete marítimo/aéreo
                'customs', // Desembaraço aduaneiro
                'warehousing', // Armazenagem
                'handling', // Manuseio
                'transport', // Transporte terrestre
                'insurance', // Seguro
                'documentation', // Documentação
                'inspection', // Inspeção
                'consulting', // Consultoria
                'other' // Outros
            ])->default('other');
            $table->decimal('unit_price', 10, 2); // Preço unitário
            $table->string('unit')->default('unit'); // Unidade (unit, kg, m3, container, etc)
            $table->enum('tax_type', ['included', 'excluded', 'exempt'])->default('excluded'); // IVA incluído/excluído/isento
            $table->decimal('tax_rate', 5, 2)->default(17.00); // Taxa de imposto (IVA 17% em Moçambique)
            $table->boolean('is_active')->default(true); // Ativo/Inativo
            $table->integer('sort_order')->default(0); // Ordem de exibição
            $table->json('metadata')->nullable(); // Dados adicionais
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog');
    }
};
