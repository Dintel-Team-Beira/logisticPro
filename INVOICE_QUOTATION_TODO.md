# Sistema de Faturas de Cotações - Implementação

## ✅ O Que Foi Implementado (Backend Completo)

### 1. Controller Methods (`InvoiceController.php`)

#### `quotationInvoices(Request $request)` - Lista de Faturas
- Lista todas as faturas geradas de cotações
- Filtros: status, search (número, processo, cliente)
- Paginação: 15 por página
- **Stats retornados**:
  ```php
  'total' => Total de faturas
  'pending' => Pendentes
  'paid' => Pagas
  'overdue' => Vencidas
  'total_pending_amount' => Valor total pendente
  'total_paid_amount' => Valor total pago
  ```

#### `generateFromQuotation(Shipment $shipment)` - Gerar Fatura
- ✅ Verifica se shipment tem cotação
- ✅ Verifica se já existe fatura (evita duplicatas)
- ✅ Gera número sequencial: **FAT-2025-0001**
- ✅ Cria Invoice com todos os dados da cotação
- ✅ Cria InvoiceItems baseados no quotation_breakdown
- ✅ Envia notificação por email ao cliente
- ✅ Usa transação DB para garantir integridade

**Dados salvos na Invoice**:
```php
'invoice_number' => 'FAT-2025-0001',
'invoice_type' => 'quotation',
'type' => 'client_invoice',
'amount' => quotation_total,
'subtotal' => quotation_subtotal,
'tax_amount' => quotation_tax,
'currency' => 'MZN',
'issue_date' => hoje,
'due_date' => hoje + 30 dias,
'status' => 'pending',
'metadata' => [
    'quotation_reference' => 'COT-2025-0001',
    'quotation_breakdown' => [...items...],
]
```

#### `showQuotationInvoice(Invoice $invoice)` - Ver Detalhes
- Carrega invoice com relacionamentos
- Retorna para página Inertia

#### `markAsPaid(Request $request, Invoice $invoice)` - Marcar Como Paga
- ✅ Valida: payment_date (obrigatório), payment_reference, notes
- ✅ Atualiza status para 'paid'
- ✅ Envia notificação de pagamento ao cliente

#### `sendByEmail(Invoice $invoice)` - Enviar por Email
- ✅ Verifica se cliente tem email
- ✅ Envia InvoiceCreatedNotification
- ✅ Tratamento de erros

#### `downloadQuotationPdf(Invoice $invoice)` - Download PDF
- ✅ Carrega invoice com items
- ✅ Gera PDF usando DomPDF
- ✅ Nome do arquivo: `FAT-2025-0001.pdf`

### 2. Rotas (`web.php`)

```php
GET  /invoices/quotations                     Lista de faturas
POST /invoices/quotations/generate/{shipment} Gerar fatura
GET  /invoices/quotations/{invoice}           Ver detalhes
POST /invoices/quotations/{invoice}/mark-paid Marcar paga
POST /invoices/quotations/{invoice}/send-email Enviar email
GET  /invoices/quotations/{invoice}/pdf       Download PDF
```

### 3. Estrutura de Dados

**Tabela: invoices** (já existe)
- invoice_number (FAT-YYYY-NNNN)
- invoice_type = 'quotation'
- shipment_id
- client_id
- amount, subtotal, tax_amount
- issue_date, due_date
- status (pending, paid, overdue, cancelled)
- payment_date, payment_reference
- metadata (JSON com breakdown)

**Tabela: invoice_items** (já existe)
- invoice_id
- description (nome do item da cotação)
- quantity = 1
- unit_price
- amount
- metadata (category da cotação)

## 📋 O Que Falta Implementar (Frontend)

### 1. **QuotationIndex.jsx** - Lista de Faturas
**Localização**: `resources/js/Pages/Invoices/QuotationIndex.jsx`

**Componentes necessários**:
- Dashboard com cards de estatísticas
- Tabela com lista de faturas
- Filtros (status, busca)
- Ações rápidas por fatura

**Layout sugerido**:
```jsx
<DashboardLayout>
    {/* Stats Cards */}
    <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total" value={stats.total} icon={FileText} />
        <StatCard title="Pendentes" value={stats.pending} icon={Clock} />
        <StatCard title="Pagas" value={stats.paid} icon={CheckCircle} />
        <StatCard title="Vencidas" value={stats.overdue} icon={AlertCircle} />
    </div>

    {/* Valor Pendente e Pago */}
    <div className="grid grid-cols-2 gap-6">
        <AmountCard
            title="Valor Pendente"
            amount={stats.total_pending_amount}
            color="yellow"
        />
        <AmountCard
            title="Valor Pago"
            amount={stats.total_paid_amount}
            color="green"
        />
    </div>

    {/* Filtros */}
    <div className="flex gap-4">
        <SearchInput />
        <StatusFilter />
    </div>

    {/* Tabela de Faturas */}
    <Table>
        <thead>
            <tr>
                <th>Nº Fatura</th>
                <th>Cliente</th>
                <th>Processo</th>
                <th>Valor</th>
                <th>Emissão</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            {invoices.map(invoice => (
                <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{invoice.shipment.client.name}</td>
                    <td>{invoice.shipment.reference_number}</td>
                    <td>{formatCurrency(invoice.amount)}</td>
                    <td>{formatDate(invoice.issue_date)}</td>
                    <td>{formatDate(invoice.due_date)}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td>
                        <Link href={`/invoices/quotations/${invoice.id}`}>
                            <Eye /> Ver
                        </Link>
                        <a href={`/invoices/quotations/${invoice.id}/pdf`}>
                            <Download /> PDF
                        </a>
                        {invoice.status === 'pending' && (
                            <button onClick={() => markAsPaid(invoice.id)}>
                                <DollarSign /> Marcar Paga
                            </button>
                        )}
                        <button onClick={() => sendEmail(invoice.id)}>
                            <Mail /> Enviar Email
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
</DashboardLayout>
```

