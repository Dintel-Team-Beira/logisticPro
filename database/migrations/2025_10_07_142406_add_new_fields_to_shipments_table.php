<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            // Cliente
            $table->foreignId('client_id')
                ->after('reference_number')
                ->nullable()
                ->constrained()
                ->onDelete('restrict');

            // Container
            $table->enum('container_type', [
                '20DC', '40DC', '40HC',
                '20RF', '40RF',
                '20OT', '40OT'
            ])->after('container_number')->nullable();

            // Carga
            $table->decimal('cargo_weight', 10, 2)->nullable()->after('cargo_description');
            $table->decimal('cargo_value', 12, 2)->nullable()->after('cargo_weight');

            // Deadlines e alertas
            $table->date('storage_deadline')->nullable()->after('arrival_date');
            $table->boolean('storage_alert')->default(false)->after('storage_deadline');

            // Financeiro
            $table->decimal('total_cost', 12, 2)->nullable()->after('cargo_value');
            $table->decimal('invoice_amount', 12, 2)->nullable()->after('total_cost');
            $table->decimal('profit_margin', 5, 2)->nullable()->after('invoice_amount');

            // Metadata
            $table->json('metadata')->nullable()->after('status');

            // Indexes
            $table->index('client_id');
            $table->index(['status', 'created_at']);
            $table->index('storage_deadline');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn([
                'client_id',
                'container_type',
                'cargo_weight',
                'cargo_value',
                'storage_deadline',
                'storage_alert',
                'total_cost',
                'invoice_amount',
                'profit_margin',
                'metadata',
            ]);
        });
    }
};
