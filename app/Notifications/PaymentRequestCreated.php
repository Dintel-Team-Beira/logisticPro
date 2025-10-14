<?php

namespace App\Notifications;

use App\Models\PaymentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

/**
 * ========================================
 * NOTIFICAÇÃO: SOLICITAÇÃO CRIADA
 * ========================================
 * Enviada para: Gestores
 * Quando: Operações cria nova solicitação
 */
class PaymentRequestCreated extends Notification
{
    use Queueable;

    protected PaymentRequest $paymentRequest;

    public function __construct(PaymentRequest $paymentRequest)
    {
        $this->paymentRequest = $paymentRequest;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => '🔔 Nova Solicitação de Pagamento',
            'message' => sprintf(
                'Nova solicitação de %s para o processo %s',
                number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency,
                $this->paymentRequest->shipment->reference_number
            ),
            'action_url' => route('approvals.dashboard'),
            'action_text' => 'Revisar Solicitação',
            'payment_request_id' => $this->paymentRequest->id,
            'type' => 'payment_request_created',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nova Solicitação de Pagamento - ' . $this->paymentRequest->shipment->reference_number)
            ->greeting('Olá ' . $notifiable->name . ',')
            ->line('Uma nova solicitação de pagamento foi criada e requer sua aprovação.')
            ->line('**Detalhes da Solicitação:**')
            ->line('• Processo: ' . $this->paymentRequest->shipment->reference_number)
            ->line('• Valor: ' . number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency)
            ->line('• Destinatário: ' . $this->paymentRequest->payee)
            ->line('• Solicitado por: ' . $this->paymentRequest->requester->name)
            ->line('')
            ->line('**Descrição:**')
            ->line($this->paymentRequest->description)
            ->action('Revisar e Aprovar', route('approvals.dashboard'))
            ->line('Por favor, revise a cotação anexada e aprove ou rejeite esta solicitação.');
    }
}

/**
 * ========================================
 * NOTIFICAÇÃO: SOLICITAÇÃO APROVADA
 * ========================================
 * Enviada para: Finanças + Solicitante
 * Quando: Gestor aprova solicitação
 */
class PaymentRequestApproved extends Notification
{
    use Queueable;

    protected PaymentRequest $paymentRequest;

    public function __construct(PaymentRequest $paymentRequest)
    {
        $this->paymentRequest = $paymentRequest;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => '✅ Solicitação Aprovada',
            'message' => sprintf(
                'Solicitação de %s para %s foi aprovada',
                number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency,
                $this->paymentRequest->shipment->reference_number
            ),
            'action_url' => $notifiable->isFinance()
                ? route('finance.pending')
                : route('shipments.show', $this->paymentRequest->shipment),
            'action_text' => $notifiable->isFinance() ? 'Processar Pagamento' : 'Ver Processo',
            'payment_request_id' => $this->paymentRequest->id,
            'type' => 'payment_request_approved',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $isFinance = $notifiable->isFinance();

        $mail = (new MailMessage)
            ->subject('Solicitação Aprovada - ' . $this->paymentRequest->shipment->reference_number)
            ->greeting('Olá ' . $notifiable->name . ',');

        if ($isFinance) {
            $mail->line('Uma solicitação de pagamento foi aprovada e está pronta para processamento.')
                ->line('**Detalhes:**')
                ->line('• Processo: ' . $this->paymentRequest->shipment->reference_number)
                ->line('• Valor: ' . number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency)
                ->line('• Destinatário: ' . $this->paymentRequest->payee)
                ->line('• Aprovado por: ' . $this->paymentRequest->approver->name)
                ->action('Processar Pagamento', route('finance.pending'))
                ->line('Por favor, processe este pagamento e anexe o comprovativo.');
        } else {
            $mail->line('Sua solicitação de pagamento foi aprovada pelo gestor.')
                ->line('**Detalhes:**')
                ->line('• Processo: ' . $this->paymentRequest->shipment->reference_number)
                ->line('• Valor: ' . number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency)
                ->line('• Aprovado por: ' . $this->paymentRequest->approver->name)
                ->action('Ver Processo', route('shipments.show', $this->paymentRequest->shipment))
                ->line('O departamento financeiro processará o pagamento em breve.');
        }

        return $mail;
    }
}

