<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
            abort(404, 'Arquivo da fatura não encontrado');
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
}
