<?php

namespace App\Notifications;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentStageChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $shipment;
    protected $newStage;
    protected $oldStage;

    /**
     * Create a new notification instance.
     */
    public function __construct(Shipment $shipment, string $newStage, ?string $oldStage = null)
    {
        $this->shipment = $shipment;
        $this->newStage = $newStage;
        $this->oldStage = $oldStage;
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
        $stageName = $this->getStageLabel($this->newStage);

        return (new MailMessage)
            ->subject("Processo {$this->shipment->reference_number} - Mudança de Etapa")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("O processo {$this->shipment->reference_number} mudou de etapa.")
            ->line("**Nova Etapa:** {$stageName}")
            ->line("**Cliente:** {$this->shipment->client->name}")
            ->action('Ver Processo', url("/shipments/{$this->shipment->id}"))
            ->line('Continue acompanhando o progresso do processo!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $stageName = $this->getStageLabel($this->newStage);

        return [
            'title' => 'Mudança de Etapa',
            'message' => "Processo {$this->shipment->reference_number} agora está em: {$stageName}",
            'type' => 'info',
            'shipment_id' => $this->shipment->id,
            'reference_number' => $this->shipment->reference_number,
            'new_stage' => $this->newStage,
            'old_stage' => $this->oldStage,
            'action_url' => "/shipments/{$this->shipment->id}",
            'time' => now()->diffForHumans(),
        ];
    }

    /**
     * Get stage label in Portuguese
     */
    private function getStageLabel($stage): string
    {
        return match($stage) {
            'coleta_dispersa' => 'Coleta Dispersa',
            'legalizacao' => 'Legalização',
            'alfandegas' => 'Alfândegas',
            'cornelder' => 'Cornelder',
            'taxacao' => 'Taxação',
            'completed' => 'Concluído',
            default => ucfirst($stage)
        };
    }
}
