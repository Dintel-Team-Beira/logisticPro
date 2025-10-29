<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

/**
 * Model Client
 * Gestão completa de clientes do sistema LogisticaPro
 *
 * @property int $id
 * @property string $client_type Tipo: individual, company, government, ngo
 * @property string $name Nome completo/Razão social
 * @property string|null $company_name Nome fantasia (para empresas)
 * @property string $email Email principal
 * @property string|null $secondary_email Email secundário
 * @property string|null $phone Telefone principal
 * @property string|null $secondary_phone Telefone secundário
 * @property string|null $whatsapp WhatsApp
 * @property string|null $tax_id NIF/NUIT
 * @property string|null $tax_id_type Tipo de documento fiscal
 * @property string|null $industry Setor/Indústria
 * @property string|null $website Website
 * @property string|null $address Endereço completo
 * @property string|null $address_line2 Complemento
 * @property string|null $city Cidade
 * @property string|null $state Estado/Província
 * @property string|null $postal_code Código postal
 * @property string $country País
 * @property string|null $billing_address Endereço de faturação
 * @property string|null $billing_city Cidade faturação
 * @property string|null $billing_state Estado faturação
 * @property string|null $billing_postal_code Código postal faturação
 * @property string|null $billing_country País faturação
 * @property string|null $contact_person Nome da pessoa de contato
 * @property string|null $contact_position Cargo do contato
 * @property string|null $contact_phone Telefone do contato
 * @property string|null $contact_email Email do contato
 * @property string $priority Prioridade: low, medium, high, vip
 * @property string $payment_terms Termos de pagamento
 * @property int $credit_limit Limite de crédito
 * @property string|null $preferred_currency Moeda preferida
 * @property bool $active Status ativo/inativo
 * @property bool $blocked Bloqueado para operações
 * @property string|null $blocked_reason Motivo do bloqueio
 * @property string|null $notes Observações gerais
 * @property string|null $tags Tags para categorização
 * @property array|null $metadata Metadados adicionais
 * @property int|null $assigned_to_user_id Responsável pelo cliente
 * @property \Carbon\Carbon|null $last_interaction_date Data última interação
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 *
 * @author Arnaldo Tomo
 */
