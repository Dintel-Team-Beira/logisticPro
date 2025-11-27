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
            // Campos para registrar devolução do container vazio (POD)
            $table->string('empty_container_return_location')->nullable()->after('pod_status');
            $table->date('empty_container_return_date')->nullable()->after('empty_container_return_location');
            $table->text('empty_container_return_notes')->nullable()->after('empty_container_return_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'empty_container_return_location',
                'empty_container_return_date',
                'empty_container_return_notes',
            ]);
        });
    }
};
