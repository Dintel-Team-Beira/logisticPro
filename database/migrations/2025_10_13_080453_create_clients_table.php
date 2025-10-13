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
        Schema::table('clients', function (Blueprint $table) {

            // Tipo e informações básicas
            if (!Schema::hasColumn('clients', 'client_type')) {
                $table->enum('client_type', ['individual', 'company', 'government', 'ngo'])
                      ->default('company')
                      ->index();
            }

            if (!Schema::hasColumn('clients', 'name')) {
                $table->string('name');
            }

            if (!Schema::hasColumn('clients', 'company_name')) {
                $table->string('company_name')->nullable();
            }

            // Contatos
            if (!Schema::hasColumn('clients', 'email')) {
                $table->string('email')->unique();
            }

            if (!Schema::hasColumn('clients', 'secondary_email')) {
                $table->string('secondary_email')->nullable();
            }

            if (!Schema::hasColumn('clients', 'phone')) {
                $table->string('phone', 20)->nullable();
            }

            if (!Schema::hasColumn('clients', 'secondary_phone')) {
                $table->string('secondary_phone', 20)->nullable();
            }

            if (!Schema::hasColumn('clients', 'whatsapp')) {
                $table->string('whatsapp', 20)->nullable();
            }

            // Documentos fiscais
            if (!Schema::hasColumn('clients', 'tax_id')) {
                $table->string('tax_id', 50)->nullable()->unique();
            }

            if (!Schema::hasColumn('clients', 'tax_id_type')) {
                $table->string('tax_id_type', 50)->nullable();
            }

            if (!Schema::hasColumn('clients', 'industry')) {
                $table->string('industry')->nullable();
            }

            if (!Schema::hasColumn('clients', 'website')) {
                $table->string('website')->nullable();
            }

            // Endereço principal
            if (!Schema::hasColumn('clients', 'address')) {
                $table->text('address')->nullable();
            }

            if (!Schema::hasColumn('clients', 'address_line2')) {
                $table->string('address_line2')->nullable();
            }

            if (!Schema::hasColumn('clients', 'city')) {
                $table->string('city')->nullable();
            }

            if (!Schema::hasColumn('clients', 'state')) {
                $table->string('state')->nullable();
            }

            if (!Schema::hasColumn('clients', 'postal_code')) {
                $table->string('postal_code', 20)->nullable();
            }

            if (!Schema::hasColumn('clients', 'country')) {
                $table->string('country', 2)->default('MZ');
            }

            // Endereço de faturação
            if (!Schema::hasColumn('clients', 'billing_address')) {
                $table->text('billing_address')->nullable();
            }

            if (!Schema::hasColumn('clients', 'billing_city')) {
                $table->string('billing_city')->nullable();
            }

            if (!Schema::hasColumn('clients', 'billing_state')) {
                $table->string('billing_state')->nullable();
            }

            if (!Schema::hasColumn('clients', 'billing_postal_code')) {
                $table->string('billing_postal_code', 20)->nullable();
            }

            if (!Schema::hasColumn('clients', 'billing_country')) {
                $table->string('billing_country', 2)->nullable();
            }

            // Pessoa de contato
            if (!Schema::hasColumn('clients', 'contact_person')) {
                $table->string('contact_person')->nullable();
            }

            if (!Schema::hasColumn('clients', 'contact_position')) {
                $table->string('contact_position')->nullable();
            }

            if (!Schema::hasColumn('clients', 'contact_phone')) {
                $table->string('contact_phone', 20)->nullable();
            }

            if (!Schema::hasColumn('clients', 'contact_email')) {
                $table->string('contact_email')->nullable();
            }

            // Configurações comerciais
            if (!Schema::hasColumn('clients', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'vip'])
                      ->default('medium')
                      ->index();
            }

            if (!Schema::hasColumn('clients', 'payment_terms')) {
                $table->enum('payment_terms', [
                    'immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'
                ])->default('net_30');
            }

            if (!Schema::hasColumn('clients', 'credit_limit')) {
                $table->bigInteger('credit_limit')->default(0);
            }

            if (!Schema::hasColumn('clients', 'preferred_currency')) {
                $table->string('preferred_currency', 3)->default('MZN');
            }

            // Status e controle
            if (!Schema::hasColumn('clients', 'active')) {
                $table->boolean('active')->default(true)->index();
            }

            if (!Schema::hasColumn('clients', 'blocked')) {
                $table->boolean('blocked')->default(false)->index();
            }

            if (!Schema::hasColumn('clients', 'blocked_reason')) {
                $table->text('blocked_reason')->nullable();
            }

            // Observações e metadados
            if (!Schema::hasColumn('clients', 'notes')) {
                $table->text('notes')->nullable();
            }

            if (!Schema::hasColumn('clients', 'tags')) {
                $table->string('tags')->nullable();
            }

            if (!Schema::hasColumn('clients', 'metadata')) {
                $table->json('metadata')->nullable();
            }

            // Relacionamentos
            if (!Schema::hasColumn('clients', 'assigned_to_user_id')) {
                $table->foreignId('assigned_to_user_id')
                      ->nullable()
                      ->constrained('users')
                      ->nullOnDelete();
            }

            // Datas de controle
            if (!Schema::hasColumn('clients', 'last_interaction_date')) {
                $table->timestamp('last_interaction_date')->nullable();
            }

            if (!Schema::hasColumn('clients', 'deleted_at')) {
                $table->softDeletes();
            }

            if (!Schema::hasColumn('clients', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'client_type', 'name', 'company_name', 'email', 'secondary_email', 'phone',
                'secondary_phone', 'whatsapp', 'tax_id', 'tax_id_type', 'industry', 'website',
                'address', 'address_line2', 'city', 'state', 'postal_code', 'country',
                'billing_address', 'billing_city', 'billing_state', 'billing_postal_code',
                'billing_country', 'contact_person', 'contact_position', 'contact_phone',
                'contact_email', 'priority', 'payment_terms', 'credit_limit',
                'preferred_currency', 'active', 'blocked', 'blocked_reason', 'notes',
                'tags', 'metadata', 'assigned_to_user_id', 'last_interaction_date'
            ]);
        });
    }
};
