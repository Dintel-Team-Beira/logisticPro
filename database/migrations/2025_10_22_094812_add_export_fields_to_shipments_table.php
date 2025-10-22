<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona suporte para processos de EXPORTAÇÃO
     * Mantém compatibilidade com processos de IMPORTAÇÃO existentes
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // ========================================
            // TIPO DE PROCESSO
            // ========================================
            $table->enum('type', ['import', 'export'])
                ->default('import')
                ->after('reference_number')
                ->comment('Tipo de processo: importação ou exportação');

            // ========================================
            // CAMPOS DE STATUS - EXPORTAÇÃO (7 Fases)
            // ========================================

            // Fase 1: Preparação de Documentos
            $table->string('exp_document_prep_status')
                ->nullable()
                ->after('pod_status')
                ->comment('Status da preparação de documentos (pending, in_progress, completed)');

            // Fase 2: Booking
            $table->string('exp_booking_status')
                ->nullable()
                ->after('exp_document_prep_status')
                ->comment('Status do booking (requested, confirmed, paid)');

            $table->unsignedBigInteger('exp_booking_confirmation_id')
                ->nullable()
                ->after('exp_booking_status')
                ->comment('ID do documento de confirmação de booking');

            // Fase 3: Inspeção e Certificação
            $table->string('exp_inspection_status')
                ->nullable()
                ->after('exp_booking_confirmation_id')
                ->comment('Status da inspeção (pending, scheduled, completed)');

            $table->date('exp_inspection_date')
                ->nullable()
                ->after('exp_inspection_status')
                ->comment('Data da inspeção');

            // Fase 4: Despacho Aduaneiro
            $table->string('exp_customs_status')
                ->nullable()
                ->after('exp_inspection_date')
                ->comment('Status do despacho (pending, submitted, cleared)');

            $table->string('exp_customs_declaration_number')
                ->nullable()
                ->after('exp_customs_status')
                ->comment('Número da declaração de exportação (DU-E)');

            // Fase 5: Transporte ao Porto
            $table->string('exp_transport_status')
                ->nullable()
                ->after('exp_customs_declaration_number')
                ->comment('Status do transporte (pending, in_transit, delivered)');

            $table->date('exp_delivery_to_port_date')
                ->nullable()
                ->after('exp_transport_status')
                ->comment('Data de entrega no porto');

            // Fase 6: Embarque
            $table->string('exp_loading_status')
                ->nullable()
                ->after('exp_delivery_to_port_date')
                ->comment('Status do embarque (pending, loading, loaded)');

            $table->date('exp_actual_loading_date')
                ->nullable()
                ->after('exp_loading_status')
                ->comment('Data real de embarque');

            $table->date('exp_etd')
                ->nullable()
                ->after('exp_actual_loading_date')
                ->comment('ETD - Estimated Time of Departure');

            // Fase 7: Acompanhamento
            $table->string('exp_tracking_status')
                ->nullable()
                ->after('exp_etd')
                ->comment('Status de acompanhamento (in_transit, arrived, delivered)');

            $table->date('exp_eta_destination')
                ->nullable()
                ->after('exp_tracking_status')
                ->comment('ETA no destino');

            $table->date('exp_actual_arrival_date')
                ->nullable()
                ->after('exp_eta_destination')
                ->comment('Data real de chegada no destino');

            // ========================================
            // ÍNDICES PARA PERFORMANCE
            // ========================================
            $table->index('type', 'idx_shipments_type');
            $table->index(['type', 'exp_booking_status'], 'idx_shipments_export_booking');
            $table->index(['type', 'exp_customs_status'], 'idx_shipments_export_customs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Remover índices
            $table->dropIndex('idx_shipments_type');
            $table->dropIndex('idx_shipments_export_booking');
            $table->dropIndex('idx_shipments_export_customs');

            // Remover colunas
            $table->dropColumn([
                'type',
                'exp_document_prep_status',
                'exp_booking_status',
                'exp_booking_confirmation_id',
                'exp_inspection_status',
                'exp_inspection_date',
                'exp_customs_status',
                'exp_customs_declaration_number',
                'exp_transport_status',
                'exp_delivery_to_port_date',
                'exp_loading_status',
                'exp_actual_loading_date',
                'exp_etd',
                'exp_tracking_status',
                'exp_eta_destination',
                'exp_actual_arrival_date',
            ]);
        });
    }
};
