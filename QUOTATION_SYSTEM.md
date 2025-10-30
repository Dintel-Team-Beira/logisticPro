# 📊 Sistema de Cotação Automática - Guia Completo

## 🎯 Visão Geral

Sistema completo de precificação automática que permite:
- Admin configurar preços de parâmetros
- Cálculo automático de cotações ao criar processos
- Geração de PDF profissional das cotações
- Aprovação/rejeição de cotações

---

## 🚀 Instalação e Configuração

### 1. Rodar Migrations
```bash
php artisan migrate
```

### 2. Popular Parâmetros Iniciais
```bash
php artisan db:seed --class=PricingParametersSeeder
```

Isso criará parâmetros de exemplo com preços em MZN para:
- **Containers**: 20DC (45k), 40DC (75k), 40HC (85k), 20RF (95k), 40RF (150k)
- **Mercadoria**: Normal (0), Perecível (+25k), Perigosa (+50k), Grandes Dimensões (+35k)
- **Regimes**: Nacional (15k), Trânsito (25k)
- **Destinos**: Moçambique (0), Malawi (+85k), Zâmbia (+95k), Zimbabwe (+105k), RD Congo (+150k)
- **Serviços**: Transporte (45k), Descarga (15k), Armazenamento (20k), Seguro (35k), Desembaraço (25k)

### 3. Instalar Dependência de PDF (se ainda não tiver)
```bash
composer require barryvdh/laravel-dompdf
```

---

## ⚙️ Como Usar - ADMIN

### 1. Configurar Preços dos Parâmetros

**Acesse:** `/settings/pricing-parameters`

#### Funções Disponíveis:
- ✅ Ver todos os parâmetros organizados por categoria (Tabs)
- ✅ Criar novos parâmetros
- ✅ Editar preços existentes
- ✅ Ativar/Desativar parâmetros
- ✅ Excluir parâmetros não utilizados

#### Como Criar um Novo Parâmetro:
1. Selecione a categoria (Tab)
2. Clique em "Novo Parâmetro"
3. Preencha:
   - **Código**: Identificador único (ex: "40DC", "malawi")
   - **Nome**: Nome exibido (ex: "40' Dry Container")
   - **Descrição**: Detalhes adicionais
   - **Preço**: Valor em MZN
   - **Ordem**: Para ordenação na lista
   - **Status**: Ativo/Inativo
4. Salvar

---

## 💼 Como Usar - CRIAÇÃO DE PROCESSOS

### 1. Criar Processo com Cotação Automática

**Acesse:** `/shipments/create`

#### Passos:
1. **Selecione o Cliente** (Step 1)
2. **Escolha o Tipo** de processo (Step 2): Import, Export, Transit ou Transport
3. **Preencha Documentação** (Step 3)
4. **Configure Detalhes do Container/Carga** (Step 4)
   - Selecione **Tipo de Container** (ex: 40DC)
   - Selecione **Tipo de Mercadoria** (ex: Perecível)
   - Selecione **Regime** (Nacional ou Trânsito)
   - Selecione **Destino Final** (ex: Malawi)
   - Marque **Serviços Adicionais** desejados
5. **Visualize a Cotação Automática**
   - O sistema calcula em tempo real conforme você seleciona
   - Vê o breakdown de todos os custos
   - Vê Subtotal, IVA (16%) e Total
6. **Confirmar e Criar** (Step 5)
   - A cotação é salva automaticamente com referência única (ex: COT-2025-0001)

### 2. Exemplo de Cálculo

**Seleções:**
- Container 40DC = 75.000 MZN
- Mercadoria Perecível = +25.000 MZN
- Regime Trânsito = +25.000 MZN
- Destino Malawi = +85.000 MZN
- Serviço: Transporte = +45.000 MZN
- Serviço: Descarga = +15.000 MZN

**Resultado:**
```
SUBTOTAL:    270.000,00 MZN
IVA (16%):    43.200,00 MZN
─────────────────────────────
TOTAL:       313.200,00 MZN
```

---

## 📄 Visualizar e Baixar Cotação

### 1. Ver Cotação de um Processo

**Acesse:** `/quotations/{shipment_id}`

Exibe:
- Dados do cliente
- Informações do processo
- Breakdown detalhado dos custos
- Totais (Subtotal, IVA, Total)
- Status da cotação (Pendente, Aprovada, Rejeitada)

### 2. Baixar PDF da Cotação

**Link:** `/quotations/{shipment_id}/pdf`

ou

**Botão:** "Baixar PDF" na página de visualização

