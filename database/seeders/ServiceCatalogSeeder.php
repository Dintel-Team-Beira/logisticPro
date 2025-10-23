<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCatalog;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            // ========== FRETE MARÍTIMO ==========
            [
                'code' => 'SRV-0001',
                'name' => 'Frete Marítimo - Container 20\'',
                'description' => 'Transporte marítimo internacional em container de 20 pés',
                'category' => 'freight',
                'unit_price' => 45000.00,
                'unit' => 'container',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'SRV-0002',
                'name' => 'Frete Marítimo - Container 40\'',
                'description' => 'Transporte marítimo internacional em container de 40 pés',
                'category' => 'freight',
                'unit_price' => 75000.00,
                'unit' => 'container',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'SRV-0003',
                'name' => 'Frete Aéreo Internacional',
                'description' => 'Transporte aéreo internacional de carga',
                'category' => 'freight',
                'unit_price' => 850.00,
                'unit' => 'kg',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 3,
            ],

            // ========== DESEMBARAÇO ADUANEIRO ==========
            [
                'code' => 'SRV-0004',
                'name' => 'Desembaraço Aduaneiro - Importação',
                'description' => 'Processamento completo de documentação alfandegária de importação',
                'category' => 'customs',
                'unit_price' => 12000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'code' => 'SRV-0005',
                'name' => 'Desembaraço Aduaneiro - Exportação',
                'description' => 'Processamento completo de documentação alfandegária de exportação',
                'category' => 'customs',
                'unit_price' => 8000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'code' => 'SRV-0006',
                'name' => 'Taxa de Urgência - Alfândega',
                'description' => 'Processamento prioritário na alfândega (24-48h)',
                'category' => 'customs',
                'unit_price' => 5000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 12,
            ],

            // ========== ARMAZENAGEM ==========
            [
                'code' => 'SRV-0007',
                'name' => 'Armazenagem em Depósito',
                'description' => 'Armazenamento de mercadoria em depósito alfandegado',
                'category' => 'warehousing',
                'unit_price' => 2500.00,
                'unit' => 'month',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'code' => 'SRV-0008',
                'name' => 'Armazenagem Frigorífica',
                'description' => 'Armazenamento refrigerado de mercadoria perecível',
                'category' => 'warehousing',
                'unit_price' => 4500.00,
                'unit' => 'month',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 21,
            ],

            // ========== MANUSEIO ==========
            [
                'code' => 'SRV-0009',
                'name' => 'Manuseio e Movimentação',
                'description' => 'Carga e descarga de containers e mercadorias',
                'category' => 'handling',
                'unit_price' => 3500.00,
                'unit' => 'container',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 30,
            ],
            [
                'code' => 'SRV-0010',
                'name' => 'Paletização',
                'description' => 'Organização de mercadoria em paletes',
                'category' => 'handling',
                'unit_price' => 150.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 31,
            ],
            [
                'code' => 'SRV-0011',
                'name' => 'Embalagem e Proteção',
                'description' => 'Embalagem especial e proteção de mercadoria',
                'category' => 'handling',
                'unit_price' => 200.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 32,
            ],

            // ========== TRANSPORTE TERRESTRE ==========
            [
                'code' => 'SRV-0012',
                'name' => 'Transporte Terrestre - Maputo',
                'description' => 'Transporte rodoviário dentro da cidade de Maputo',
                'category' => 'transport',
                'unit_price' => 2500.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 40,
            ],
            [
                'code' => 'SRV-0013',
                'name' => 'Transporte Terrestre - Interprovincial',
                'description' => 'Transporte rodoviário entre províncias',
                'category' => 'transport',
                'unit_price' => 180.00,
                'unit' => 'kg',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 41,
            ],

            // ========== SEGURO ==========
            [
                'code' => 'SRV-0014',
                'name' => 'Seguro de Carga - Nacional',
                'description' => 'Seguro de transporte de carga em território nacional',
                'category' => 'insurance',
                'unit_price' => 0.50,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 50,
                'metadata' => ['calculation' => 'percentage_of_value', 'rate' => 0.5],
            ],
            [
                'code' => 'SRV-0015',
                'name' => 'Seguro de Carga - Internacional',
                'description' => 'Seguro de transporte de carga internacional',
                'category' => 'insurance',
                'unit_price' => 0.75,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 51,
                'metadata' => ['calculation' => 'percentage_of_value', 'rate' => 0.75],
            ],

            // ========== DOCUMENTAÇÃO ==========
            [
                'code' => 'SRV-0016',
                'name' => 'Processamento de BL (Bill of Lading)',
                'description' => 'Emissão e processamento de conhecimento de embarque',
                'category' => 'documentation',
                'unit_price' => 1500.00,
                'unit' => 'document',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 60,
            ],
            [
                'code' => 'SRV-0017',
                'name' => 'Certificado de Origem',
                'description' => 'Emissão de certificado de origem da mercadoria',
                'category' => 'documentation',
                'unit_price' => 800.00,
                'unit' => 'document',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 61,
            ],
            [
                'code' => 'SRV-0018',
                'name' => 'Licença de Importação',
                'description' => 'Processamento de licença de importação',
                'category' => 'documentation',
                'unit_price' => 2000.00,
                'unit' => 'document',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 62,
            ],

            // ========== INSPEÇÃO ==========
            [
                'code' => 'SRV-0019',
                'name' => 'Inspeção de Container',
                'description' => 'Vistoria completa de container antes do embarque',
                'category' => 'inspection',
                'unit_price' => 1200.00,
                'unit' => 'container',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 70,
            ],
            [
                'code' => 'SRV-0020',
                'name' => 'Inspeção Fitossanitária',
                'description' => 'Inspeção sanitária de produtos agrícolas',
                'category' => 'inspection',
                'unit_price' => 2500.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 71,
            ],

            // ========== CONSULTORIA ==========
            [
                'code' => 'SRV-0021',
                'name' => 'Consultoria em Comércio Exterior',
                'description' => 'Assessoria especializada em importação e exportação',
                'category' => 'consulting',
                'unit_price' => 5000.00,
                'unit' => 'hour',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 80,
            ],
            [
                'code' => 'SRV-0022',
                'name' => 'Análise de Viabilidade Logística',
                'description' => 'Estudo de viabilidade e otimização de rotas',
                'category' => 'consulting',
                'unit_price' => 15000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 81,
            ],

            // ========== OUTROS ==========
            [
                'code' => 'SRV-0023',
                'name' => 'Taxa de Gestão de Processo',
                'description' => 'Taxa administrativa de gestão do processo logístico',
                'category' => 'other',
                'unit_price' => 3000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 90,
            ],
            [
                'code' => 'SRV-0024',
                'name' => 'Rastreamento e Monitoramento',
                'description' => 'Sistema de rastreamento GPS de carga',
                'category' => 'other',
                'unit_price' => 1500.00,
                'unit' => 'month',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 91,
            ],
            [
                'code' => 'SRV-0025',
                'name' => 'Serviços de Urgência',
                'description' => 'Taxa adicional para processamento urgente',
                'category' => 'other',
                'unit_price' => 8000.00,
                'unit' => 'unit',
                'tax_type' => 'excluded',
                'tax_rate' => 17.00,
                'is_active' => true,
                'sort_order' => 92,
            ],
        ];

        foreach ($services as $service) {
            ServiceCatalog::create($service);
        }

        $this->command->info('✅ 25 serviços criados com sucesso!');
        $this->command->info('📦 Categorias: Frete, Alfândega, Armazenagem, Manuseio, Transporte, Seguro, Documentação, Inspeção, Consultoria, Outros');
    }
}
