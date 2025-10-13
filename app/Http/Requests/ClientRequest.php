<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Client;

class ClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $clientId = $this->route('client')?->id;

        return [
            // Tipo e informações básicas
            'client_type' => [
                'required',
                Rule::in(array_keys(Client::getAvailableTypes()))
            ],
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',

            // Contatos
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('clients')->ignore($clientId)
            ],
            'secondary_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'secondary_phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',

            // Documentos fiscais
            'tax_id' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('clients')->ignore($clientId)
            ],
            'tax_id_type' => 'nullable|string|max:50',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',

            // Endereço principal
            'address' => 'nullable|string',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|size:2',

            // Endereço de faturação
            'billing_address' => 'nullable|string',
            'billing_city' => 'nullable|string|max:100',
            'billing_state' => 'nullable|string|max:100',
            'billing_postal_code' => 'nullable|string|max:20',
            'billing_country' => 'nullable|string|size:2',

            // Pessoa de contato
            'contact_person' => 'nullable|string|max:255',
            'contact_position' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',

            // Configurações comerciais
            'priority' => [
                'required',
                Rule::in(array_keys(Client::getAvailablePriorities()))
            ],
            'payment_terms' => [
                'required',
                Rule::in(array_keys(Client::getAvailablePaymentTerms()))
            ],
            'credit_limit' => 'required|integer|min:0',
            'preferred_currency' => 'required|string|size:3',

            // Status
            'active' => 'required|boolean',
            'blocked' => 'nullable|boolean',
            'blocked_reason' => 'nullable|string',

            // Observações e metadados
            'notes' => 'nullable|string',
            'tags' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',

            // Relacionamentos
            'assigned_to_user_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            'client_type' => 'tipo de cliente',
            'name' => 'nome',
            'company_name' => 'nome fantasia',
            'email' => 'email',
            'secondary_email' => 'email secundário',
            'phone' => 'telefone',
            'secondary_phone' => 'telefone secundário',
            'whatsapp' => 'WhatsApp',
            'tax_id' => 'NIF/NUIT',
            'tax_id_type' => 'tipo de documento fiscal',
            'industry' => 'setor',
            'website' => 'website',
            'address' => 'endereço',
            'address_line2' => 'complemento',
            'city' => 'cidade',
            'state' => 'estado',
            'postal_code' => 'código postal',
            'country' => 'país',
            'billing_address' => 'endereço de faturação',
            'billing_city' => 'cidade de faturação',
            'billing_state' => 'estado de faturação',
            'billing_postal_code' => 'código postal de faturação',
            'billing_country' => 'país de faturação',
            'contact_person' => 'pessoa de contato',
            'contact_position' => 'cargo do contato',
            'contact_phone' => 'telefone do contato',
            'contact_email' => 'email do contato',
            'priority' => 'prioridade',
            'payment_terms' => 'termos de pagamento',
            'credit_limit' => 'limite de crédito',
            'preferred_currency' => 'moeda preferida',
            'active' => 'ativo',
            'blocked' => 'bloqueado',
            'blocked_reason' => 'motivo do bloqueio',
            'notes' => 'observações',
            'tags' => 'tags',
            'metadata' => 'metadados',
            'assigned_to_user_id' => 'responsável',
        ];
    }

    /**
     * Get custom messages for validator errors
     */
    public function messages(): array
    {
        return [
            'client_type.required' => 'O tipo de cliente é obrigatório.',
            'client_type.in' => 'O tipo de cliente selecionado é inválido.',
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email deve ser um endereço de email válido.',
            'email.unique' => 'Este email já está cadastrado.',
            'tax_id.unique' => 'Este NIF/NUIT já está cadastrado.',
            'website.url' => 'O website deve ser uma URL válida.',
            'country.required' => 'O país é obrigatório.',
            'country.size' => 'O código do país deve ter 2 caracteres.',
            'priority.required' => 'A prioridade é obrigatória.',
            'payment_terms.required' => 'Os termos de pagamento são obrigatórios.',
            'credit_limit.required' => 'O limite de crédito é obrigatório.',
            'credit_limit.integer' => 'O limite de crédito deve ser um número inteiro.',
            'credit_limit.min' => 'O limite de crédito não pode ser negativo.',
            'preferred_currency.required' => 'A moeda preferida é obrigatória.',
            'preferred_currency.size' => 'O código da moeda deve ter 3 caracteres.',
            'assigned_to_user_id.exists' => 'O responsável selecionado não existe.',
        ];
    }
}
