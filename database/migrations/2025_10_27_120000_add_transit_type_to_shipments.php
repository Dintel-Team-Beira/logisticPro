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
     * Adiciona suporte para processos de TRÂNSITO
     * Mantém compatibilidade com IMPORTAÇÃO e EXPORTAÇÃO
     */
    public function up(): void
    {
        // Alterar o enum 'type' para incluir 'transit'
        DB::statement("ALTER TABLE shipments MODIFY COLUMN type ENUM('import', 'export', 'transit') DEFAULT 'import' COMMENT 'Tipo de processo: importação, exportação ou trânsito'");

        Schema::table('shipments', function (Blueprint $table) {
            // ========================================
            // CAMPOS DE STATUS - TRÂNSITO (7 Fases)
            // ========================================

            // Fase 1: Recepção
            $table->string('tra_reception_status')
                ->nullable()
                ->after('exp_actual_arrival_date')
                ->comment('Status da recepção da carga (pending, received, verified)');

            $table->date('tra_reception_date')
                ->nullable()
                ->after('tra_reception_status')
                ->comment('Data de recepção da carga');

            // Fase 2: Documentação
            $table->string('tra_documentation_status')
                ->nullable()
                ->after('tra_reception_date')
                ->comment('Status da documentação (pending, in_progress, completed)');

            // Fase 3: Desembaraço Aduaneiro
            $table->string('tra_customs_clearance_status')
                ->nullable()
                ->after('tra_documentation_status')
                ->comment('Status do desembaraço (pending, in_progress, cleared)');

            $table->string('tra_customs_declaration_number')
                ->nullable()
                ->after('tra_customs_clearance_status')
                ->comment('Número da declaração de trânsito (DT)');

            // Fase 4: Armazenamento
            $table->string('tra_storage_status')
                ->nullable()
                ->after('tra_customs_declaration_number')
                ->comment('Status do armazenamento (stored, ready_for_departure)');

            $table->string('tra_warehouse_location')
                ->nullable()
                ->after('tra_storage_status')
                ->comment('Localização no armazém');

            // Fase 5: Preparação de Partida
            $table->string('tra_departure_prep_status')
                ->nullable()
                ->after('tra_warehouse_location')
                ->comment('Status da preparação (pending, in_progress, ready)');

            $table->date('tra_departure_date')
                ->nullable()
                ->after('tra_departure_prep_status')
                ->comment('Data prevista de partida');

            // Fase 6: Transporte de Saída
            $table->string('tra_outbound_transport_status')
                ->nullable()
                ->after('tra_departure_date')
                ->comment('Status do transporte (pending, in_transit, delivered)');

            $table->date('tra_actual_departure_date')
                ->nullable()
                ->after('tra_outbound_transport_status')
                ->comment('Data real de partida');

            // Fase 7: Entrega Final
            $table->string('tra_delivery_status')
                ->nullable()
                ->after('tra_actual_departure_date')
                ->comment('Status da entrega (pending, delivered, confirmed)');

            $table->date('tra_delivery_date')
                ->nullable()
                ->after('tra_delivery_status')
                ->comment('Data de entrega final');

            $table->string('tra_final_destination')
                ->nullable()
                ->after('tra_delivery_date')
                ->comment('Destino final da carga');

            // ========================================
            // ÍNDICES PARA PERFORMANCE
            // ========================================
            $table->index(['type', 'tra_customs_clearance_status'], 'idx_shipments_transit_customs');
            $table->index(['type', 'tra_storage_status'], 'idx_shipments_transit_storage');
            $table->index(['type', 'tra_delivery_status'], 'idx_shipments_transit_delivery');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar enum original (import, export)
        DB::statement("ALTER TABLE shipments MODIFY COLUMN type ENUM('import', 'export') DEFAULT 'import'");

        Schema::table('shipments', function (Blueprint $table) {
            // Remover índices
            $table->dropIndex('idx_shipments_transit_customs');
            $table->dropIndex('idx_shipments_transit_storage');
            $table->dropIndex('idx_shipments_transit_delivery');

            // Remover colunas de trânsito
            $table->dropColumn([
                'tra_reception_status',
                'tra_reception_date',
                'tra_documentation_status',
                'tra_customs_clearance_status',
                'tra_customs_declaration_number',
                'tra_storage_status',
                'tra_warehouse_location',
                'tra_departure_prep_status',
                'tra_departure_date',
                'tra_outbound_transport_status',
                'tra_actual_departure_date',
                'tra_delivery_status',
                'tra_delivery_date',
                'tra_final_destination',
            ]);
        });
    }
};
