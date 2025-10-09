<?php

// database/migrations/2025_01_10_create_user_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/2025_01_10_create_company_settings_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();

            // Dados da Empresa
            $table->string('company_name');
            $table->string('company_email');
            $table->string('company_phone');
            $table->text('company_address')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('logo')->nullable();

            // Configurações de Faturação (JSON)
            $table->json('invoice_settings')->nullable();

            // Webhooks (JSON)
            $table->json('webhooks')->nullable();

            // Outras Configurações
            $table->boolean('maintenance_mode')->default(false);
            $table->integer('session_timeout')->default(120); // minutos
            $table->boolean('two_factor_enabled')->default(false);

            $table->timestamps();
        });

        // Inserir configurações padrão
        DB::table('company_settings')->insert([
            'id' => 1,
            'company_name' => 'ALEK Logistics & Transport, LDA',
            'company_email' => 'info@alek.co.mz',
            'company_phone' => '+258 84 000 0000',
            'invoice_settings' => json_encode([
                'invoice_prefix' => 'INV',
                'next_invoice_number' => 1,
                'default_payment_terms' => 30,
                'default_margin_percentage' => 15,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
