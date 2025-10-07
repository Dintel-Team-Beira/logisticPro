<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para adicionar novos campos à tabela Shipments
 * Baseado no SRS - Requisitos Funcionais Completos
 *
 * INSTRUÇÕES:
 * 1. Copiar este arquivo para: database/migrations/
 * 2. Renomear para: YYYY_MM_DD_HHMMSS_add_new_fields_to_shipments_table.php
 *    (usar data/hora DEPOIS da migration de clients)
 * 3. Executar: php artisan migrate
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {

            // ===== RELACIONAMENTO COM CLIENTE =====
            // Adicionar DEPOIS de 'reference_number'
            $table->foreignId('client_id')
                ->after('reference_number')
                ->nullable()
                ->constrained('clients')
                ->onDelete('restrict')
                ->comment('Cliente/empresa dona da carga');

            // ===== INFORMAÇÕES DO CONTAINER =====
            // Adicionar DEPOIS de 'container_number'
            $table->enum('container_type', [
                '20DC',  // 20' Dry Container
                '40DC',  // 40' Dry Container
                '40HC',  // 40' High Cube
                '20RF',  // 20' Reefer (refrigerado)
                '40RF',  // 40' Reefer
                '20OT',  // 20' Open Top
                '40OT',  // 40' Open Top
            ])
            ->after('container_number')
            ->nullable()
            ->comment('Tipo de contentor');

            // ===== INFORMAÇÕES DA CARGA =====
            // Adicionar DEPOIS de 'cargo_description'
            $table->decimal('cargo_weight', 10, 2)
                ->after('cargo_description')
                ->nullable()
                ->comment('Peso da carga em kg');

            $table->decimal('cargo_value', 12, 2)
                ->after('cargo_weight')
                ->nullable()
                ->comment('Valor declarado da carga em USD');

            // ===== DEADLINES E ALERTAS =====
            // Adicionar DEPOIS de 'arrival_date'
            $table->date('storage_deadline')
                ->after('arrival_date')
                ->nullable()
                ->comment('Data limite para retirada (evitar storage fees)');

            $table->boolean('storage_alert')
                ->after('storage_deadline')
                ->default(false)
                ->comment('Flag para alerta de prazo crítico de storage');

            // ===== INFORMAÇÕES FINANCEIRAS =====
            // Adicionar DEPOIS de 'cargo_value'
            $table->decimal('total_cost', 12, 2)
                ->after('cargo_value')
                ->nullable()
                ->comment('Custo total acumulado (todas as fases)');

            $table->decimal('invoice_amount', 12, 2)
                ->after('total_cost')
                ->nullable()
                ->comment('Valor total da fatura ao cliente');

            $table->decimal('profit_margin', 5, 2)
                ->after('invoice_amount')
                ->nullable()
                ->comment('Margem de lucro em percentagem');

            // ===== METADATA =====
            // Adicionar DEPOIS de 'status'
            $table->json('metadata')
                ->after('status')
                ->nullable()
                ->comment('Dados adicionais em formato JSON');

            // ===== INDEXES =====
            // Melhorar performance das queries
            $table->index('client_id', 'idx_shipments_client_id');
            $table->index(['status', 'created_at'], 'idx_shipments_status_created');
            $table->index('storage_deadline', 'idx_shipments_storage_deadline');
            $table->index('storage_alert', 'idx_shipments_storage_alert');
            $table->index('container_type', 'idx_shipments_container_type');
        });

        // Adicionar comentários às colunas
        if (config('database.default') === 'pgsql') {
            DB::statement("COMMENT ON COLUMN shipments.client_id IS 'FK para tabela clients'");
            DB::statement("COMMENT ON COLUMN shipments.container_type IS 'Tipo de contentor (20DC, 40HC, etc)'");
            DB::statement("COMMENT ON COLUMN shipments.cargo_weight IS 'Peso da carga em quilogramas'");
            DB::statement("COMMENT ON COLUMN shipments.cargo_value IS 'Valor da carga em USD'");
            DB::statement("COMMENT ON COLUMN shipments.storage_deadline IS 'Deadline para evitar multas de armazenamento'");
            DB::statement("COMMENT ON COLUMN shipments.total_cost IS 'Soma de todos os custos do processo'");
            DB::statement("COMMENT ON COLUMN shipments.invoice_amount IS 'Valor cobrado ao cliente'");
            DB::statement("COMMENT ON COLUMN shipments.profit_margin IS 'Margem de lucro calculada'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Remover indexes primeiro
            $table->dropIndex('idx_shipments_client_id');
            $table->dropIndex('idx_shipments_status_created');
            $table->dropIndex('idx_shipments_storage_deadline');
            $table->dropIndex('idx_shipments_storage_alert');
            $table->dropIndex('idx_shipments_container_type');

            // Remover foreign key
            $table->dropForeign(['client_id']);

            // Remover colunas
            $table->dropColumn([
                'client_id',
                'container_type',
                'cargo_weight',
                'cargo_value',
                'storage_deadline',
                'storage_alert',
                'total_cost',
                'invoice_amount',
                'profit_margin',
                'metadata',
            ]);
        });
    }
};
