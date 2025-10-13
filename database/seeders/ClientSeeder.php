<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pegar primeiro usuário para atribuir como responsável
        $firstUser = Auth::user();

        $clients = [
            // Cliente VIP - Empresa Grande
            [
                'client_type' => 'company',
                'name' => 'Importadora Moçambicana Lda',
                'company_name' => 'Importadora Moz',
                'email' => 'contato@importadoramoz.mz',
                'secondary_email' => 'financeiro@importadoramoz.mz',
                'phone' => '+258 84 111 2222',
                'secondary_phone' => '+258 84 111 2223',
                'whatsapp' => '+258 84 111 2222',
                'tax_id' => '400123456',
                'tax_id_type' => 'NUIT',
                'industry' => 'Importação e Exportação',
                'website' => 'https://importadoramoz.mz',
                'address' => 'Av. Julius Nyerere, 1234',
                'address_line2' => 'Edifício Millennium, 5º andar',
                'city' => 'Maputo',
                'state' => 'Maputo',
                'postal_code' => '1100',
                'country' => 'MZ',
                'contact_person' => 'Carlos Macamo',
                'contact_position' => 'Diretor de Compras',
                'contact_phone' => '+258 84 111 2224',
                'contact_email' => 'carlos.macamo@importadoramoz.mz',
                'priority' => 'vip',
                'payment_terms' => 'net_30',
                'credit_limit' => 5000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'notes' => 'Cliente VIP com alto volume mensal. Sempre paga em dia.',
                'tags' => 'vip, importador, alto-volume',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(2),
            ],

            // Cliente Alta Prioridade
            [
                'client_type' => 'company',
                'name' => 'Logística Beira SA',
                'company_name' => 'Logística Beira',
                'email' => 'info@logisticabeira.mz',
                'phone' => '+258 82 333 4444',
                'whatsapp' => '+258 82 333 4444',
                'tax_id' => '400987654',
                'tax_id_type' => 'NUIT',
                'industry' => 'Logística e Transportes',
                'website' => 'https://logisticabeira.mz',
                'address' => 'Rua da Praia, 456',
                'city' => 'Beira',
                'state' => 'Sofala',
                'postal_code' => '2100',
                'country' => 'MZ',
                'contact_person' => 'Ana Santos',
                'contact_position' => 'Gerente Operacional',
                'contact_phone' => '+258 82 333 4445',
                'contact_email' => 'ana.santos@logisticabeira.mz',
                'priority' => 'high',
                'payment_terms' => 'net_45',
                'credit_limit' => 3000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'notes' => 'Parceiro estratégico na região da Beira.',
                'tags' => 'transportadora, beira, parceiro',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(5),
            ],

            // Cliente Governamental
            [
                'client_type' => 'government',
                'name' => 'Ministério da Agricultura e Desenvolvimento Rural',
                'company_name' => 'MADER',
                'email' => 'procurement@agricultura.gov.mz',
                'phone' => '+258 21 123 4567',
                'tax_id' => '500111222',
                'tax_id_type' => 'NUIT',
                'industry' => 'Governo',
                'website' => 'https://www.agricultura.gov.mz',
                'address' => 'Praça dos Heróis Moçambicanos',
                'city' => 'Maputo',
                'state' => 'Maputo',
                'postal_code' => '1100',
                'country' => 'MZ',
                'contact_person' => 'Dr. Manuel Chissano',
                'contact_position' => 'Diretor de Aquisições',
                'contact_phone' => '+258 21 123 4568',
                'contact_email' => 'm.chissano@agricultura.gov.mz',
                'priority' => 'high',
                'payment_terms' => 'net_60',
                'credit_limit' => 10000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'notes' => 'Processos de licitação. Requer documentação completa.',
                'tags' => 'governo, licitação, agricultura',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(10),
            ],

            // Cliente ONG
            [
                'client_type' => 'ngo',
                'name' => 'Organização para Desenvolvimento Rural - ODR',
                'company_name' => 'ODR Moçambique',
                'email' => 'contact@odrmozambique.org',
                'phone' => '+258 84 555 6666',
                'tax_id' => '600222333',
                'tax_id_type' => 'NUIT',
                'industry' => 'Desenvolvimento Social',
                'website' => 'https://www.odrmoçambique.org',
                'address' => 'Av. Eduardo Mondlane, 789',
                'city' => 'Nampula',
                'state' => 'Nampula',
                'postal_code' => '3100',
                'country' => 'MZ',
                'contact_person' => 'Maria Tembe',
                'contact_position' => 'Coordenadora de Projetos',
                'contact_phone' => '+258 84 555 6667',
                'contact_email' => 'maria.tembe@odrmoçambique.org',
                'priority' => 'medium',
                'payment_terms' => 'net_30',
                'credit_limit' => 1500000,
                'preferred_currency' => 'USD',
                'active' => true,
                'blocked' => false,
                'notes' => 'Projetos financiados por doadores internacionais.',
                'tags' => 'ong, desenvolvimento, rural',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(7),
            ],

            // Cliente Pessoa Física
            [
                'client_type' => 'individual',
                'name' => 'João Alberto da Silva',
                'email' => 'joao.silva@email.mz',
                'phone' => '+258 87 777 8888',
                'whatsapp' => '+258 87 777 8888',
                'tax_id' => '123456789',
                'tax_id_type' => 'NIF',
                'address' => 'Bairro da Matola A, Quarteirão 12',
                'city' => 'Matola',
                'state' => 'Maputo',
                'postal_code' => '1200',
                'country' => 'MZ',
                'priority' => 'low',
                'payment_terms' => 'immediate',
                'credit_limit' => 500000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'notes' => 'Cliente particular. Importações ocasionais.',
                'tags' => 'particular, importação-pessoal',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(15),
            ],

            // Cliente Empresa Média
            [
                'client_type' => 'company',
                'name' => 'Comércio e Indústria Tete Lda',
                'company_name' => 'CI Tete',
                'email' => 'comercial@citete.mz',
                'phone' => '+258 82 444 5555',
                'tax_id' => '400555666',
                'tax_id_type' => 'NUIT',
                'industry' => 'Comércio Geral',
                'address' => 'Rua Principal, 123',
                'city' => 'Tete',
                'state' => 'Tete',
                'postal_code' => '2300',
                'country' => 'MZ',
                'contact_person' => 'Paulo Moiane',
                'contact_position' => 'Gerente Comercial',
                'contact_phone' => '+258 82 444 5556',
                'contact_email' => 'paulo@citete.mz',
                'priority' => 'medium',
                'payment_terms' => 'net_30',
                'credit_limit' => 2000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'tags' => 'comercio, tete',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(12),
            ],

            // Cliente Empresa com Endereço de Faturação Diferente
            [
                'client_type' => 'company',
                'name' => 'Distribuições Norte SA',
                'company_name' => 'Distri Norte',
                'email' => 'contato@distrinorte.mz',
                'phone' => '+258 84 666 7777',
                'tax_id' => '400777888',
                'tax_id_type' => 'NUIT',
                'industry' => 'Distribuição',
                'website' => 'https://distrinorte.mz',
                // Endereço principal (filial)
                'address' => 'Zona Industrial, Lote 45',
                'city' => 'Pemba',
                'state' => 'Cabo Delgado',
                'postal_code' => '3200',
                'country' => 'MZ',
                // Endereço de faturação (sede)
                'billing_address' => 'Av. 25 de Setembro, 890',
                'billing_city' => 'Maputo',
                'billing_state' => 'Maputo',
                'billing_postal_code' => '1100',
                'billing_country' => 'MZ',
                'contact_person' => 'Sandra Nhantumbo',
                'contact_position' => 'Diretora Administrativa',
                'contact_phone' => '+258 84 666 7778',
                'contact_email' => 'sandra@distrinorte.mz',
                'priority' => 'high',
                'payment_terms' => 'net_30',
                'credit_limit' => 4000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => false,
                'notes' => 'Sede em Maputo, filial em Pemba. Faturar para sede.',
                'tags' => 'distribuicao, pemba, filiais',
                'assigned_to_user_id' => $firstUser?->id,
                'last_interaction_date' => now()->subDays(3),
            ],

            // Cliente Bloqueado (exemplo)
            [
                'client_type' => 'company',
                'name' => 'Importações Rápidas Lda',
                'email' => 'contato@imprapidas.mz',
                'phone' => '+258 82 888 9999',
                'tax_id' => '400999000',
                'tax_id_type' => 'NUIT',
                'industry' => 'Importação',
                'address' => 'Rua do Comércio, 567',
                'city' => 'Maputo',
                'country' => 'MZ',
                'priority' => 'low',
                'payment_terms' => 'net_15',
                'credit_limit' => 1000000,
                'preferred_currency' => 'MZN',
                'active' => true,
                'blocked' => true,
                'blocked_reason' => 'Inadimplência - 3 faturas em atraso há mais de 90 dias.',
                'notes' => 'Bloqueado até regularização dos pagamentos pendentes.',
                'tags' => 'bloqueado, inadimplente',
                'last_interaction_date' => now()->subDays(60),
            ],
        ];

        foreach ($clients as $clientData) {
            Client::create($clientData);
        }

        $this->command->info('✅ ' . count($clients) . ' clientes de teste criados com sucesso!');
        $this->command->info('📊 Distribuição:');
        $this->command->info('   - Empresas: ' . collect($clients)->where('client_type', 'company')->count());
        $this->command->info('   - Pessoas Físicas: ' . collect($clients)->where('client_type', 'individual')->count());
        $this->command->info('   - Governamentais: ' . collect($clients)->where('client_type', 'government')->count());
        $this->command->info('   - ONGs: ' . collect($clients)->where('client_type', 'ngo')->count());
        $this->command->info('   - VIP: ' . collect($clients)->where('priority', 'vip')->count());
        $this->command->info('   - Bloqueados: ' . collect($clients)->where('blocked', true)->count());
    }
}
