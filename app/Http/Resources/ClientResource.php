<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Informações básicas
            'client_type' => $this->client_type,
            'type_label' => $this->type_label,
            'name' => $this->name,
            'company_name' => $this->company_name,
            'display_name' => $this->display_name,

            // Contatos
            'email' => $this->email,
            'secondary_email' => $this->secondary_email,
            'phone' => $this->phone,
            'formatted_phone' => $this->formatted_phone,
            'secondary_phone' => $this->secondary_phone,
            'whatsapp' => $this->whatsapp,

            // Documentos fiscais
            'tax_id' => $this->tax_id,
            'tax_id_type' => $this->tax_id_type,
            'industry' => $this->industry,
            'website' => $this->website,

            // Endereço principal
            'address' => $this->address,
            'address_line2' => $this->address_line2,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'full_address' => $this->full_address,

            // Endereço de faturação
            'billing_address' => $this->billing_address,
            'billing_city' => $this->billing_city,
            'billing_state' => $this->billing_state,
            'billing_postal_code' => $this->billing_postal_code,
            'billing_country' => $this->billing_country,

            // Pessoa de contato
            'contact_person' => $this->contact_person,
            'contact_position' => $this->contact_position,
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,

            // Configurações comerciais
            'priority' => $this->priority,
            'priority_color' => $this->priority_color,
            'payment_terms' => $this->payment_terms,
            'credit_limit' => $this->credit_limit,
            'preferred_currency' => $this->preferred_currency,

            // Status
            'active' => $this->active,
            'blocked' => $this->blocked,
            'blocked_reason' => $this->blocked_reason,

            // Observações e metadados
            'notes' => $this->notes,
            'tags' => $this->tags,
            'metadata' => $this->metadata,

            // Contadores
            'shipments_count' => $this->whenCounted('shipments'),
            'active_shipments_count' => $this->whenCounted('activeShipments'),

            // Relacionamentos
            'assigned_user' => $this->whenLoaded('assignedUser', function() {
                return [
                    'id' => $this->assignedUser->id,
                    'name' => $this->assignedUser->name,
                ];
            }),

            'shipments' => $this->whenLoaded('shipments'),
            'invoices' => $this->whenLoaded('invoices'),

            // Timestamps
            'last_interaction_date' => $this->last_interaction_date?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),

            // Formatted dates for display
            'created_at_formatted' => $this->created_at->format('d/m/Y H:i'),
            'updated_at_formatted' => $this->updated_at,
            'last_interaction_formatted' => $this->last_interaction_date?->format('d/m/Y H:i'),

            // Additional computed properties
            'full_contact' => $this->full_contact,
            'can_create_shipments' => $this->canCreateShipments(),
        ];
    }
}
