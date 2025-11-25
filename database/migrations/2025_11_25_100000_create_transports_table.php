<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cria tabela de transportes (caminhões, veículos e destinos)
     */
    public function up(): void
    {
        Schema::create('transports', function (Blueprint $table) {
            $table->id();

            // Informações do veículo
            $table->string('tipo_veiculo')
                ->comment('Tipo de veículo (Caminhão, Carreta, Van, etc)');

            $table->string('matricula')
                ->unique()
                ->comment('Matrícula/Placa do veículo');

            $table->string('marca')->nullable()
                ->comment('Marca do veículo (Mercedes, Scania, etc)');

            $table->string('modelo')->nullable()
                ->comment('Modelo do veículo');

            $table->integer('ano')->nullable()
                ->comment('Ano de fabricação');

            // Capacidades
            $table->decimal('capacidade_peso', 10, 2)->nullable()
                ->comment('Capacidade de carga em toneladas');

            $table->decimal('capacidade_volume', 10, 2)->nullable()
                ->comment('Capacidade volumétrica em m³');

            // Informações do motorista
            $table->string('motorista_nome')->nullable()
                ->comment('Nome do motorista principal');

            $table->string('motorista_telefone')->nullable()
                ->comment('Telefone do motorista');

            $table->string('motorista_documento')->nullable()
                ->comment('Número do documento/carta de condução');

            // Destinos (JSON array com múltiplos destinos)
            $table->json('destinos')->nullable()
                ->comment('Lista de destinos que o veículo atende (JSON array)');

            // Informações adicionais
            $table->text('observacoes')->nullable()
                ->comment('Observações gerais sobre o veículo');

            // Status
            $table->boolean('ativo')->default(true)
                ->comment('Status ativo/inativo');

            // Timestamps e soft deletes
            $table->timestamps();
            $table->softDeletes();

            // Índices para performance
            $table->index('matricula');
            $table->index('tipo_veiculo');
            $table->index('ativo');
            $table->index('motorista_nome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transports');
    }
};
