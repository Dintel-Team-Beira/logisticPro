<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'email',
        'phone',
        'services', // Serviços oferecidos pela linha
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
        'services' => 'array', // JSON array de serviços
    ];

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    /**
     * Retorna lista de serviços disponíveis que uma linha pode oferecer
     */
    public static function getAvailableServices(): array
    {
        return [
            'freight' => 'Frete Marítimo',
            'thc' => 'THC (Terminal Handling Charge)',
            'storage' => 'Armazenagem/Storage',
            'documentation' => 'Documentação',
            'bl_fee' => 'Taxa de BL',
            'seal_fee' => 'Taxa de Selo',
            'inspection' => 'Inspeção de Container',
            'cleaning' => 'Limpeza de Container',
            'repair' => 'Reparos',
            'demurrage' => 'Demurrage (Sobrestadia)',
            'detention' => 'Detention (Detenção)',
            'vgm' => 'VGM (Verified Gross Mass)',
            'reefer' => 'Serviço Reefer (Refrigerado)',
            'hazmat' => 'Cargas Perigosas (Hazmat)',
            'oversized' => 'Cargas Sobredimensionadas',
            'customs_clearance' => 'Desembaraço Aduaneiro',
            'transport' => 'Transporte Terrestre',
            'other' => 'Outros Serviços',
        ];
    }
}