class Client extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    /**
     * Tipos de cliente disponíveis
     */
    const TYPE_INDIVIDUAL = 'individual';
    const TYPE_COMPANY = 'company';
    const TYPE_GOVERNMENT = 'government';
    const TYPE_NGO = 'ngo';

    /**
     * Prioridades de cliente
     */
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_VIP = 'vip';

    /**
     * Termos de pagamento
     */
    const PAYMENT_IMMEDIATE = 'immediate';
    const PAYMENT_NET_15 = 'net_15';
    const PAYMENT_NET_30 = 'net_30';
    const PAYMENT_NET_45 = 'net_45';
    const PAYMENT_NET_60 = 'net_60';
    const PAYMENT_CUSTOM = 'custom';

    /**
     * The table associated with the model.
     */
    protected $table = 'clients';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'client_type',
        'name',
        'company_name',
        'email',
        'secondary_email',
        'phone',
        'secondary_phone',
        'whatsapp',
        'tax_id',
        'tax_id_type',
        'industry',
        'website',
        'address',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',
        'contact_person',
        'contact_position',
        'contact_phone',
        'contact_email',
        'priority',
        'payment_terms',
        'credit_limit',
        'preferred_currency',
        'active',
        'blocked',
        'blocked_reason',
        'notes',
        'tags',
        'metadata',
        'assigned_to_user_id',
        'last_interaction_date',
        'password',
        'portal_access',
        'email_verified_at',
        'last_login_at',
        'initial_access_token',
        'initial_access_token_expires_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'active' => 'boolean',
        'blocked' => 'boolean',
        'portal_access' => 'boolean',
        'credit_limit' => 'integer',
        'metadata' => 'array',
        'last_interaction_date' => 'datetime',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'initial_access_token_expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'initial_access_token',
    ];

    /**
     * Default values for attributes
     */
    protected $attributes = [
        'client_type' => self::TYPE_COMPANY,
        'priority' => self::PRIORITY_MEDIUM,
        'payment_terms' => self::PAYMENT_NET_30,
        'country' => 'MZ',
        'preferred_currency' => 'MZN',
        'credit_limit' => 0,
        'active' => true,
        'blocked' => false,
    ];

    /**
     * Get the attributes that should be searchable.
     */
    public static function searchableFields(): array
    {
        return [
            'name',
            'company_name',
            'email',
            'phone',
            'tax_id',
            'contact_person',
            'city',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    /**
     * Get all shipments for this client
     */
    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    /**
     * Get all consignees for this client
     */
    public function consignees()
    {
        return $this->hasMany(Consignee::class);
    }

    /**
     * Get active shipments only
     */
    public function activeShipments()
    {
        return $this->hasMany(Shipment::class)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled');
    }

    /**
     * Get all invoices for this client
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get all quotes for this client
     */
    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Get the user responsible for this client
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    /**
     * Get activities related to this client
     */
    public function activities()
    {
        return $this->hasManyThrough(
            Activity::class,
            Shipment::class,
            'client_id',
            'shipment_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active clients
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)
                     ->where('blocked', false);
    }

    /**
     * Scope to filter by client type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('client_type', $type);
    }

    /**
     * Scope to filter by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to get VIP clients
     */
    public function scopeVip($query)
    {
        return $query->where('priority', self::PRIORITY_VIP);
    }

    /**
     * Scope to search clients
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $searchFields = self::searchableFields();
            foreach ($searchFields as $field) {
                $q->orWhere($field, 'like', "%{$search}%");
            }
        });
    }

    /**
     * Scope to get clients with active shipments
     */
    public function scopeWithActiveShipments($query)
    {
        return $query->whereHas('activeShipments');
    }

    /**
     * Scope to filter by assigned user
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to_user_id', $userId);
    }

    /**
     * Scope to get blocked clients
     */
    public function scopeBlocked($query)
    {
        return $query->where('blocked', true);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    /**
     * Get display name (company or person)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->company_name ?: $this->name;
    }

    /**
     * Get formatted phone number
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        return $this->phone;
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->address_line2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Get client's full contact info
     */
    public function getFullContactAttribute(): string
    {
        $contact = $this->display_name;

        if ($this->email) {
            $contact .= " - {$this->email}";
        }

        if ($this->phone) {
            $contact .= " - {$this->phone}";
        }

        return $contact;
    }

    /**
     * Get priority badge color
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_LOW => 'gray',
            self::PRIORITY_MEDIUM => 'blue',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_VIP => 'purple',
            default => 'gray',
        };
    }

    /**
     * Get type label in Portuguese
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->client_type) {
            self::TYPE_INDIVIDUAL => 'Pessoa Física',
            self::TYPE_COMPANY => 'Empresa',
            self::TYPE_GOVERNMENT => 'Governamental',
            self::TYPE_NGO => 'ONG',
            default => 'Desconhecido',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get total number of shipments
     */
    public function getTotalShipmentsCount(): int
    {
        return $this->shipments()->count();
    }

    /**
     * Get number of active shipments
     */
    public function getActiveShipmentsCount(): int
    {
        return $this->activeShipments()->count();
    }

    /**
     * Get number of completed shipments
     */
    public function getCompletedShipmentsCount(): int
    {
        return $this->shipments()
            ->where('status', 'completed')
            ->count();
    }

    /**
     * Get total revenue from invoices
     */
    public function getTotalRevenue(): float
    {
        return $this->invoices()
            ->where('status', 'paid')
            ->sum('amount') ?? 0;
    }

    /**
     * Get pending invoices total
     */
    public function getPendingInvoicesTotal(): float
    {
        return $this->invoices()
            ->whereIn('status', ['pending', 'overdue'])
            ->sum('amount') ?? 0;
    }

    /**
     * Check if client has any active shipments
     */
    public function hasActiveShipments(): bool
    {
        return $this->activeShipments()->exists();
    }

    /**
     * Check if client can create new shipments
     */
    public function canCreateShipments(): bool
    {
        if (!$this->active || $this->blocked) {
            return false;
        }

        // Check credit limit
        $pendingAmount = $this->getPendingInvoicesTotal();
        if ($this->credit_limit > 0 && $pendingAmount >= $this->credit_limit) {
            return false;
        }

        return true;
    }

    /**
     * Block client
     */
    public function block(string $reason = null): bool
    {
        $this->blocked = true;
        $this->blocked_reason = $reason;
        return $this->save();
    }

    /**
     * Unblock client
     */
    public function unblock(): bool
    {
        $this->blocked = false;
        $this->blocked_reason = null;
        return $this->save();
    }

    /**
     * Deactivate client
     */
    public function deactivate(): bool
    {
        $this->active = false;
        return $this->save();
    }

    /**
     * Activate client
     */
    public function activate(): bool
    {
        $this->active = true;
        return $this->save();
    }

    /**
     * Update last interaction date
     */
    public function updateLastInteraction(): bool
    {
        $this->last_interaction_date = now();
        return $this->save();
    }

    /**
     * Get client statistics
     */
    public function getStats(): array
    {
        return [
            'total_shipments' => $this->getTotalShipmentsCount(),
            'active_shipments' => $this->getActiveShipmentsCount(),
            'completed_shipments' => $this->getCompletedShipmentsCount(),
            'total_revenue' => $this->getTotalRevenue(),
            'pending_invoices' => $this->getPendingInvoicesTotal(),
            'last_shipment_date' => $this->shipments()->latest()->first()?->created_at,
            'last_interaction' => $this->last_interaction_date,
            'can_create_shipments' => $this->canCreateShipments(),
        ];
    }

    /**
     * Get available types for select
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_COMPANY => 'Empresa',
            self::TYPE_INDIVIDUAL => 'Pessoa Física',
            self::TYPE_GOVERNMENT => 'Governamental',
            self::TYPE_NGO => 'ONG',
        ];
    }

    /**
     * Get available priorities for select
     */
    public static function getAvailablePriorities(): array
    {
        return [
            self::PRIORITY_LOW => 'Baixa',
            self::PRIORITY_MEDIUM => 'Média',
            self::PRIORITY_HIGH => 'Alta',
            self::PRIORITY_VIP => 'VIP',
        ];
    }

    /**
     * Get available payment terms for select
     */
    public static function getAvailablePaymentTerms(): array
    {
        return [
            self::PAYMENT_IMMEDIATE => 'Imediato',
            self::PAYMENT_NET_15 => 'Net 15 dias',
            self::PAYMENT_NET_30 => 'Net 30 dias',
            self::PAYMENT_NET_45 => 'Net 45 dias',
            self::PAYMENT_NET_60 => 'Net 60 dias',
            self::PAYMENT_CUSTOM => 'Personalizado',
        ];
    }

    /**
     * Generate initial access token for portal
     */
    public function generateInitialAccessToken(): string
    {
        $token = Str::random(64);
        $this->update([
            'initial_access_token' => hash('sha256', $token),
            'initial_access_token_expires_at' => now()->addDays(7),
        ]);

        return $token;
    }

    /**
     * Validate initial access token
     */
    public function validateInitialAccessToken(string $token): bool
    {
        if (!$this->initial_access_token || !$this->initial_access_token_expires_at) {
            return false;
        }

        if ($this->initial_access_token_expires_at->isPast()) {
            return false;
        }

        return hash_equals($this->initial_access_token, hash('sha256', $token));
    }

    /**
     * Set portal password and activate access
     */
    public function setPortalPassword(string $password): bool
    {
        $this->update([
            'password' => bcrypt($password),
            'portal_access' => true,
            'initial_access_token' => null,
            'initial_access_token_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        return true;
    }

    /**
     * Check if client can access portal
     */
    public function canAccessPortal(): bool
    {
        return $this->portal_access
            && $this->active
            && !$this->blocked
            && $this->password !== null;
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): bool
    {
        $this->last_login_at = now();
        return $this->save();
    }

    /*
    |--------------------------------------------------------------------------
    | BOOT METHOD
    |--------------------------------------------------------------------------
    */

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        // Auto-update last interaction when creating shipment
        static::created(function ($client) {
            $client->updateLastInteraction();
        });
    }
}
