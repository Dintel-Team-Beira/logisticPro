<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Model PricingParameter
 * Parâmetros de precificação para cotações automáticas
 *
 * @property int $id
 * @property string $category Categoria (container_type, cargo_type, regime, destination, additional_service)
 * @property string $code Código único
 * @property string $name Nome do parâmetro
 * @property string|null $description Descrição
 * @property float $price Preço em MZN
 * @property string $currency Moeda (default: MZN)
 * @property bool $active Status ativo/inativo
 * @property int $order Ordem de exibição
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class PricingParameter extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'pricing_parameters';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'category',
        'code',
        'name',
        'description',
        'price',
        'currency',
        'active',
        'order',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Default values for attributes
     */
    protected $attributes = [
        'currency' => 'MZN',
        'active' => true,
        'order' => 0,
        'price' => 0,
    ];

    /**
     * Categorias disponíveis
     */
    const CATEGORY_CONTAINER_TYPE = 'container_type';
    const CATEGORY_CARGO_TYPE = 'cargo_type';
    const CATEGORY_REGIME = 'regime';
    const CATEGORY_DESTINATION = 'destination';
    const CATEGORY_ADDITIONAL_SERVICE = 'additional_service';

    /**
     * Get category label in Portuguese
     */
    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_CONTAINER_TYPE => 'Tipo de Container',
            self::CATEGORY_CARGO_TYPE => 'Tipo de Mercadoria',
            self::CATEGORY_REGIME => 'Regime',
            self::CATEGORY_DESTINATION => 'Destino',
            self::CATEGORY_ADDITIONAL_SERVICE => 'Serviço Adicional',
            default => 'Desconhecido',
        };
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2, ',', '.') . ' ' . $this->currency;
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only active parameters
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to order by custom order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('name', 'asc');
    }

    /*
    |--------------------------------------------------------------------------
    | METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get all available categories
     */
    public static function getCategories(): array
    {
        return [
            self::CATEGORY_CONTAINER_TYPE => 'Tipo de Container',
            self::CATEGORY_CARGO_TYPE => 'Tipo de Mercadoria',
            self::CATEGORY_REGIME => 'Regime',
            self::CATEGORY_DESTINATION => 'Destino',
            self::CATEGORY_ADDITIONAL_SERVICE => 'Serviço Adicional',
        ];
    }

    /**
     * Get parameters grouped by category
     */
    public static function getGroupedParameters(): array
    {
        $parameters = self::active()->ordered()->get();

        return $parameters->groupBy('category')->map(function ($items) {
            return $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => $item->price,
                    'formatted_price' => $item->formatted_price,
                    'active' => $item->active,
                ];
            });
        })->toArray();
    }

    /**
     * Calculate quotation based on selections
     */
    public static function calculateQuotation(array $selections): array
    {
        $subtotal = 0;
        $breakdown = [];

        foreach ($selections as $category => $codes) {
            if (is_array($codes)) {
                // Múltiplas seleções (ex: serviços adicionais)
                foreach ($codes as $code) {
                    $param = self::active()
                        ->where('category', $category)
                        ->where('code', $code)
                        ->first();

                    if ($param) {
                        $subtotal += $param->price;
                        $breakdown[] = [
                            'category' => $param->category_label,
                            'name' => $param->name,
                            'price' => $param->price,
                        ];
                    }
                }
            } else {
                // Seleção única
                $param = self::active()
                    ->where('category', $category)
                    ->where('code', $codes)
                    ->first();

                if ($param) {
                    $subtotal += $param->price;
                    $breakdown[] = [
                        'category' => $param->category_label,
                        'name' => $param->name,
                        'price' => $param->price,
                    ];
                }
            }
        }

        // Calcular imposto (IVA 16% por exemplo - ajustar conforme necessário)
        $taxRate = 0.16;
        $tax = $subtotal * $taxRate;
        $total = $subtotal + $tax;

        return [
            'subtotal' => round($subtotal, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Activate parameter
     */
    public function activate(): bool
    {
        $this->active = true;
        return $this->save();
    }

    /**
     * Deactivate parameter
     */
    public function deactivate(): bool
    {
        $this->active = false;
        return $this->save();
    }
}
