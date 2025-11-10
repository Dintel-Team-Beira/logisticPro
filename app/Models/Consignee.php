<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model Consignee (Consignatário)
 * Gestão de consignatários - destinatários das mercadorias
 *
 * @property int $id
 * @property int|null $client_id Cliente associado
 * @property string $name Nome completo/Razão social
 * @property string|null $tax_id NIF/NUIT
 * @property string|null $email Email
 * @property string|null $phone Telefone
 * @property string|null $address Endereço completo
 * @property string|null $city Cidade
 * @property string|null $country País
 * @property string|null $contact_person Pessoa de contato
 * @property string|null $notes Observações
 * @property bool $active Status ativo/inativo
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class Consignee extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'consignees';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'client_id',
        'name',
        'tax_id',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'contact_person',
        'notes',
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
     * Default values for attributes
     */
    protected $attributes = [
        'country' => 'MZ',
        'active' => true,
    ];

    /**
     * Get the attributes that should be searchable.
     */
    public static function searchableFields(): array
    {
        return [
            'name',
            'email',
            'phone',
            'tax_id',
            'city',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    /**
     * Get the client that owns this consignee
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get all shipments for this consignee
     */
    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active consignees
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to filter by client
     */
    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope to search consignees
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

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    /**
     * Get full address
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Get display name with contact
     */
    public function getDisplayNameAttribute(): string
    {
        $display = $this->name;

        if ($this->contact_person) {
            $display .= " (Contato: {$this->contact_person})";
        }

        return $display;
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
     * Activate consignee
     */
    public function activate(): bool
    {
        $this->active = true;
        return $this->save();
    }

    /**
     * Deactivate consignee
     */
    public function deactivate(): bool
    {
        $this->active = false;
        return $this->save();
    }
}
