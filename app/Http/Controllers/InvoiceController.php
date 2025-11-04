<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Notifications\InvoiceCreatedNotification;
use App\Notifications\InvoicePaidNotification;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Controller InvoiceController
 * Gerencia todo o processo de faturação (Fase 6)
 *
 * RF-020: Calcular Custos Totais
 * RF-021: Aplicar Margem de Lucro
 * RF-022: Gerar Fatura ao Cliente
 * RF-023: Enviar Fatura ao Cliente
 * RF-024: Registrar Pagamento do Cliente
 *
 * @author Arnaldo Tomo
 */
class InvoiceController extends Controller
{
    /**
     * Página principal de faturação
     */
    public function index(Request $request)
    {
        // Buscar shipments que estão prontos para faturação ou já têm fatura
        $query = Shipment::with([
            'client',
            'paymentRequests' => function($q) {
                $q->with(['requester', 'approver', 'payer'])
                  ->orderBy('phase')
                  ->orderBy('created_at');
            },
            'stages' => function($q) {
                $q->whereIn('stage', ['coleta_dispersa', 'faturacao']);
            }
        ])
        ->whereHas('stages', function($q) {
            $q->where('stage', 'coleta_dispersa')
              ->where('status', 'completed');
        });

        // Buscar faturas (documents com type='client_invoice')
        $shipmentsData = $query->latest()->paginate(15);

        // Adicionar informações de fatura a cada shipment
        $shipmentsData->getCollection()->transform(function ($shipment) {
            // Buscar fatura ao cliente se existir
            $invoice = Invoice::clientInvoices()
                ->where('shipment_id', $shipment->id)
                ->latest()
                ->first();

            $shipment->invoices = $invoice ? [$invoice] : [];

            // Verificar se fase 1 está completa
            $shipment->phase1_complete = $shipment->stages
                ->where('stage', 'coleta_dispersa')
                ->where('status', 'completed')
                ->count() > 0;

            return $shipment;
        });

        // Calcular estatísticas
        $stats = [
            'ready' => Shipment::whereHas('stages', function($q) {
                $q->where('stage', 'coleta_dispersa')
                  ->where('status', 'completed');
            })
            ->whereDoesntHave('invoices', function($q) {
                $q->where('type', 'client_invoice');
            })
            ->count(),

            'pending' => Invoice::clientInvoices()
                ->where('status', 'pending')
                ->count(),

            'paid' => Invoice::clientInvoices()
                ->where('status', 'paid')
                ->count(),

            'total_amount' => Invoice::clientInvoices()
                ->where('status', 'paid')
                ->sum('amount'),
        ];

        return Inertia::render('Invoices/Index', [
            'shipments' => $shipmentsData,
            'stats' => $stats,
        ]);
    }

