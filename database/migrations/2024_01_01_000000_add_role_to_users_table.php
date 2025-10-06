<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'manager', 'operator', 'viewer'])->default('operator')->after('email');
            $table->json('permissions')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('permissions');
            $table->string('phone')->nullable()->after('avatar');
            $table->string('department')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'permissions', 'avatar', 'phone', 'department']);
        });
    }
};