/**
 * ========================================
 * NOTIFICAÇÃO: SOLICITAÇÃO REJEITADA
 * ========================================
 * Enviada para: Solicitante
 * Quando: Gestor rejeita solicitação
 */
class PaymentRequestRejected extends Notification
{
    use Queueable;

    protected PaymentRequest $paymentRequest;

    public function __construct(PaymentRequest $paymentRequest)
    {
        $this->paymentRequest = $paymentRequest;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => '❌ Solicitação Rejeitada',
            'message' => sprintf(
                'Solicitação para %s foi rejeitada',
                $this->paymentRequest->shipment->reference_number
            ),
            'action_url' => route('shipments.show', $this->paymentRequest->shipment),
            'action_text' => 'Ver Detalhes',
            'payment_request_id' => $this->paymentRequest->id,
            'type' => 'payment_request_rejected',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Solicitação Rejeitada - ' . $this->paymentRequest->shipment->reference_number)
            ->greeting('Olá ' . $notifiable->name . ',')
            ->line('Sua solicitação de pagamento foi rejeitada.')
            ->line('**Detalhes:**')
            ->line('• Processo: ' . $this->paymentRequest->shipment->reference_number)
            ->line('• Valor: ' . number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency)
            ->line('• Rejeitado por: ' . $this->paymentRequest->approver->name)
            ->line('')
            ->line('**Motivo da Rejeição:**')
            ->line($this->paymentRequest->rejection_reason)
            ->action('Ver Processo', route('shipments.show', $this->paymentRequest->shipment))
            ->line('Por favor, revise o motivo e crie uma nova solicitação se necessário.');
    }
}

/**
 * ========================================
 * NOTIFICAÇÃO: PAGAMENTO CONFIRMADO
 * ========================================
 * Enviada para: Solicitante + Gestor
 * Quando: Finanças confirma pagamento
 */
class PaymentConfirmed extends Notification
{
    use Queueable;

    protected PaymentRequest $paymentRequest;

    public function __construct(PaymentRequest $paymentRequest)
    {
        $this->paymentRequest = $paymentRequest;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => '💰 Pagamento Confirmado',
            'message' => sprintf(
                'Pagamento de %s para %s foi confirmado',
                number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency,
                $this->paymentRequest->shipment->reference_number
            ),
            'action_url' => route('shipments.show', $this->paymentRequest->shipment),
            'action_text' => 'Ver Processo',
            'payment_request_id' => $this->paymentRequest->id,
            'type' => 'payment_confirmed',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pagamento Confirmado - ' . $this->paymentRequest->shipment->reference_number)
            ->greeting('Olá ' . $notifiable->name . ',')
            ->line('O pagamento foi processado e confirmado pelo departamento financeiro.')
            ->line('**Detalhes:**')
            ->line('• Processo: ' . $this->paymentRequest->shipment->reference_number)
            ->line('• Valor: ' . number_format($this->paymentRequest->amount, 2) . ' ' . $this->paymentRequest->currency)
            ->line('• Destinatário: ' . $this->paymentRequest->payee)
            ->line('• Data do Pagamento: ' . $this->paymentRequest->payment_date)
            ->line('• Referência: ' . $this->paymentRequest->payment_reference)
            ->line('• Processado por: ' . $this->paymentRequest->payer->name)
            ->action('Ver Comprovativo', route('payment-requests.show', $this->paymentRequest))
            ->line('Aguardamos agora o recibo do fornecedor para completar o ciclo.');
    }
}

/**
 * ========================================
 * COMO USAR AS NOTIFICAÇÕES
 * ========================================
 *
 * No Controller, após cada ação:
 *
 * // Após criar solicitação
 * $managers = User::managers()->get();
 * Notification::send($managers, new PaymentRequestCreated($paymentRequest));
 *
 * // Após aprovar
 * $financeTeam = User::finance()->get();
 * Notification::send($financeTeam, new PaymentRequestApproved($paymentRequest));
 * $paymentRequest->requester->notify(new PaymentRequestApproved($paymentRequest));
 *
 * // Após rejeitar
 * $paymentRequest->requester->notify(new PaymentRequestRejected($paymentRequest));
 *
 * // Após confirmar pagamento
 * $paymentRequest->requester->notify(new PaymentConfirmed($paymentRequest));
 * $paymentRequest->approver->notify(new PaymentConfirmed($paymentRequest));
 */
