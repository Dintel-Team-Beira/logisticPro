# Integração do Sistema de Cotações com Finanças e Faturas

## 📋 Situação Atual

### Problema Identificado

O sistema possui dois fluxos separados:

1. **Cotações Automáticas** (NOVO)
   - Geradas automaticamente ao criar processo
   - Baseadas em parâmetros de precificação configurados
   - Valores totais salvos em `shipments.quotation_total`
   - PDF disponível para download

2. **Solicitações de Pagamento** (ANTIGO)
   - Sistema de requisições por fase do processo
   - Operações solicitam, gestor aprova, finanças processa
   - Valores salvos em `payment_requests.amount`
   - Usado para controlar despesas e pagamentos

### Problemas no Dashboard de Finanças

#### 1. Valores Zerados
**Local**: `/finance/dashboard`

```javascript
{
  pending_approval: 0,
  approved: 0,
  paid_today: 0,
  total_pending_amount: 0,
  total_approved_amount: 0
}
```

**Causa**: Não há registros na tabela `payment_requests`

**Controller**:
```php
// app/Http/Controllers/PaymentRequestController.php:35-46
$stats = [
    'pending_approval' => PaymentRequest::pending()->count(),
    'approved' => PaymentRequest::approved()->count(),
    'in_payment' => PaymentRequest::inPayment()->count(),
    'paid_today' => PaymentRequest::paid()->whereDate('paid_at', today())->count(),
    'total_pending_amount' => PaymentRequest::pending()->sum('amount'),
    'total_approved_amount' => PaymentRequest::approved()->sum('amount'),
];
```

#### 2. Valores NaN no Histórico de Pagamentos
**Local**: `/finance/payments`

**Problema**: Função `formatCurrency` não trata valores `null` ou `undefined`

```javascript
// Finance/Payments.jsx:64
const formatCurrency = (amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: currency,
    }).format(amount);  // ❌ Se amount = null → NaN MTn
};
```

## 🔧 Soluções Propostas

### Opção 1: Integrar Cotações com Payment Requests (RECOMENDADO)

Criar automaticamente um `PaymentRequest` quando uma cotação é gerada:

```php
// app/Http/Controllers/ShipmentController.php - método store()

if ($quotationReference && isset($validated['quotation_data'])) {
    // Salvar dados da cotação no shipment
    $quotationData = $validated['quotation_data'];
    $shipmentData['quotation_reference'] = $quotationReference;
    $shipmentData['quotation_subtotal'] = $quotationData['subtotal'] ?? 0;
    $shipmentData['quotation_tax'] = $quotationData['tax'] ?? 0;
    $shipmentData['quotation_total'] = $quotationData['total'] ?? 0;
    $shipmentData['quotation_breakdown'] = $quotationData['breakdown'] ?? [];
    $shipmentData['quotation_status'] = 'pending';

    // ✨ NOVO: Criar PaymentRequest automático para finanças
    PaymentRequest::create([
        'shipment_id' => $shipment->id,
        'request_type' => 'quotation',  // Novo tipo
        'phase' => 'initial',
        'amount' => $quotationData['total'],
        'currency' => 'MZN',
        'payee' => 'Empresa Logística',
        'description' => 'Cotação automática - ' . $quotationReference,
        'status' => 'pending',  // Aguardando aprovação do gestor
        'requested_by' => auth()->id(),
        'requested_at' => now(),
    ]);
}
```

**Vantagens**:
- Dashboard de finanças mostrará dados corretos
- Mantém o fluxo de aprovação (Operações → Gestor → Finanças)
- Histórico completo de pagamentos
- Relatórios financeiros funcionam

### Opção 2: Dashboard Separado para Cotações

Criar dashboard específico para cotações:

```php
// Novo Controller: QuotationDashboardController.php
public function index()
{
    $stats = [
        'total_quotations' => Shipment::whereNotNull('quotation_reference')->count(),
        'pending_quotations' => Shipment::where('quotation_status', 'pending')->count(),
        'approved_quotations' => Shipment::where('quotation_status', 'approved')->count(),
        'total_pending_value' => Shipment::where('quotation_status', 'pending')
            ->sum('quotation_total'),
        'total_approved_value' => Shipment::where('quotation_status', 'approved')
            ->sum('quotation_total'),
    ];

    return Inertia::render('Finance/QuotationDashboard', [
        'stats' => $stats
    ]);
}
```

**Vantagens**:
- Separa cotações de payment requests
- Mais flexível para diferentes tipos de precificação
- Não interfere com sistema atual

