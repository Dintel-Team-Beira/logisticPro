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
        // Mudar a coluna status de ENUM para VARCHAR(50)
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('status', 50)->change();
        });

        // Se quiser manter como ENUM, use isto (mas eu recomendo VARCHAR):

        DB::statement("
            ALTER TABLE shipments
            MODIFY COLUMN status ENUM(
                'coleta_cotacao_solicitada',
                'coleta_cotacao_recebida',
                'coleta_pagamento_enviado',
                'coleta_recibo_recebido',
                'coleta_concluida',
                'legalizacao_iniciada',
                'legalizacao_bl_carimbado',
                'legalizacao_do_recebida',
                'legalizacao_concluida',
                'alfandegas_declaracao_submetida',
                'alfandegas_aviso_recebido',
                'alfandegas_pagamento_efectuado',
                'alfandegas_autorizacao_recebida',
                'alfandegas_concluida',
                'cornelder_cotacao_solicitada',
                'cornelder_draft_recebido',
                'cornelder_pagamento_efectuado',
                'cornelder_recibo_recebido',
                'cornelder_concluida',
                'taxacao_documentos_consolidados',
                'taxacao_concluida',
                'faturacao_em_preparacao',
                'faturacao_emitida',
                'faturacao_paga',
                'pod_aguardando',
                'pod_recebido',
                'processo_concluido'
            ) DEFAULT 'coleta_cotacao_solicitada'
        ");

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('status', 20)->change();
        });
    }
};
