<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Adiciona suporte para Faturas ao Cliente
 * Mantém compatibilidade com faturas de fornecedores existentes
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Adicionar client_id (fatura ao cliente final)
            if (!Schema::hasColumn('invoices', 'client_id')) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->after('shipment_id')
                    ->constrained('clients')
                    ->onDelete('restrict')
                    ->comment('Cliente final (quando type=client_invoice)');
            }

            // Adicionar file_path para PDF
            if (!Schema::hasColumn('invoices', 'file_path')) {
                $table->string('file_path')->nullable()->after('notes')
                    ->comment('Caminho do PDF da fatura');
            }

            // Adicionar metadata para dados extras
            if (!Schema::hasColumn('invoices', 'metadata')) {
                $table->json('metadata')->nullable()->after('file_path')
                    ->comment('Dados adicionais (breakdown, base_rates, etc)');
            }
        });

        // Atualizar enum 'type' para incluir 'client_invoice'
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('coleta_dispersa', 'alfandegas', 'cornelder', 'outros', 'client_invoice') NOT NULL");
    }

    public function down(): void
    {
        // Reverter enum
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('coleta_dispersa', 'alfandegas', 'cornelder', 'outros') NOT NULL");

        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'client_id')) {
                $table->dropForeign(['client_id']);
                $table->dropColumn('client_id');
            }

            if (Schema::hasColumn('invoices', 'file_path')) {
                $table->dropColumn('file_path');
            }

            if (Schema::hasColumn('invoices', 'metadata')) {
                $table->dropColumn('metadata');
            }
        });
    }
};
