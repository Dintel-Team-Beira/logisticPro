<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->enum('type', [
                'coleta_dispersa',
                'alfandegas',
                'cornelder',
                'outros'
            ]);
            $table->string('issuer'); // CMA, Alfandegas, Cornelder, etc
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('MZN');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->string('payment_reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
