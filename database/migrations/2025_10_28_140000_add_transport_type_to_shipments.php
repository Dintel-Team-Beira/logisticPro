<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona suporte para processos de TRANSPORTE
     * Mantém compatibilidade com IMPORTAÇÃO, EXPORTAÇÃO e TRÂNSITO
     */
    public function up(): void
    {
        // Alterar o enum 'type' para incluir 'transport'
        DB::statement("ALTER TABLE shipments MODIFY COLUMN type ENUM('import', 'export', 'transit', 'transport') DEFAULT 'import' COMMENT 'Tipo de processo: importação, exportação, trânsito ou transporte'");

        Schema::table('shipments', function (Blueprint $table) {
            // ========================================
            // CAMPOS DE STATUS - TRANSPORTE (2 Fases Simplificadas)
            // ========================================

            // Fase 1: Coleta
            $table->string('trp_coleta_status')
                ->nullable()
                ->after('tra_final_destination')
                ->comment('Status da coleta (pending, in_transit, collected)');

            $table->date('trp_coleta_date')
                ->nullable()
                ->after('trp_coleta_status')
                ->comment('Data de coleta');

            $table->string('trp_origin_address')
                ->nullable()
                ->after('trp_coleta_date')
                ->comment('Endereço de origem da coleta');

            // Fase 2: Entrega
            $table->string('trp_entrega_status')
                ->nullable()
                ->after('trp_origin_address')
                ->comment('Status da entrega (pending, in_transit, delivered)');

            $table->date('trp_entrega_date')
                ->nullable()
                ->after('trp_entrega_status')
                ->comment('Data de entrega');

            $table->string('trp_destination_address')
                ->nullable()
                ->after('trp_entrega_date')
                ->comment('Endereço de destino da entrega');

            $table->string('trp_receiver_name')
                ->nullable()
                ->after('trp_destination_address')
                ->comment('Nome do recebedor');

            $table->text('trp_delivery_notes')
                ->nullable()
                ->after('trp_receiver_name')
                ->comment('Observações da entrega');

            // ========================================
            // ÍNDICES PARA PERFORMANCE
            // ========================================
            $table->index(['type', 'trp_coleta_status'], 'idx_shipments_transport_coleta');
            $table->index(['type', 'trp_entrega_status'], 'idx_shipments_transport_entrega');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar enum original (import, export, transit)
        DB::statement("ALTER TABLE shipments MODIFY COLUMN type ENUM('import', 'export', 'transit') DEFAULT 'import'");

        Schema::table('shipments', function (Blueprint $table) {
            // Remover índices
            $table->dropIndex('idx_shipments_transport_coleta');
            $table->dropIndex('idx_shipments_transport_entrega');

            // Remover colunas de transporte
            $table->dropColumn([
                'trp_coleta_status',
                'trp_coleta_date',
                'trp_origin_address',
                'trp_entrega_status',
                'trp_entrega_date',
                'trp_destination_address',
                'trp_receiver_name',
                'trp_delivery_notes',
            ]);
        });
    }
};
