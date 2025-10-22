<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $document;

    /**
     * Create a new notification instance.
     */
    public function __construct(Document $document)
    {
        $this->document = $document;
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
        $shipmentRef = $this->document->shipment->reference_number ?? 'N/A';

        return (new MailMessage)
            ->subject("Novo Documento Carregado - {$this->document->name}")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("Um novo documento foi carregado no sistema.")
            ->line("**Documento:** {$this->document->name}")
            ->line("**Processo:** {$shipmentRef}")
            ->line("**Tipo:** " . $this->getDocumentTypeLabel($this->document->type))
            ->action('Ver Documento', url("/shipments/{$this->document->shipment_id}"))
            ->line('Obrigado por usar o LogisticaPro!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Documento Carregado',
            'message' => "Documento {$this->document->name} foi carregado",
            'type' => 'info',
            'document_id' => $this->document->id,
            'document_name' => $this->document->name,
            'shipment_id' => $this->document->shipment_id,
            'action_url' => "/shipments/{$this->document->shipment_id}",
            'time' => now()->diffForHumans(),
        ];
    }

    /**
     * Get document type label
     */
    private function getDocumentTypeLabel($type): string
    {
        return match($type) {
            'bl' => 'Bill of Lading',
            'invoice' => 'Fatura Comercial',
            'packing_list' => 'Packing List',
            'certificate' => 'Certificado',
            'customs' => 'Documento Alfandegário',
            'other' => 'Outros',
            default => ucfirst($type)
        };
    }
}