### 2. **QuotationShow.jsx** - Detalhes da Fatura
**Localização**: `resources/js/Pages/Invoices/QuotationShow.jsx`

**Componentes necessários**:
- Header com número da fatura e status
- Informações do cliente
- Informações do processo
- Tabela de items (breakdown)
- Totais (subtotal, IVA, total)
- Ações (Download PDF, Enviar Email, Marcar Paga)
- Modal de pagamento

**Layout sugerido**:
```jsx
<DashboardLayout>
    {/* Header */}
    <div className="flex justify-between">
        <div>
            <h1>{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2">
            <Button onClick={downloadPDF}>
                <Download /> Baixar PDF
            </Button>
            <Button onClick={sendEmail}>
                <Mail /> Enviar Email
            </Button>
            {invoice.status === 'pending' && (
                <Button onClick={openPaymentModal}>
                    <DollarSign /> Marcar Paga
                </Button>
            )}
        </div>
    </div>

    {/* Grid 2 colunas */}
    <div className="grid grid-cols-3 gap-6">
        {/* Coluna Esquerda */}
        <div className="col-span-2">
            {/* Informações do Cliente */}
            <Card>
                <h3>Cliente</h3>
                <p>{invoice.shipment.client.name}</p>
                <p>{invoice.shipment.client.email}</p>
            </Card>

            {/* Items da Fatura */}
            <Card>
                <h3>Detalhes da Cotação</h3>
                <Table>
                    {invoice.items.map(item => (
                        <tr>
                            <td>{item.description}</td>
                            <td>{item.metadata.category}</td>
                            <td>{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </Table>

                {/* Totais */}
                <div className="totals">
                    <div>Subtotal: {formatCurrency(invoice.subtotal)}</div>
                    <div>IVA (16%): {formatCurrency(invoice.tax_amount)}</div>
                    <div className="text-2xl font-bold">
                        Total: {formatCurrency(invoice.amount)}
                    </div>
                </div>
            </Card>
        </div>

        {/* Coluna Direita */}
        <div>
            {/* Info do Processo */}
            <Card>
                <h3>Processo</h3>
                <Link href={`/shipments/${invoice.shipment.id}`}>
                    {invoice.shipment.reference_number}
                </Link>
            </Card>

            {/* Datas */}
            <Card>
                <h3>Datas</h3>
                <p>Emissão: {formatDate(invoice.issue_date)}</p>
                <p>Vencimento: {formatDate(invoice.due_date)}</p>
                {invoice.payment_date && (
                    <p>Pagamento: {formatDate(invoice.payment_date)}</p>
                )}
            </Card>

            {/* Informações de Pagamento */}
            {invoice.status === 'paid' && (
                <Card className="bg-green-50">
                    <h3>Pagamento Confirmado</h3>
                    <p>Data: {formatDate(invoice.payment_date)}</p>
                    {invoice.payment_reference && (
                        <p>Referência: {invoice.payment_reference}</p>
                    )}
                </Card>
            )}
        </div>
    </div>

    {/* Modal de Pagamento */}
    <Modal open={paymentModalOpen}>
        <h2>Marcar Fatura Como Paga</h2>
        <form onSubmit={handleMarkAsPaid}>
            <Input
                type="date"
                label="Data do Pagamento"
                name="payment_date"
                required
            />
            <Input
                label="Referência do Pagamento"
                name="payment_reference"
                placeholder="Ex: TRANSF-123456"
            />
            <Textarea
                label="Observações"
                name="notes"
            />
            <Button type="submit">Confirmar Pagamento</Button>
        </form>
    </Modal>
</DashboardLayout>
```

### 3. **PDF Template** - quotation-invoice.blade.php
**Localização**: `resources/views/pdf/quotation-invoice.blade.php`

