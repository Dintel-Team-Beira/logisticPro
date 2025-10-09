<?php

// database/migrations/2025_01_10_create_user_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Preferências de Interface
            $table->enum('theme', ['light', 'dark', 'auto'])->default('light');
            $table->enum('language', ['pt', 'en', 'es'])->default('pt');
            $table->string('timezone')->default('Africa/Maputo');
            $table->enum('date_format', ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])->default('DD/MM/YYYY');
            $table->enum('currency', ['MZN', 'USD', 'EUR'])->default('MZN');
            $table->integer('items_per_page')->default(25);

            // Notificações (JSON)
            $table->json('notifications')->nullable();

            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