    /**
     * RF-020: Calcular custos totais do shipment
     * Exibe preview antes de gerar fatura
     */
    public function calculateCosts(Shipment $shipment)
    {
        try {
            // Log para debug
            \Log::info('calculateCosts chamado', [
                'shipment_id' => $shipment->id,
                'reference' => $shipment->reference_number
            ]);

            // Validar se pode gerar fatura
            $validation = Invoice::canGenerateInvoice($shipment);

            \Log::info('Validação completa', $validation);

            if (!$validation['can_generate']) {
                return response()->json([
                    'success' => false,
                    'error' => implode(' ', $validation['errors']),
                    'validation' => $validation
                ], 422);
            }

            // Calcular custos
            $costs = Invoice::calculateShipmentCosts($shipment);

            \Log::info('Custos calculados', ['subtotal' => $costs['subtotal']]);

            // Aplicar margem padrão (15%)
            $marginPercent = 15; // TODO: Buscar de configurações
            $invoiceData = Invoice::applyProfitMargin($costs['subtotal'], $marginPercent);

            return response()->json([
                'success' => true,
                'validation' => $validation,
                'costs' => $costs,
                'invoice_preview' => $invoiceData,
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em calculateCosts', [
                'shipment_id' => $shipment->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erro ao calcular custos: ' . $e->getMessage(),
                'debug' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * RF-021 & RF-022: Aplicar margem e gerar fatura
     */
    public function generate(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'margin_percent' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
            'due_days' => 'nullable|integer|min:1|max:90',
        ]);

        DB::beginTransaction();

        try {
            // 1. Validar se pode gerar
            $validation = Invoice::canGenerateInvoice($shipment);

            if (!$validation['can_generate']) {
                return back()->withErrors([
                    'invoice' => implode(' ', $validation['errors'])
                ]);
            }

            // 2. Calcular custos
            $costs = Invoice::calculateShipmentCosts($shipment);

            // 3. Aplicar margem customizada
            $invoiceData = Invoice::applyProfitMargin(
                $costs['subtotal'],
                $validated['margin_percent']
            );

            // 4. Gerar número da fatura
            $invoiceNumber = Invoice::generateInvoiceNumber();

            // 5. Preparar dados completos
            $fullInvoiceData = array_merge($costs, $invoiceData, [
                'invoice_number' => $invoiceNumber,
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays($validated['due_days'] ?? 30)->toDateString(),
                'notes' => $validated['notes'] ?? '',
                'client' => [
                    'name' => $shipment->client->name,
                    'email' => $shipment->client->email,
                    'phone' => $shipment->client->phone,
                    'address' => $shipment->client->address,
                ],
                'shipment' => [
                    'reference' => $shipment->reference_number,
                    'bl_number' => $shipment->bl_number,
                    'origin' => $shipment->origin_port,
                    'destination' => $shipment->destination_port,
                ],
            ]);

            // 6. Gerar PDF
            $pdf = $this->generatePDF($shipment, $fullInvoiceData);

            // 7. Salvar PDF
            $filename = "invoice_{$invoiceNumber}.pdf";
            $path = "documents/invoices/{$shipment->id}/{$filename}";
            Storage::disk('public')->put($path, $pdf->output());

            // 8. Criar registro na tabela invoices
            $invoice = Invoice::create([
                'shipment_id' => $shipment->id,
                'client_id' => $shipment->client_id,
                'type' => 'client_invoice',
                'invoice_number' => $invoiceNumber,
                'issuer' => 'Logistica Pro',
                'amount' => $invoiceData['total_invoice'],
                'currency' => 'USD',
                'issue_date' => now()->toDateString(),
                'due_date' => now()->addDays($validated['due_days'] ?? 30)->toDateString(),
                'status' => 'pending',
                'notes' => $validated['notes'] ?? '',
                'file_path' => $path,
                'metadata' => [
                    'invoice_data' => $fullInvoiceData,
                    'generated_at' => now()->toIso8601String(),
                ],
            ]);

            // 9. Atualizar stage de faturação
            $shipment->stages()->updateOrCreate(
                ['stage' => 'faturacao'],
                [
                    'status' => 'in_progress',
                    'started_at' => now(),
                    'updated_by' => auth()->id(),
                ]
            );

            // 10. Registrar atividade
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'invoice_generated',
                'description' => "Fatura {$invoiceNumber} gerada no valor de " .
                    number_format($invoiceData['total_invoice'], 2) . " USD",
            ]);

            DB::commit();

            // Enviar notificações
            // Notificar admins, managers e finance
            $usersToNotify = User::whereIn('role', ['admin', 'manager', 'finance'])->get();
            Notification::send($usersToNotify, new InvoiceCreatedNotification($invoice));

            // Notificar também o criador se não estiver na lista
            if (!in_array(auth()->user()->role, ['admin', 'manager', 'finance'])) {
                auth()->user()->notify(new InvoiceCreatedNotification($invoice));
            }

            return back()->with('success', "Fatura {$invoiceNumber} gerada com sucesso!");

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'invoice' => 'Erro ao gerar fatura: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * RF-023: Enviar fatura ao cliente por email
     */
    public function send(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'email' => 'nullable|email',
            'message' => 'nullable|string|max:1000',
        ]);

        try {
            // Buscar fatura
            $invoice = Invoice::clientInvoices()
                ->where('shipment_id', $shipment->id)
                ->latest()
                ->first();

            if (!$invoice) {
                return back()->withErrors(['invoice' => 'Nenhuma fatura encontrada.']);
            }

            $email = $validated['email'] ?? $shipment->client->email;

            // TODO: Implementar envio de email
            // Mail::to($email)->send(new InvoiceMail($shipment, $invoice, $validated['message']));

            // Atualizar metadata
            $metadata = $invoice->metadata ?? [];
            $metadata['sent_at'] = now()->toIso8601String();
            $metadata['sent_to'] = $email;
            $invoice->update(['metadata' => $metadata]);

            // Registrar atividade
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'invoice_sent',
                'description' => "Fatura {$invoice->invoice_number} enviada para {$email}",
            ]);

