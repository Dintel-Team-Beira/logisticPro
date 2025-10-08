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
        // Se não existirem
        if (!Schema::hasColumn('shipments', 'quotation_status')) {
            $table->string('quotation_status')->nullable()->after('status');
        }
        if (!Schema::hasColumn('shipments', 'payment_status')) {
            $table->string('payment_status')->nullable()->after('quotation_status');
        }
        if (!Schema::hasColumn('shipments', 'customs_status')) {
            $table->string('customs_status')->nullable()->after('payment_status');
        }
        if (!Schema::hasColumn('shipments', 'customs_payment_status')) {
            $table->string('customs_payment_status')->nullable()->after('customs_status');
        }
        if (!Schema::hasColumn('shipments', 'cornelder_payment_status')) {
            $table->string('cornelder_payment_status')->nullable()->after('customs_payment_status');
        }
        if (!Schema::hasColumn('shipments', 'client_payment_status')) {
            $table->string('client_payment_status')->nullable()->after('cornelder_payment_status');
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            //
        });
    }
};
