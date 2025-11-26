<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona campos file_path e metadata à tabela quotes
 * para torná-la similar à estrutura da tabela invoices
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            // Adicionar file_path para PDF da cotação
            if (!Schema::hasColumn('quotes', 'file_path')) {
                $table->string('file_path')->nullable()->after('customer_notes')
                    ->comment('Caminho do PDF da cotação');
            }

            // Adicionar metadata para dados extras
            if (!Schema::hasColumn('quotes', 'metadata')) {
                $table->json('metadata')->nullable()->after('file_path')
                    ->comment('Dados adicionais (breakdown, base_rates, etc)');
            }
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            if (Schema::hasColumn('quotes', 'file_path')) {
                $table->dropColumn('file_path');
            }

            if (Schema::hasColumn('quotes', 'metadata')) {
                $table->dropColumn('metadata');
            }
        });
    }
};