            return back()->with('success', 'Fatura enviada com sucesso!');

        } catch (\Exception $e) {
            return back()->withErrors([
                'invoice' => 'Erro ao enviar fatura: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * RF-024: Registrar pagamento do cliente
     */
    public function registerPayment(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:bank_transfer,cash,check,other',
            'payment_proof' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Buscar fatura
            $invoice = Invoice::clientInvoices()
                ->where('shipment_id', $shipment->id)
                ->latest()
                ->first();

            if (!$invoice) {
                return back()->withErrors(['invoice' => 'Nenhuma fatura encontrada.']);
            }

            // Upload comprovativo (se fornecido)
            $proofPath = null;
            if ($request->hasFile('payment_proof')) {
                $proofPath = $request->file('payment_proof')
                    ->store("documents/payment_proofs/{$shipment->id}", 'public');
            }

            // Atualizar fatura
            $metadata = $invoice->metadata ?? [];
            $metadata['payment'] = [
                'amount_paid' => $validated['amount_paid'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'payment_proof_path' => $proofPath,
                'notes' => $validated['notes'] ?? '',
                'registered_by' => auth()->id(),
                'registered_at' => now()->toIso8601String(),
            ];

            $invoice->update([
                'status' => 'paid',
                'payment_date' => $validated['payment_date'],
                'payment_reference' => $validated['notes'] ?? null,
                'metadata' => $metadata
            ]);

            // Completar stage de faturação
            $shipment->stages()->updateOrCreate(
                ['stage' => 'faturacao'],
                [
                    'status' => 'completed',
                    'completed_at' => now(),
                    'updated_by' => auth()->id(),
                ]
            );

            // Habilitar Fase 7 (POD)
            $shipment->stages()->updateOrCreate(
                ['stage' => 'pod'],
                [
                    'status' => 'pending',
                    'updated_by' => auth()->id(),
                ]
            );

            // Registrar atividade
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'invoice_paid',
                'description' => "Pagamento de {$validated['amount_paid']} USD registrado para fatura {$invoice->invoice_number}",
            ]);

            DB::commit();

            // Enviar notificações
            // Notificar admins, managers e finance
            $usersToNotify = User::whereIn('role', ['admin', 'manager', 'finance'])->get();
            Notification::send($usersToNotify, new InvoicePaidNotification($invoice));

            // Notificar também o criador da fatura
            if ($invoice->created_by && $invoice->created_by != auth()->id()) {
                User::find($invoice->created_by)?->notify(new InvoicePaidNotification($invoice));
            }

            return back()->with('success', 'Pagamento registrado com sucesso! Fase 7 (POD) habilitada.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'payment' => 'Erro ao registrar pagamento: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Download da fatura em PDF
     */
    public function download(Shipment $shipment)
    {
        \Log::info('Download invoice requested', ['shipment_id' => $shipment->id]);

        $invoice = Invoice::clientInvoices()
            ->where('shipment_id', $shipment->id)
            ->latest()
            ->first();

        if (!$invoice) {
            \Log::error('Invoice not found for download', ['shipment_id' => $shipment->id]);
            abort(404, 'Fatura não encontrada');
        }

        \Log::info('Invoice found', [
            'invoice_id' => $invoice->id,
            'file_path' => $invoice->file_path
        ]);

        if (!Storage::disk('public')->exists($invoice->file_path)) {
            \Log::error('Invoice file not found', ['file_path' => $invoice->file_path]);
            abort(404, 'Arquivo da fatura não encontrado');
        }

        return Storage::disk('public')->download($invoice->file_path, $invoice->invoice_number . '.pdf');
    }

    /**
     * Preview da fatura em PDF
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'shipment', 'items', 'createdBy', 'quote']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    // public function markAsPaid(Invoice $invoice)
    // {
    //     if ($invoice->status === 'paid') {
    //         return back()->with('info', 'Esta fatura já está marcada como paga.');
    //     }

    //     $invoice->update([
    //         'status' => 'paid',
    //         'paid_date' => now(),
    //         'updated_by' => auth()->id(),
    //     ]);

    //     return back()->with('success', 'Fatura marcada como paga com sucesso!');
    // }

    public function preview(Shipment $shipment)
    {
        \Log::info('Preview invoice requested', ['shipment_id' => $shipment->id]);

        $invoice = Invoice::clientInvoices()
            ->where('shipment_id', $shipment->id)
            ->latest()
            ->first();

        if (!$invoice) {
            \Log::error('Invoice not found for preview', ['shipment_id' => $shipment->id]);
            abort(404, 'Fatura não encontrada');
        }

        \Log::info('Invoice found', [
            'invoice_id' => $invoice->id,
            'file_path' => $invoice->file_path
        ]);

        if (!Storage::disk('public')->exists($invoice->file_path)) {
            \Log::error('Invoice file not found', ['file_path' => $invoice->file_path]);
            abort(404, 'Arquivo da fatura não encontrada');
        }

        return response()->file(Storage::disk('public')->path($invoice->file_path));
    }

    // ========================================
    // HELPER: GERAÇÃO DE PDF
    // ========================================

    private function generatePDF(Shipment $shipment, array $invoiceData)
    {
        return Pdf::loadView('pdf.invoice', [
            'shipment' => $shipment,
            'invoice' => $invoiceData,
            'company' => $this->getCompanyData(),
        ])
        ->setPaper('a4')
        ->setOption('margin-top', '10mm')
        ->setOption('margin-bottom', '10mm')
        ->setOption('margin-left', '10mm')
        ->setOption('margin-right', '10mm');
    }

    /**
     * Dados da empresa (TODO: mover para configurações)
     */
    private function getCompanyData(): array
    {
        return [
            'name' => 'ALEK Transporte',
            'address' => 'Beira, Sofala, Moçambique',
            'phone' => '+258 84 74 000 00 ',
            'email' => 'contacto@logisticapro.co.mz',
            'nuit' => '6474687',
            'logo_path' => public_path('logoH.webp'),
        ];
    }

    // ========================================
    // QUOTATION INVOICE SYSTEM
    // ========================================

    /**
     * Lista todas as faturas geradas de cotações
     */
    public function quotationInvoices(Request $request)
    {
        $query = Invoice::with(['shipment.client', 'shipment.shipping_line', 'createdBy'])
            ->where('invoice_type', 'quotation')
            ->latest();

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                  ->orWhereHas('shipment', function($sq) use ($request) {
                      $sq->where('reference_number', 'like', "%{$request->search}%");
                  })
                  ->orWhereHas('client', function($cq) use ($request) {
                      $cq->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        $invoices = $query->paginate(15);

        // Stats
        $stats = [
            'total' => Invoice::where('invoice_type', 'quotation')->count(),
            'pending' => Invoice::where('invoice_type', 'quotation')->where('status', 'pending')->count(),
            'paid' => Invoice::where('invoice_type', 'quotation')->where('status', 'paid')->count(),
            'overdue' => Invoice::where('invoice_type', 'quotation')
                ->where('status', 'pending')
                ->where('due_date', '<', now())
                ->count(),
            'total_pending_amount' => Invoice::where('invoice_type', 'quotation')
                ->where('status', 'pending')
                ->sum('amount'),
            'total_paid_amount' => Invoice::where('invoice_type', 'quotation')
                ->where('status', 'paid')
                ->sum('amount'),
        ];

        return Inertia::render('Invoices/QuotationIndex', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Gera fatura automaticamente da cotação do shipment
     */
    public function generateFromQuotation(Shipment $shipment)
    {
        // Verificar se shipment tem cotação
        if (!$shipment->quotation_reference) {
            return redirect()->back()->with('error', 'Este processo não possui cotação automática.');
        }

        // Verificar se já existe fatura
        $existingInvoice = Invoice::where('shipment_id', $shipment->id)
            ->where('invoice_type', 'quotation')
            ->first();

        if ($existingInvoice) {
            return redirect()->back()->with('error', 'Já existe uma fatura gerada para este processo.');
        }

        try {
            DB::beginTransaction();

            // Gerar número da fatura
            $invoiceNumber = $this->generateQuotationInvoiceNumber();

            // Criar fatura
            $invoice = Invoice::create([
                'shipment_id' => $shipment->id,
                'client_id' => $shipment->client_id,
                'invoice_number' => $invoiceNumber,
                'invoice_type' => 'quotation',
                'type' => 'client_invoice',
                'issuer' => 'ALEK Transporte',
                'amount' => $shipment->quotation_total,
                'subtotal' => $shipment->quotation_subtotal,
                'tax_amount' => $shipment->quotation_tax,
                'currency' => 'MZN',
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'status' => 'pending',
                'description' => 'Fatura gerada da cotação ' . $shipment->quotation_reference,
                'terms' => 'Pagamento em 30 dias',
                'metadata' => [
                    'quotation_reference' => $shipment->quotation_reference,
                    'quotation_breakdown' => $shipment->quotation_breakdown,
                    'quotation_status' => $shipment->quotation_status,
                ],
                'created_by' => auth()->id(),
            ]);

            // Criar items da fatura baseados no breakdown
            if ($shipment->quotation_breakdown) {
                $sortOrder = 0;
                foreach ($shipment->quotation_breakdown as $item) {
                    \App\Models\InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'description' => $item['name'],
                        'quantity' => 1,
                        'unit_price' => $item['price'],
                        'amount' => $item['price'],
                        'sort_order' => $sortOrder++,
                        'metadata' => [
                            'category' => $item['category'] ?? null,
                        ],
                    ]);
                }
            }

            DB::commit();

            // Enviar notificação ao cliente (opcional)
            if ($shipment->client && $shipment->client->email) {
                try {
                    Notification::send($shipment->client, new InvoiceCreatedNotification($invoice));
                } catch (\Exception $e) {
                    // Log erro mas não falha a operação
                    \Log::error('Erro ao enviar notificação de fatura: ' . $e->getMessage());
                }
            }

            return redirect()->route('invoices.quotations.show', $invoice->id)
                ->with('success', 'Fatura gerada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erro ao gerar fatura: ' . $e->getMessage());
        }
    }

    /**
     * Exibe detalhes da fatura de cotação
     */
    public function showQuotationInvoice(Invoice $invoice)
    {
        $invoice->load(['shipment.client', 'shipment.shipping_line', 'items', 'createdBy']);

        return Inertia::render('Invoices/QuotationShow', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Marca fatura como paga
     */
    public function markAsPaid(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            $invoice->update([
                'status' => 'paid',
                'payment_date' => $validated['payment_date'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'notes' => $validated['notes'] ?? $invoice->notes,
            ]);

            // Enviar notificação
            if ($invoice->client && $invoice->client->email) {
                try {
                    Notification::send($invoice->client, new InvoicePaidNotification($invoice));
                } catch (\Exception $e) {
                    \Log::error('Erro ao enviar notificação de pagamento: ' . $e->getMessage());
                }
            }

            return redirect()->back()->with('success', 'Fatura marcada como paga!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar fatura: ' . $e->getMessage());
        }
    }

    /**
     * Envia fatura por email
     */
    public function sendByEmail(Invoice $invoice)
    {
        if (!$invoice->client || !$invoice->client->email) {
            return redirect()->back()->with('error', 'Cliente não possui email cadastrado.');
        }

        try {
            Notification::send($invoice->client, new InvoiceCreatedNotification($invoice));

            return redirect()->back()->with('success', 'Fatura enviada por email para ' . $invoice->client->email);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao enviar email: ' . $e->getMessage());
        }
    }

    /**
     * Download PDF da fatura de cotação
     */
    public function downloadQuotationPdf(Invoice $invoice)
    {
        $invoice->load(['shipment.client', 'items']);

        $company = $this->getCompanyData();

        $pdf = Pdf::loadView('pdf.quotation-invoice', [
            'invoice' => $invoice,
            'company' => $company,
        ]);

        return $pdf->download($invoice->invoice_number . '.pdf');
    }

    /**
     * Gera número sequencial de fatura de cotação
     */
    private function generateQuotationInvoiceNumber(): string
    {
        $year = date('Y');
        $lastInvoice = Invoice::where('invoice_type', 'quotation')
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? ((int) substr($lastInvoice->invoice_number, -4)) + 1 : 1;

        return sprintf('FAT-%s-%04d', $year, $sequence);
    }
}
