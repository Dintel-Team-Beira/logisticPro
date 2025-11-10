<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona campo consignee_id à tabela shipments
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->foreignId('consignee_id')
                ->nullable()
                ->after('client_id')
                ->constrained('consignees')
                ->onDelete('set null')
                ->comment('Consignatário (destinatário da mercadoria)');

            // Índice para performance
            $table->index('consignee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['consignee_id']);
            $table->dropIndex(['consignee_id']);
            $table->dropColumn('consignee_id');
        });
    }
};
