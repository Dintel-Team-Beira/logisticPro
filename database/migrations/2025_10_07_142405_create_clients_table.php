<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Migration para criar tabela de Clientes
 * Baseado no SRS - UC-001: Criar Novo Processo
 *
 * INSTRUÇÕES:
 * 1. Copiar este arquivo para: database/migrations/
 * 2. Renomear para: YYYY_MM_DD_HHMMSS_create_clients_table.php
 *    (usar data/hora atual, ex: 2025_10_07_120000_create_clients_table.php)
 * 3. Executar: php artisan migrate
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // Informações básicas
            $table->string('name')->comment('Nome da empresa/cliente');
            $table->string('email')->unique()->comment('Email de contato principal');
            $table->string('phone', 20)->nullable()->comment('Telefone de contato');
            $table->text('address')->nullable()->comment('Endereço completo');

            // Informações fiscais
            $table->string('tax_id', 50)->nullable()->unique()->comment('NIF/NUIT para faturação');

            // Status
            $table->boolean('active')->default(true)->comment('Cliente ativo/inativo');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes para melhor performance
            $table->index('name');
            $table->index('email');
            $table->index('active');
            $table->index(['active', 'created_at']);
        });

        // Adicionar comentário à tabela
        DB::statement("COMMENT ON TABLE clients IS 'Tabela de clientes/empresas que utilizam o sistema de importação'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
