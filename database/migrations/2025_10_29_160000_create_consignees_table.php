<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cria tabela de consignatários (destinatários das mercadorias)
     */
    public function up(): void
    {
        Schema::create('consignees', function (Blueprint $table) {
            $table->id();

            // Relacionamento com cliente
            $table->foreignId('client_id')
                ->nullable()
                ->constrained('clients')
                ->onDelete('set null')
                ->comment('Cliente associado ao consignatário');

            // Informações básicas
            $table->string('name')
                ->comment('Nome completo ou Razão social');

            $table->string('tax_id')->nullable()
                ->comment('NIF/NUIT do consignatário');

            // Contato
            $table->string('email')->nullable()
                ->comment('Email do consignatário');

            $table->string('phone')->nullable()
                ->comment('Telefone do consignatário');

            // Endereço
            $table->text('address')->nullable()
                ->comment('Endereço completo');

            $table->string('city')->nullable()
                ->comment('Cidade');

            $table->string('country')->default('MZ')
                ->comment('País (ISO 2)');

            // Informações adicionais
            $table->string('contact_person')->nullable()
                ->comment('Pessoa de contato');

            $table->text('notes')->nullable()
                ->comment('Observações gerais');

            // Status
            $table->boolean('active')->default(true)
                ->comment('Status ativo/inativo');

            // Timestamps e soft deletes
            $table->timestamps();
            $table->softDeletes();

            // Índices para performance
            $table->index('client_id');
            $table->index('name');
            $table->index('active');
            $table->index(['client_id', 'active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consignees');
    }
};
