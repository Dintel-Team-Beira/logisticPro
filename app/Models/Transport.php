<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Transport
 * Gestão de transportes (caminhões, veículos e destinos)
 */
class Transport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tipo_veiculo',
        'matricula',
        'marca',
        'modelo',
        'ano',
        'capacidade_peso',
        'capacidade_volume',
        'motorista_nome',
        'motorista_telefone',
        'motorista_documento',
        'destinos',
        'observacoes',
        'ativo',
    ];

    protected $casts = [
        'destinos' => 'array',
        'ativo' => 'boolean',
        'ano' => 'integer',
        'capacidade_peso' => 'decimal:2',
        'capacidade_volume' => 'decimal:2',
    ];

    /**
     * Relacionamento com shipments (um transporte pode ter vários shipments)
     */
    public function shipments()
    {
        return $this->hasMany(Shipment::class, 'transport_id');
    }

    /**
     * Scope para transportes ativos
     */
    public function scopeActive($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope para filtrar por tipo de veículo
     */
    public function scopeByType($query, string $tipo)
    {
        return $query->where('tipo_veiculo', $tipo);
    }

    /**
     * Scope para filtrar por destino
     */
    public function scopeByDestino($query, string $destino)
    {
        return $query->whereJsonContains('destinos', $destino);
    }

    /**
     * Accessor para nome completo do veículo
     */
    public function getNomeCompletoAttribute(): string
    {
        $parts = array_filter([
            $this->marca,
            $this->modelo,
            $this->matricula,
        ]);

        return implode(' - ', $parts);
    }

    /**
     * Accessor para capacidade formatada
     */
    public function getCapacidadeFormatadaAttribute(): string
    {
        $capacidades = [];

        if ($this->capacidade_peso) {
            $capacidades[] = $this->capacidade_peso . ' ton';
        }

        if ($this->capacidade_volume) {
            $capacidades[] = $this->capacidade_volume . ' m³';
        }

        return implode(' | ', $capacidades) ?: 'Não especificado';
    }

    /**
     * Accessor para lista de destinos formatada
     */
    public function getDestinosFormatadosAttribute(): string
    {
        if (!$this->destinos || !is_array($this->destinos)) {
            return 'Nenhum destino cadastrado';
        }

        return implode(', ', $this->destinos);
    }

    /**
     * Verifica se o transporte está disponível
     */
    public function isDisponivel(): bool
    {
        return $this->ativo;
    }

    /**
     * Verifica se o transporte atende um destino específico
     */
    public function atendeDestino(string $destino): bool
    {
        if (!$this->destinos || !is_array($this->destinos)) {
            return false;
        }

        return in_array($destino, $this->destinos);
    }

    /**
     * Retorna os tipos de veículos disponíveis
     */
    public static function getTiposVeiculo(): array
    {
        return [
            'caminhao' => 'Caminhão',
            'carreta' => 'Carreta',
            'truck' => 'Truck',
            'van' => 'Van',
            'semi_reboque' => 'Semi-reboque',
            'bitrem' => 'Bitrem',
            'rodotrem' => 'Rodotrem',
            'outro' => 'Outro',
        ];
    }

    /**
     * Retorna os destinos mais comuns em Moçambique
     */
    public static function getDestinosComuns(): array
    {
        return [
            'Maputo',
            'Matola',
            'Beira',
            'Nampula',
            'Tete',
            'Quelimane',
            'Nacala',
            'Pemba',
            'Inhambane',
            'Xai-Xai',
            'Lichinga',
            'Chimoio',
            'Mocuba',
            'Gurué',
            'Vilankulo',
        ];
    }
}
