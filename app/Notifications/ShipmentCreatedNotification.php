<?php

namespace App\Notifications;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $shipment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Shipment $shipment)
    {
        $this->shipment = $shipment;
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
        $type = $this->shipment->type === 'import' ? 'Importação' : 'Exportação';

        return (new MailMessage)
            ->subject("Novo Processo de {$type} Criado")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("Um novo processo de {$type} foi criado no sistema.")
            ->line("**Referência:** {$this->shipment->reference_number}")
            ->line("**Cliente:** {$this->shipment->client->name}")
            ->line("**BL Number:** " . ($this->shipment->bl_number ?? 'N/A'))
            ->action('Ver Processo', url("/shipments/{$this->shipment->id}"))
            ->line('Obrigado por usar o LogisticaPro!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Novo Processo Criado',
            'message' => "Processo {$this->shipment->reference_number} foi criado com sucesso",
            'type' => 'success',
            'shipment_id' => $this->shipment->id,
            'reference_number' => $this->shipment->reference_number,
            'action_url' => "/shipments/{$this->shipment->id}",
            'time' => now()->diffForHumans(),
        ];
    }
}
