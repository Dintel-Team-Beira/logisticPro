<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;



/**

 * Criar tabela invoice_items para itens de fatura

 */

return new class extends Migration

{

    public function up(): void

    {

        if (!Schema::hasTable('invoice_items')) {

            Schema::create('invoice_items', function (Blueprint $table) {

                $table->id();

                $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');

                $table->foreignId('service_id')->nullable()->constrained('service_catalog')->onDelete('set null');



                // Item details

                $table->string('service_code')->nullable();

                $table->string('service_name')->nullable();

                $table->text('description')->nullable();

                $table->string('category')->nullable();



                // Pricing

                $table->decimal('quantity', 10, 2)->default(1);

                $table->string('unit')->default('unit');

                $table->decimal('unit_price', 10, 2);

                $table->decimal('subtotal', 12, 2)->nullable();



                // Tax

                $table->enum('tax_type', ['included', 'excluded', 'exempt'])->default('excluded');

                $table->decimal('tax_rate', 5, 2)->default(17.00);

                $table->decimal('tax_amount', 10, 2)->default(0);

                $table->decimal('total', 12, 2)->nullable();



                // Order

                $table->integer('sort_order')->default(0);



                $table->timestamps();



                $table->index(['invoice_id', 'sort_order']);

            });

        }

    }



    public function down(): void

    {

        Schema::dropIfExists('invoice_items');

    }

};
