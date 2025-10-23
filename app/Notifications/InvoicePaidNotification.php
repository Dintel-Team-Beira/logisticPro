<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoicePaidNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject("Fatura Paga - {$this->invoice->invoice_number}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("A fatura {$this->invoice->invoice_number} foi marcada como paga.")
            ->line("**Processo:** {$this->invoice->shipment->reference_number}")
            ->line("**Valor:** " . number_format($this->invoice->amount, 2, ',', '.') . " {$this->invoice->currency}")
            ->line("**Data de Pagamento:** " . ($this->invoice->payment_date?->format('d/m/Y') ?? 'N/A'))
            ->action('Ver Fatura', url("/invoices/{$this->invoice->id}"))
            ->line('Obrigado pelo pagamento!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Fatura Paga',
            'message' => "Fatura {$this->invoice->invoice_number} foi paga com sucesso",
            'type' => 'success',
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'amount' => $this->invoice->amount,
            'currency' => $this->invoice->currency,
            'action_url' => "/invoices/{$this->invoice->id}",
            'time' => now()->diffForHumans(),
        ];
    }
}
