<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\User;
use App\Notifications\InvoiceOverdueNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for overdue invoices and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for overdue invoices...');

        // Buscar faturas vencidas (status pending e due_date passada)
        $overdueInvoices = Invoice::where('status', 'pending')
            ->whereDate('due_date', '<', now())
            ->with('shipment')
            ->get();

        if ($overdueInvoices->isEmpty()) {
            $this->info('No overdue invoices found.');
            return 0;
        }

        $this->info("Found {$overdueInvoices->count()} overdue invoice(s).");

        // Atualizar status para overdue
        Invoice::where('status', 'pending')
            ->whereDate('due_date', '<', now())
            ->update(['status' => 'overdue']);

        // Enviar notificações
        $adminsAndManagers = User::whereIn('role', ['admin', 'manager', 'finance'])->get();

        foreach ($overdueInvoices as $invoice) {
            // Notificar admins, managers e finance
            Notification::send($adminsAndManagers, new InvoiceOverdueNotification($invoice));

            $this->line("  - Invoice {$invoice->invoice_number}: " . now()->diffInDays($invoice->due_date) . " days overdue");
        }

        $this->info('Notifications sent successfully!');

        return 0;
    }
}
