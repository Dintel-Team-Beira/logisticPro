<?php

namespace App\Notifications;

use App\Models\PaymentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRequestApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $paymentRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(PaymentRequest $paymentRequest)
    {
        $this->paymentRequest = $paymentRequest;
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
            ->subject("✅ Pedido de Pagamento Aprovado - PR-{$this->paymentRequest->id}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("✅ Seu pedido de pagamento foi aprovado!")
            ->line("**Referência:** PR-{$this->paymentRequest->id}")
            ->line("**Valor:** " . number_format($this->paymentRequest->amount, 2, ',', '.') . " {$this->paymentRequest->currency}")
            ->line("**Aprovado por:** " . ($this->paymentRequest->approvedBy->name ?? 'N/A'))
            ->action('Ver Pedido', url("/payment-requests/{$this->paymentRequest->id}"))
            ->line('O pagamento será processado em breve.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pedido Aprovado',
            'message' => "Pedido PR-{$this->paymentRequest->id} foi aprovado",
            'type' => 'success',
            'payment_request_id' => $this->paymentRequest->id,
            'amount' => $this->paymentRequest->amount,
            'currency' => $this->paymentRequest->currency,
            'action_url' => "/payment-requests/{$this->paymentRequest->id}",
            'time' => now()->diffForHumans(),
        ];
    }
}
