<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Novos campos para tipos de carga
            $table->string('cargo_type')->default('normal')->after('cargo_description')
                ->comment('Tipo de carga: normal, perishable, hazardous, oversized');

            // Campos booleanos para casos especiais
            $table->boolean('has_tax_exemption')->default(false)->after('cargo_type')
                ->comment('Se tem isenção fiscal');

            $table->boolean('is_reexport')->default(false)->after('has_tax_exemption')
                ->comment('Se é reexportação');

            $table->boolean('requires_inspection')->default(false)->after('is_reexport')
                ->comment('Se requer inspeção especial');

            // Novos campos de status para granularidade
            $table->string('cornelder_status')->nullable()->after('cornelder_payment_status')
                ->comment('Status Cornelder: requested, draft_received, paid');

            $table->string('taxation_status')->nullable()->after('cornelder_status')
                ->comment('Status Taxação: pending, documents_ready, completed');

            $table->string('pod_status')->nullable()->after('taxation_status')
                ->comment('Status POD: awaiting, received, confirmed');

            // Índices para performance
            $table->index('cargo_type');
            $table->index(['has_tax_exemption', 'is_reexport']);
            $table->index('cornelder_status');
            $table->index('taxation_status');
            $table->index('pod_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropIndex(['cargo_type']);
            $table->dropIndex(['has_tax_exemption', 'is_reexport']);
            $table->dropIndex(['cornelder_status']);
            $table->dropIndex(['taxation_status']);
            $table->dropIndex(['pod_status']);

            $table->dropColumn([
                'cargo_type',
                'has_tax_exemption',
                'is_reexport',
                'requires_inspection',
                'cornelder_status',
                'taxation_status',
                'pod_status',
            ]);
        });
    }
};
