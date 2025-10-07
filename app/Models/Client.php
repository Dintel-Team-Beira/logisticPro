<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model Client
 * Representa clientes/empresas que importam através do sistema
 *
 * @property int $id
 * @property string $name Nome da empresa
 * @property string $email Email de contato
 * @property string|null $phone Telefone
 * @property string|null $address Endereço
 * @property string|null $tax_id NIF/NUIT
 * @property bool $active Status ativo/inativo
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class Client extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'clients';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'tax_id',
        'active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [];

    /**
     * Get the attributes that should be searchable.
     */
    public static function searchableFields(): array
    {
        return ['name', 'email', 'phone', 'tax_id'];
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
     * Get active shipments only
     */
    public function activeShipments()
    {
        return $this->hasMany(Shipment::class)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled');
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
        return $query->where('active', true);
    }

    /**
     * Scope to search clients by name or email
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('tax_id', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to get clients with active shipments
     */
    public function scopeWithActiveShipments($query)
    {
        return $query->whereHas('activeShipments');
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    /**
     * Get formatted phone number
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone) {
            return null;
        }

        // Format phone number if needed
        return $this->phone;
    }

    /**
     * Get client's full contact info
     */
    public function getFullContactAttribute(): string
    {
        $contact = $this->name;

        if ($this->email) {
            $contact .= " - {$this->email}";
        }

        if ($this->phone) {
            $contact .= " - {$this->phone}";
        }

        return $contact;
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
     * Check if client has any active shipments
     */
    public function hasActiveShipments(): bool
    {
        return $this->activeShipments()->exists();
    }

    /**
     * Deactivate client (soft deactivation)
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
     * Get client statistics
     */
    public function getStats(): array
    {
        return [
            'total_shipments' => $this->getTotalShipmentsCount(),
            'active_shipments' => $this->getActiveShipmentsCount(),
            'completed_shipments' => $this->getCompletedShipmentsCount(),
            'last_shipment_date' => $this->shipments()->latest()->first()?->created_at,
        ];
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
        // Automatically trim whitespace from name and email
        static::creating(function ($client) {
            $client->name = trim($client->name);
            $client->email = trim(strtolower($client->email));
        });

        static::updating(function ($client) {
            if ($client->isDirty('name')) {
                $client->name = trim($client->name);
            }
            if ($client->isDirty('email')) {
                $client->email = trim(strtolower($client->email));
            }
        });
    }
}