O PDF inclui:
- Cabeçalho com logo e dados da empresa
- Referência da cotação (COT-YYYY-NNNN)
- Dados completos do cliente
- Informações do processo
- Tabela detalhada de custos
- Totais formatados
- Status e validade

### 3. Aprovar/Rejeitar Cotação

**Endpoints:**
- Aprovar: `POST /quotations/{shipment_id}/approve`
- Rejeitar: `POST /quotations/{shipment_id}/reject`

---

## 🔧 APIs Disponíveis

### 1. Obter Parâmetros por Categoria
```http
GET /api/v1/pricing-parameters/{category}
```

**Categorias:**
- `container_type`
- `cargo_type`
- `regime`
- `destination`
- `additional_service`

**Resposta:**
```json
[
  {
    "id": 1,
    "code": "40DC",
    "name": "40' Dry Container",
    "description": "Container seco de 40 pés",
    "price": 75000.00,
    "formatted_price": "75.000,00 MZN"
  }
]
```

### 2. Obter Todos os Parâmetros Agrupados
```http
GET /api/v1/pricing-parameters-grouped
```

**Resposta:**
```json
{
  "container_type": [...],
  "cargo_type": [...],
  "regime": [...],
  "destination": [...],
  "additional_service": [...]
}
```

### 3. Calcular Cotação
```http
POST /api/v1/calculate-quotation
Content-Type: application/json

{
  "container_type": "40DC",
  "cargo_type": "perishable",
  "regime": "transito",
  "destination": "malawi",
  "additional_services": ["transport", "unloading"]
}
```

**Resposta:**
```json
{
  "subtotal": 270000.00,
  "tax": 43200.00,
  "total": 313200.00,
  "breakdown": [
    {
      "category": "Tipo de Container",
      "name": "40' Dry Container",
      "price": 75000.00
    },
    ...
  ]
}
```

---

## 📊 Estrutura do Banco de Dados

### Tabela: `pricing_parameters`
```
id, category, code, name, description, price, currency, active, order, timestamps
```

### Campos Adicionados à Tabela: `shipments`
```
quotation_reference (string, unique)
quotation_subtotal (decimal)
quotation_tax (decimal)
quotation_total (decimal)
quotation_breakdown (json)
quotation_status (enum: pending, approved, rejected, revised)
quotation_approved_at (datetime)
regime (string)
final_destination (string)
additional_services (json array)
```

---

## 🎨 Componentes Frontend Criados

### 1. `Settings/PricingParameters.jsx`
- Página de configuração de preços (Admin)
- Tabs por categoria
- CRUD completo de parâmetros
- Modal de criação/edição

### 2. `Components/Quotation/QuotationCalculator.jsx`
- Componente de cálculo automático
- Mostra breakdown em tempo real
- Exibição de totais formatados
- Integra com API de cálculo

### 3. PDF Template: `resources/views/pdfs/quotation.blade.php`
- Template profissional para PDF
- Layout formatado com cores
- Tabelas de custos
- Totais destacados

---

## ✅ Checklist de Funcionalidades

### Backend
- [x] Model PricingParameter com categorias
- [x] Migration de parâmetros de precificação
- [x] Migration de campos de cotação em shipments
- [x] PricingParameterController (CRUD completo)
- [x] Seeder com dados de exemplo
- [x] API de cálculo de cotação
- [x] QuotationController (show, download PDF, approve, reject)
- [x] ShipmentController atualizado para salvar cotação
- [x] Template Blade para PDF

### Frontend
- [x] Página de configuração de preços
- [x] Componente QuotationCalculator
- [x] Modal de criação/edição de parâmetros
- [ ] Integração completa no Create.jsx (precisa completar)
- [ ] Página de visualização de cotação

### Rotas
- [x] Settings routes para pricing parameters
- [x] API routes para parâmetros
- [x] Quotation routes (show, pdf, approve, reject)

---

## 📝 Próximas Melhorias Sugeridas

1. **Notificações**
   - Enviar email ao cliente quando cotação for aprovada
   - Alertar admin quando cotação precisar revisão

2. **Histórico**
   - Registrar alterações nos preços dos parâmetros
   - Log de aprovações/rejeições de cotações

3. **Relatórios**
   - Relatório de cotações por período
   - Análise de margem de lucro

4. **Descontos**
   - Sistema de descontos para clientes VIP
   - Promoções por volume

---

## 🆘 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs: `storage/logs/laravel.log`
2. Verificar se migrations rodaram: `php artisan migrate:status`
3. Verificar se seeder rodou: conferir dados em `/settings/pricing-parameters`

---

**Desenvolvido com ❤️ por Claude Code**
