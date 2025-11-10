<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;



/**

 * Correção: Adicionar colunas faltantes na tabela invoices

 */

return new class extends Migration

{

    public function up(): void

    {

        Schema::table('invoices', function (Blueprint $table) {

            // Verificar e adicionar colunas que podem estar faltando



            if (!Schema::hasColumn('invoices', 'invoice_type')) {

                $table->enum('invoice_type', ['process', 'quotation', 'service'])

                    ->default('process')

                    ->after('invoice_number')

                    ->comment('process = baseada em despesas, quotation = da cotação, service = serviços');

            }



            if (!Schema::hasColumn('invoices', 'quote_id')) {

                $table->foreignId('quote_id')

                    ->nullable()

                    ->after('shipment_id')

                    ->constrained('quotes')

                    ->onDelete('set null');

            }



            if (!Schema::hasColumn('invoices', 'description')) {

                $table->text('description')->nullable()->after('status');

            }



            if (!Schema::hasColumn('invoices', 'discount_percentage')) {

                $table->decimal('discount_percentage', 5, 2)->default(0)->after('amount');

            }



            if (!Schema::hasColumn('invoices', 'discount_amount')) {

                $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_percentage');

            }



            if (!Schema::hasColumn('invoices', 'subtotal')) {

                $table->decimal('subtotal', 12, 2)->nullable()->after('discount_amount');

            }



            if (!Schema::hasColumn('invoices', 'tax_amount')) {

                $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');

            }



            if (!Schema::hasColumn('invoices', 'terms')) {

                $table->text('terms')->nullable()->after('notes');

            }



            if (!Schema::hasColumn('invoices', 'customer_notes')) {

                $table->text('customer_notes')->nullable()->after('terms');

            }



            if (!Schema::hasColumn('invoices', 'payment_terms')) {

                $table->string('payment_terms')->nullable()->after('customer_notes');

            }



            if (!Schema::hasColumn('invoices', 'created_by')) {

                $table->foreignId('created_by')

                    ->nullable()

                    ->after('payment_terms')

                    ->constrained('users')

                    ->onDelete('set null');

            }

        });



        // Atualizar enum do tipo se necessário para incluir 'quotation'

        DB::statement("ALTER TABLE invoices MODIFY COLUMN invoice_type ENUM('process', 'quotation', 'service') DEFAULT 'process'");

    }



    public function down(): void

    {

        Schema::table('invoices', function (Blueprint $table) {

            $columns = [

                'discount_percentage',

                'discount_amount',

                'subtotal',

                'tax_amount',

                'terms',

                'customer_notes',

                'payment_terms',

            ];



            foreach ($columns as $column) {

                if (Schema::hasColumn('invoices', $column)) {

                    $table->dropColumn($column);

                }

            }



            if (Schema::hasColumn('invoices', 'quote_id')) {

                $table->dropForeign(['quote_id']);

                $table->dropColumn('quote_id');

            }



            if (Schema::hasColumn('invoices', 'invoice_type')) {

                $table->dropColumn('invoice_type');

            }



            if (Schema::hasColumn('invoices', 'description')) {

                $table->dropColumn('description');

            }



            if (Schema::hasColumn('invoices', 'created_by')) {

                $table->dropForeign(['created_by']);

                $table->dropColumn('created_by');

            }

        });

    }

};
