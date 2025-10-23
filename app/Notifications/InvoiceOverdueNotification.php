<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $invoice;

    /**
     * Create a new notification instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $daysOverdue = now()->diffInDays($this->invoice->due_date);

        return (new MailMessage)
            ->subject("⚠️ Fatura Vencida - {$this->invoice->invoice_number}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("⚠️ A fatura {$this->invoice->invoice_number} está vencida há {$daysOverdue} dia(s).")
            ->line("**Processo:** {$this->invoice->shipment->reference_number}")
            ->line("**Valor:** " . number_format($this->invoice->amount, 2, ',', '.') . " {$this->invoice->currency}")
            ->line("**Data de Vencimento:** " . $this->invoice->due_date->format('d/m/Y'))
            ->action('Ver Fatura', url("/invoices/{$this->invoice->id}"))
            ->line('Por favor, regularize o pagamento o quanto antes.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Fatura Vencida',
            'message' => "Fatura {$this->invoice->invoice_number} está vencida - " . number_format($this->invoice->amount, 2, ',', '.') . " {$this->invoice->currency}",
            'type' => 'error',
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'amount' => $this->invoice->amount,
            'currency' => $this->invoice->currency,
            'days_overdue' => now()->diffInDays($this->invoice->due_date),
            'action_url' => "/invoices/{$this->invoice->id}",
            'time' => now()->diffForHumans(),
        ];
    }
}
