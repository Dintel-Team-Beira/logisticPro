<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('shipping_line_id')->constrained()->onDelete('cascade');
            $table->string('bl_number')->nullable();
            $table->string('container_number')->nullable();
            $table->string('vessel_name')->nullable();
            $table->date('arrival_date')->nullable();
            $table->string('origin_port')->nullable();
            $table->string('destination_port')->nullable();
            $table->text('cargo_description')->nullable();
            $table->enum('status', [
                'draft',
                'coleta_dispersa',
                'legalizacao',
                'alfandegas',
                'cornelder',
                'taxacao',
                'completed'
            ])->default('draft');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
