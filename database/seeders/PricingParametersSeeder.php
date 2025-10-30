<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PricingParameter;

class PricingParametersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Popula parâmetros de precificação com valores de exemplo
     */
    public function run(): void
    {
        $parameters = [
            // ========================================
            // TIPOS DE CONTAINER
            // ========================================
            [
                'category' => 'container_type',
                'code' => '20DC',
                'name' => "20' Dry Container",
                'description' => 'Container seco de 20 pés',
                'price' => 45000.00,
                'order' => 1,
            ],
            [
                'category' => 'container_type',
                'code' => '40DC',
                'name' => "40' Dry Container",
                'description' => 'Container seco de 40 pés',
                'price' => 75000.00,
                'order' => 2,
            ],
            [
                'category' => 'container_type',
                'code' => '40HC',
                'name' => "40' High Cube",
                'description' => 'Container High Cube de 40 pés',
                'price' => 85000.00,
                'order' => 3,
            ],
            [
                'category' => 'container_type',
                'code' => '20RF',
                'name' => "20' Reefer",
                'description' => 'Container refrigerado de 20 pés',
                'price' => 95000.00,
                'order' => 4,
            ],
            [
                'category' => 'container_type',
                'code' => '40RF',
                'name' => "40' Reefer",
                'description' => 'Container refrigerado de 40 pés',
                'price' => 150000.00,
                'order' => 5,
            ],

            // ========================================
            // TIPOS DE MERCADORIA
            // ========================================
            [
                'category' => 'cargo_type',
                'code' => 'normal',
                'name' => 'Mercadoria Normal',
                'description' => 'Carga geral sem restrições',
                'price' => 0.00,
                'order' => 1,
            ],
            [
                'category' => 'cargo_type',
                'code' => 'perishable',
                'name' => 'Mercadoria Perecível',
                'description' => 'Produtos que requerem refrigeração',
                'price' => 25000.00,
                'order' => 2,
            ],
            [
                'category' => 'cargo_type',
                'code' => 'hazardous',
                'name' => 'Mercadoria Perigosa',
                'description' => 'Produtos químicos ou inflamáveis',
                'price' => 50000.00,
                'order' => 3,
            ],
            [
                'category' => 'cargo_type',
                'code' => 'oversized',
                'name' => 'Carga de Grandes Dimensões',
                'description' => 'Equipamentos ou maquinaria pesada',
                'price' => 35000.00,
                'order' => 4,
            ],

            // ========================================
            // REGIMES
            // ========================================
            [
                'category' => 'regime',
                'code' => 'nacional',
                'name' => 'Regime Nacional',
                'description' => 'Desembaraço aduaneiro nacional',
                'price' => 15000.00,
                'order' => 1,
            ],
            [
                'category' => 'regime',
                'code' => 'transito',
                'name' => 'Regime de Trânsito',
                'description' => 'Mercadoria em trânsito para outro país',
                'price' => 25000.00,
                'order' => 2,
            ],

            // ========================================
            // DESTINOS
            // ========================================
            [
                'category' => 'destination',
                'code' => 'mozambique',
                'name' => 'Moçambique',
                'description' => 'Destino final: Moçambique',
                'price' => 0.00,
                'order' => 1,
            ],
            [
                'category' => 'destination',
                'code' => 'malawi',
                'name' => 'Malawi',
                'description' => 'Destino final: Malawi',
                'price' => 85000.00,
                'order' => 2,
            ],
            [
                'category' => 'destination',
                'code' => 'zambia',
                'name' => 'Zâmbia',
                'description' => 'Destino final: Zâmbia',
                'price' => 95000.00,
                'order' => 3,
            ],
            [
                'category' => 'destination',
                'code' => 'zimbabwe',
                'name' => 'Zimbabwe',
                'description' => 'Destino final: Zimbabwe',
                'price' => 105000.00,
                'order' => 4,
            ],
            [
                'category' => 'destination',
                'code' => 'drc',
                'name' => 'RD Congo',
                'description' => 'Destino final: República Democrática do Congo',
                'price' => 150000.00,
                'order' => 5,
            ],

            // ========================================
            // SERVIÇOS ADICIONAIS
            // ========================================
            [
                'category' => 'additional_service',
                'code' => 'transport',
                'name' => 'Transporte até Destino',
                'description' => 'Transporte rodoviário até o destino final',
                'price' => 45000.00,
                'order' => 1,
            ],
            [
                'category' => 'additional_service',
                'code' => 'unloading',
                'name' => 'Descarga no Destino',
                'description' => 'Serviço de descarga no local de entrega',
                'price' => 15000.00,
                'order' => 2,
            ],
            [
                'category' => 'additional_service',
                'code' => 'storage',
                'name' => 'Armazenamento Temporário',
                'description' => 'Armazenamento em armazém (até 7 dias)',
                'price' => 20000.00,
                'order' => 3,
            ],
            [
                'category' => 'additional_service',
                'code' => 'insurance',
                'name' => 'Seguro de Carga',
                'description' => 'Seguro total da mercadoria',
                'price' => 35000.00,
                'order' => 4,
            ],
            [
                'category' => 'additional_service',
                'code' => 'customs_clearance',
                'name' => 'Desembaraço Aduaneiro',
                'description' => 'Serviço completo de desembaraço',
                'price' => 25000.00,
                'order' => 5,
            ],
        ];

        foreach ($parameters as $parameter) {
            PricingParameter::updateOrCreate(
                [
                    'category' => $parameter['category'],
                    'code' => $parameter['code'],
                ],
                $parameter
            );
        }

        $this->command->info('✅ Parâmetros de precificação criados com sucesso!');
        $this->command->info('   Total: ' . count($parameters) . ' parâmetros');
    }
}
