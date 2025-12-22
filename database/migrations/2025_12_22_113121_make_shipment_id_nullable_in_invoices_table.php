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
     * Torna shipment_id nullable porque invoices podem ser criadas
     * a partir de cotações standalone (sem shipment associado)
     */
    public function up(): void
    {
        // Remove a constraint atual
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['shipment_id']);
        });

        // Modifica a coluna para nullable
        DB::statement('ALTER TABLE invoices MODIFY shipment_id BIGINT UNSIGNED NULL');

        // Adiciona a constraint de volta, mas permitindo NULL
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreign('shipment_id')
                ->references('id')
                ->on('shipments')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove a constraint
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['shipment_id']);
        });

        // Volta a ser NOT NULL (isso pode falhar se houver dados NULL)
        DB::statement('ALTER TABLE invoices MODIFY shipment_id BIGINT UNSIGNED NOT NULL');

        // Adiciona a constraint de volta
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreign('shipment_id')
                ->references('id')
                ->on('shipments')
                ->onDelete('cascade');
        });
    }
};
