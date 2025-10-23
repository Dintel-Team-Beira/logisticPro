<?php

namespace App\Notifications;

use App\Models\PaymentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRequestRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $paymentRequest;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(PaymentRequest $paymentRequest, ?string $reason = null)
    {
        $this->paymentRequest = $paymentRequest;
        $this->reason = $reason;
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
        $mail = (new MailMessage)
            ->subject("❌ Pedido de Pagamento Rejeitado - PR-{$this->paymentRequest->id}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("❌ Seu pedido de pagamento foi rejeitado.")
            ->line("**Referência:** PR-{$this->paymentRequest->id}")
            ->line("**Valor:** " . number_format($this->paymentRequest->amount, 2, ',', '.') . " {$this->paymentRequest->currency}");

        if ($this->reason) {
            $mail->line("**Motivo:** {$this->reason}");
        }

        return $mail
            ->action('Ver Pedido', url("/payment-requests/{$this->paymentRequest->id}"))
            ->line('Entre em contato com o aprovador para mais informações.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pedido Rejeitado',
            'message' => "Pedido PR-{$this->paymentRequest->id} foi rejeitado" . ($this->reason ? ": {$this->reason}" : ''),
            'type' => 'error',
            'payment_request_id' => $this->paymentRequest->id,
            'amount' => $this->paymentRequest->amount,
            'currency' => $this->paymentRequest->currency,
            'reason' => $this->reason,
            'action_url' => "/payment-requests/{$this->paymentRequest->id}",
            'time' => now()->diffForHumans(),
        ];
    }
}