**Estrutura**:
```blade
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Estilos para PDF */
    </style>
</head>
<body>
    <!-- Logo da Empresa -->
    <img src="{{ $company['logo_path'] }}" />

    <!-- Dados da Empresa -->
    <div class="company">
        <h1>{{ $company['name'] }}</h1>
        <p>{{ $company['address'] }}</p>
        <p>NUIT: {{ $company['nuit'] }}</p>
    </div>

    <!-- Dados da Fatura -->
    <div class="invoice-header">
        <h2>FATURA</h2>
        <p>Nº: {{ $invoice->invoice_number }}</p>
        <p>Data: {{ $invoice->issue_date->format('d/m/Y') }}</p>
    </div>

    <!-- Cliente -->
    <div class="client">
        <h3>Faturado a:</h3>
        <p>{{ $invoice->shipment->client->name }}</p>
        <p>{{ $invoice->shipment->client->address }}</p>
    </div>

    <!-- Items -->
    <table>
        <thead>
            <tr>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
            <tr>
                <td>{{ $item->description }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ number_format($item->unit_price, 2) }} MZN</td>
                <td>{{ number_format($item->amount, 2) }} MZN</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totais -->
    <div class="totals">
        <div>Subtotal: {{ number_format($invoice->subtotal, 2) }} MZN</div>
        <div>IVA (16%): {{ number_format($invoice->tax_amount, 2) }} MZN</div>
        <div class="total">TOTAL: {{ number_format($invoice->amount, 2) }} MZN</div>
    </div>

    <!-- Termos -->
    <div class="terms">
        <p>{{ $invoice->terms }}</p>
    </div>
</body>
</html>
```

### 4. **Botão "Gerar Fatura" na Tela do Processo**
**Localização**: `resources/js/Pages/Shipments/Show.jsx`

**Adicionar no card de cotação**:
```jsx
{/* Dentro do card de Cotação Automática */}
{shipment.quotation_reference && (auth.user.role === 'admin' || auth.user.role === 'finance') && (
    <div className="flex gap-2 mt-4">
        {/* Botão existente de baixar PDF da cotação */}
        <a href={`/quotations/${shipment.id}/pdf`}>Baixar Cotação PDF</a>

        {/* NOVO: Botão para gerar fatura */}
        {!shipment.has_quotation_invoice && (
            <form method="POST" action={`/invoices/quotations/generate/${shipment.id}`}>
                <button className="btn btn-success">
                    <FileText className="w-4 h-4" />
                    Gerar Fatura
                </button>
            </form>
        )}

        {/* Link para ver fatura se já existe */}
        {shipment.has_quotation_invoice && (
            <Link href={`/invoices/quotations/${shipment.quotation_invoice_id}`}>
                <CheckCircle className="w-4 h-4" />
                Ver Fatura
            </Link>
        )}
    </div>
)}
```

**Adicionar no Shipment Controller** para passar flag:
```php
public function show(Shipment $shipment) {
    // Carregar cotação invoice se existe
    $quotationInvoice = Invoice::where('shipment_id', $shipment->id)
        ->where('invoice_type', 'quotation')
        ->first();

    return Inertia::render('Shipments/Show', [
        'shipment' => $shipment,
        'has_quotation_invoice' => $quotationInvoice !== null,
        'quotation_invoice_id' => $quotationInvoice?->id,
        // ... outros dados
    ]);
}
```

## 🎨 Design System Sugerido

### Cores
- **Pendente**: Amarelo (#FCD34D)
- **Paga**: Verde (#10B981)
- **Vencida**: Vermelho (#EF4444)
- **Cancelada**: Cinza (#6B7280)

### Icons (Lucide React)
- FileText (fatura)
- DollarSign (pagamento)
- Clock (pendente)
- CheckCircle (paga)
- AlertCircle (vencida)
- Mail (email)
- Download (PDF)
- Eye (ver)

## 🔗 Fluxo Completo

1. **Usuário cria processo** com cotação automática → Salva em `shipments.quotation_*`
2. **Admin/Finance gera fatura** → Clica em "Gerar Fatura" na tela do processo
3. **Sistema cria fatura** → Gera `FAT-2025-0001` e salva em `invoices` table
4. **Email automático** → Cliente recebe notificação com link
5. **Cliente paga** → Admin marca como paga na tela de faturas
6. **Notificação de pagamento** → Cliente recebe confirmação

## 📊 API Endpoints Disponíveis

```
GET  /invoices/quotations                     → QuotationIndex.jsx
GET  /invoices/quotations/{invoice}           → QuotationShow.jsx
POST /invoices/quotations/generate/{shipment} → Gera fatura
POST /invoices/quotations/{invoice}/mark-paid → Marca paga
POST /invoices/quotations/{invoice}/send-email→ Envia email
GET  /invoices/quotations/{invoice}/pdf       → Download PDF
```

## ✅ Checklist de Implementação Frontend

- [ ] Criar `QuotationIndex.jsx` com stats e tabela
- [ ] Criar `QuotationShow.jsx` com detalhes e ações
- [ ] Criar `quotation-invoice.blade.php` para PDF
- [ ] Adicionar botão "Gerar Fatura" em Shipments/Show.jsx
- [ ] Adicionar flag `has_quotation_invoice` no ShipmentController
- [ ] Testar fluxo completo
- [ ] Testar envio de email
- [ ] Testar download de PDF
- [ ] Compilar assets com `npm run build`

---

**Documento criado**: 2025-10-31
**Status Backend**: ✅ Completo (270 linhas adicionadas)
**Status Frontend**: ⏳ Aguardando implementação