**Desvantagens**:
- Dois dashboards diferentes
- Pode confundir usuários

### Opção 3: Substituir Completamente Payment Requests

Usar apenas cotações e remover sistema antigo:

❌ **NÃO RECOMENDADO** porque:
- Payment Requests são usados para despesas reais (alfândega, transporte, etc)
- Cotação é estimativa, Payment Request é custo real
- Perde tracking de aprovações por fase

## 🛠️ Correção do Problema NaN

### Correção Imediata

Atualizar todas as funções `formatCurrency`:

```javascript
// Finance/Payments.jsx e Finance/Dashboard.jsx
const formatCurrency = (amount, currency = 'MZN') => {
    // ✅ Validar valor antes de formatar
    const value = amount ?? 0;

    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: currency,
    }).format(value);
};
```

### Validação no Backend

Garantir que controller sempre retorna valores numéricos:

```php
$stats = [
    'total_pending_amount' => PaymentRequest::pending()->sum('amount') ?? 0,
    'total_approved_amount' => PaymentRequest::approved()->sum('amount') ?? 0,
    'average_payment' => PaymentRequest::where('status', 'paid')->avg('amount') ?? 0,
];
```

## 📊 Estrutura Recomendada

### Tabela: shipments
```sql
quotation_reference     VARCHAR  -- COT-2025-0001
quotation_subtotal      DECIMAL  -- Valor sem imposto
quotation_tax           DECIMAL  -- IVA 16%
quotation_total         DECIMAL  -- Total estimado
quotation_breakdown     JSON     -- Detalhes dos itens
quotation_status        ENUM     -- pending, approved, rejected
```

### Tabela: payment_requests
```sql
id                      BIGINT
shipment_id             BIGINT FK
request_type            VARCHAR  -- quotation, customs, transport, storage
phase                   VARCHAR  -- initial, customs, delivery
amount                  DECIMAL  -- Valor real
currency                VARCHAR
payee                   VARCHAR  -- Quem recebe
status                  ENUM     -- pending, approved, paid
requested_by            BIGINT FK
approved_by             BIGINT FK
paid_at                 TIMESTAMP
```

## 🎯 Próximos Passos

1. **Corrigir formatCurrency** (urgente) ✅
2. **Escolher opção de integração** (Opção 1 recomendada)
3. **Atualizar ShipmentController** para criar PaymentRequest
4. **Testar fluxo completo**:
   - Criar processo → Gerar cotação → PaymentRequest criado
   - Gestor aprova → Finanças processa → Pago
5. **Atualizar documentação**

## 💡 Diferença entre Cotação e Payment Request

| Aspecto | Cotação | Payment Request |
|---------|---------|-----------------|
| **Quando** | Ao criar processo | Durante execução |
| **Tipo** | Estimativa | Custo real |
| **Base** | Parâmetros fixos | Despesas reais |
| **Exemplo** | Container 40HC: 85.000 MZN | Alfândega cobrou: 92.350 MZN |
| **Status** | pending/approved/rejected | pending/approved/in_payment/paid |
| **Uso** | Orçamento inicial do cliente | Controle financeiro operacional |

## 🔍 Como Testar

### 1. Teste de Cotação
```bash
# Criar processo com cotação
POST /shipments
{
  "container_type": "40HC",
  "cargo_type": "perishable",
  "regime": "import",
  "final_destination": "malawi",
  "additional_services": ["transport", "unloading"]
}

# Verificar se quotation_reference foi gerado
# Verificar se shipment.quotation_total > 0
# Verificar se PaymentRequest foi criado (se implementar Opção 1)
```

### 2. Teste do Dashboard
```bash
# Acessar /finance/dashboard
# Verificar se stats mostram valores corretos
# Verificar se não há NaN nos valores
```

### 3. Teste de Payment Requests
```bash
# Criar payment request manual
POST /payment-requests
{
  "shipment_id": 1,
  "request_type": "customs",
  "amount": 50000,
  "description": "Taxa alfandegária"
}

# Dashboard deve atualizar:
# - pending_approval: +1
# - total_pending_amount: +50000
```

## 📝 Notas Importantes

1. **Cotação ≠ Custo Final**: Cotação é estimativa, custos reais podem variar
2. **Manter Payment Requests**: Essenciais para controle de despesas reais
3. **Duas fontes de verdade**:
   - `shipments.quotation_total` = orçamento
   - `payment_requests.amount` = custos reais
4. **Relatórios**: Devem comparar orçado vs realizado

---

**Última atualização**: 2025-10-31
**Responsável**: Claude Code
