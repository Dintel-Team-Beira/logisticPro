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
            // Campos de autenticação
            $table->string('password')->nullable()->after('email');
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            // Flag para controlar se o portal está ativo
            $table->boolean('portal_access')->default(true);

            // Token temporário para primeiro acesso
            $table->string('initial_access_token')->nullable();
            $table->timestamp('initial_access_token_expires_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'password',
                'remember_token',
                'email_verified_at',
                'last_login_at',
                'portal_access',
                'initial_access_token',
                'initial_access_token_expires_at',
            ]);
        });
    }
};
