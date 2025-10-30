<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona campos de cotação automática aos shipments
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Referência da cotação
            $table->string('quotation_reference')
                ->nullable()
                ->unique()
                ->after('reference_number')
                ->comment('Referência única da cotação');

            // Valores da cotação
            $table->decimal('quotation_subtotal', 15, 2)
                ->nullable()
                ->after('quotation_reference')
                ->comment('Subtotal da cotação (sem impostos)');

            $table->decimal('quotation_tax', 15, 2)
                ->nullable()
                ->after('quotation_subtotal')
                ->comment('Valor de impostos');

            $table->decimal('quotation_total', 15, 2)
                ->nullable()
                ->after('quotation_tax')
                ->comment('Valor total da cotação');

            // Breakdown dos custos (JSON)
            $table->json('quotation_breakdown')
                ->nullable()
                ->after('quotation_total')
                ->comment('Detalhamento dos custos da cotação');

            // Status da cotação
            $table->enum('quotation_status', ['pending', 'approved', 'rejected', 'revised'])
                ->default('pending')
                ->after('quotation_breakdown')
                ->comment('Status da cotação');

            // Data de aprovação
            $table->timestamp('quotation_approved_at')
                ->nullable()
                ->after('quotation_status')
                ->comment('Data de aprovação da cotação');

            // Regime e destino (para cálculo)
            $table->string('regime')
                ->nullable()
                ->after('type')
                ->comment('Regime: nacional, trânsito');

            $table->string('final_destination')
                ->nullable()
                ->after('destination_port')
                ->comment('Destino final (país): Malawi, Zâmbia, etc.');

            // Serviços adicionais (JSON array)
            $table->json('additional_services')
                ->nullable()
                ->after('final_destination')
                ->comment('Serviços adicionais selecionados');

            // Índices
            $table->index('quotation_reference');
            $table->index('quotation_status');
            $table->index('regime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropIndex(['quotation_reference']);
            $table->dropIndex(['quotation_status']);
            $table->dropIndex(['regime']);

            $table->dropColumn([
                'quotation_reference',
                'quotation_subtotal',
                'quotation_tax',
                'quotation_total',
                'quotation_breakdown',
                'quotation_status',
                'quotation_approved_at',
                'regime',
                'final_destination',
                'additional_services',
            ]);
        });
    }
};
