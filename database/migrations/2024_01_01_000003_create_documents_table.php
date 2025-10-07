<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'invoice',
                'bl',
                'packing_list',
                'receipt',
                'pop',
                'carta_endosso',
                'delivery_order',
                'aviso',
                'autorizacao',
                'draft',
                'storage',
                'sad',
                'termo'
            ]);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->enum('stage', [
                'coleta_dispersa',
                'legalizacao',
                'alfandegas',
                'cornelder',
                'taxacao',
                'financas'
            ]);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
