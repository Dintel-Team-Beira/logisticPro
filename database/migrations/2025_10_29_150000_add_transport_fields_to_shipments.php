<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona campos específicos para processos de TRANSPORTE
     * Campos práticos para registro e rastreamento de transporte
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // ========================================
            // CAMPOS DE DADOS - TRANSPORTE
            // ========================================

            // Local de carregamento (origem)
            $table->string('loading_location')
                ->nullable()
                ->after('trp_delivery_notes')
                ->comment('Local de carregamento da mercadoria');

            // Local de descarregamento (destino)
            $table->string('unloading_location')
                ->nullable()
                ->after('loading_location')
                ->comment('Local de descarregamento da mercadoria');

            // Tipo de mercadoria
            $table->string('cargo_type')
                ->nullable()
                ->after('unloading_location')
                ->comment('Tipo de mercadoria a ser transportada');

            // Distância em quilômetros
            $table->decimal('distance_km', 8, 2)
                ->nullable()
                ->after('cargo_type')
                ->comment('Distância em quilômetros');

            // Local da devolução do vazio
            $table->string('empty_return_location')
                ->nullable()
                ->after('distance_km')
                ->comment('Local para devolução do container/veículo vazio');

            // ========================================
            // ÍNDICES PARA PERFORMANCE
            // ========================================
            $table->index(['type', 'loading_location'], 'idx_shipments_transport_loading');
            $table->index(['type', 'unloading_location'], 'idx_shipments_transport_unloading');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Remover índices
            $table->dropIndex('idx_shipments_transport_loading');
            $table->dropIndex('idx_shipments_transport_unloading');

            // Remover colunas de transporte
            $table->dropColumn([
                'loading_location',
                'unloading_location',
                'cargo_type',
                'distance_km',
                'empty_return_location',
            ]);
        });
    }
};
