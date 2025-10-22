<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alterar a coluna stage para adicionar todas as fases de importação e exportação
        DB::statement("ALTER TABLE `shipment_stages` MODIFY `stage` ENUM(
            'coleta_dispersa',
            'legalizacao',
            'alfandegas',
            'cornelder',
            'taxacao',
            'faturacao',
            'pod',
            'preparacao_documentos',
            'booking',
            'inspecao_certificacao',
            'despacho_aduaneiro',
            'transporte_porto',
            'embarque',
            'acompanhamento'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter para os valores originais (apenas as 5 primeiras fases)
        DB::statement("ALTER TABLE `shipment_stages` MODIFY `stage` ENUM(
            'coleta_dispersa',
            'legalizacao',
            'alfandegas',
            'cornelder',
            'taxacao'
        ) NOT NULL");
    }
};
