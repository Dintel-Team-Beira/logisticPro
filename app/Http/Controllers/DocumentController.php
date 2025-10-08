<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    /**
     * Upload de documento com auto-advance
     */
    public function store(Request $request, Shipment $shipment)
    {
        Log::info('DocumentController@store - Upload iniciado', [
            'shipment_id' => $shipment->id,
            'type' => $request->type,
            'stage' => $request->stage,
        ]);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'type' => 'required|string|max:50',
            'stage' => 'required|in:coleta_dispersa,legalizacao,alfandegas,cornelder,taxacao,financas,pod',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // 1. Upload do arquivo
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $path = $file->store("documents/shipments/{$shipment->id}/{$validated['stage']}", 'public');

            // 2. Criar documento no banco
            $document = Document::create([
                'shipment_id' => $shipment->id,
                'type' => $validated['type'],
                'name' => $fileName,
                'path' => $path,
                'size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'stage' => $validated['stage'],
                    'notes' => $validated['notes'] ?? null,
                    'mime_type' => $file->getMimeType(),
                    'uploaded_at' => now()->toDateTimeString(),
                ]
            ]);

            Log::info('Documento criado', ['document_id' => $document->id]);

            // 3. Registrar activity
            try {
                Activity::create([
                    'shipment_id' => $shipment->id,
                    'user_id' => auth()->id(),
                    'action' => 'document_uploaded',
                    'description' => "Documento anexado: {$fileName}",
                    'metadata' => [
                        'document_id' => $document->id,
                        'document_type' => $validated['type'],
                        'stage' => $validated['stage']
                    ]
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada');
            }

            // 4. Atualizar status do shipment baseado no documento
            $this->updateShipmentStatusAfterUpload($shipment, $validated['type'], $validated['stage']);

            // 5. ✅ VERIFICAR SE PODE AVANÇAR AUTOMATICAMENTE
            $autoAdvanced = $this->checkAndAutoAdvance($shipment);

            DB::commit();

            if ($autoAdvanced) {
                return back()->with('success', "✅ Documento enviado! Avançado automaticamente para Fase {$shipment->fresh()->current_phase}!");
            }

            return back()->with('success', 'Documento enviado com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao fazer upload', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (isset($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            return back()->withErrors(['error' => 'Erro: ' . $e->getMessage()]);
        }
    }

    /**
     * ✅ VERIFICAR E AVANÇAR AUTOMATICAMENTE
     */
    private function checkAndAutoAdvance(Shipment $shipment): bool
    {
        try {
            $currentPhase = $shipment->current_phase;

            Log::info('Verificando auto-advance', [
                'shipment_id' => $shipment->id,
                'current_phase' => $currentPhase
            ]);

            // Verificar se pode avançar
            if (!$this->canAutoAdvance($shipment)) {
                Log::info('Não pode avançar ainda', [
                    'reason' => 'Requisitos não completos'
                ]);
                return false;
            }

            // Avançar usando método do Model
            $nextStage = $shipment->advanceToNextStage();

            if ($nextStage) {
                // Registrar activity
                try {
                    Activity::create([
                        'user_id' => auth()->id(),
                        'shipment_id' => $shipment->id,
                        'action' => 'phase_auto_advanced',
                        'description' => "🚀 Avançado automaticamente para Fase {$shipment->fresh()->current_phase}: " .
                                       ucfirst(str_replace('_', ' ', $nextStage->stage)),
                        'metadata' => [
                            'auto_advanced' => true,
                            'from_phase' => $currentPhase,
                            'to_phase' => $shipment->fresh()->current_phase,
                        ]
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Activity não registrada');
                }

                Log::info('✅ Auto-advance realizado!', [
                    'from_phase' => $currentPhase,
                    'to_phase' => $shipment->fresh()->current_phase
                ]);

                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Erro no auto-advance', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * ✅ VERIFICAR SE PODE AVANÇAR AUTOMATICAMENTE
     */
    private function canAutoAdvance(Shipment $shipment): bool
    {
        $currentPhase = $shipment->current_phase;

        // Documentos necessários por fase
        $requiredDocsByPhase = [
            1 => ['invoice', 'receipt', 'bl'],
            2 => ['bl', 'carta_endosso'],
            3 => ['autorizacao'],
            4 => ['receipt'],
            5 => ['sad'],
            6 => ['client_invoice'],
            7 => ['pod'],
        ];

        $requiredDocs = $requiredDocsByPhase[$currentPhase] ?? [];
        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        // Verificar se todos os documentos obrigatórios foram anexados
        foreach ($requiredDocs as $docType) {
            if (!in_array($docType, $attachedDocs)) {
                Log::info('Documento faltando', [
                    'phase' => $currentPhase,
                    'missing_doc' => $docType
                ]);
                return false;
            }
        }

        // Regras adicionais por fase
        switch ($currentPhase) {
            case 1: // Coleta Dispersa
                $canAdvance = $shipment->quotation_status === 'received' &&
                             $shipment->payment_status === 'paid';

                if (!$canAdvance) {
                    Log::info('Fase 1: Status pendente', [
                        'quotation_status' => $shipment->quotation_status,
                        'payment_status' => $shipment->payment_status
                    ]);
                }
                return $canAdvance;

            case 2: // Legalização
                return true; // Apenas documentos

            case 3: // Alfândegas
                $canAdvance = $shipment->customs_payment_status === 'paid';

                if (!$canAdvance) {
                    Log::info('Fase 3: Pagamento alfandegário pendente');
                }
                return $canAdvance;

            case 4: // Cornelder
                $canAdvance = $shipment->cornelder_payment_status === 'paid';

                if (!$canAdvance) {
                    Log::info('Fase 4: Pagamento cornelder pendente');
                }
                return $canAdvance;

            case 5: // Taxação
                return true; // Apenas documentos

            case 6: // Faturação
                $canAdvance = $shipment->client_payment_status === 'paid';

                if (!$canAdvance) {
                    Log::info('Fase 6: Pagamento cliente pendente');
                }
                return $canAdvance;

            case 7: // POD
                return true; // Última fase

            default:
                return false;
        }
    }

    /**
     * Atualizar status do shipment após upload
     */
    private function updateShipmentStatusAfterUpload(Shipment $shipment, string $docType, string $stage)
    {
        try {
            // Fase 1: Coleta Dispersa
            if ($stage === 'coleta_dispersa') {
                if ($docType === 'invoice') {
                    $shipment->update(['quotation_status' => 'received']);
                    Log::info('Status atualizado: quotation_status = received');
                }

                if ($docType === 'receipt') {
                    $shipment->update(['payment_status' => 'paid']);
                    Log::info('Status atualizado: payment_status = paid');
                }
            }

            // Fase 3: Alfândegas
            if ($stage === 'alfandegas') {
                if ($docType === 'receipt') {
                    $shipment->update(['customs_payment_status' => 'paid']);
                    Log::info('Status atualizado: customs_payment_status = paid');
                }

                if ($docType === 'autorizacao') {
                    $shipment->update(['customs_status' => 'authorized']);
                    Log::info('Status atualizado: customs_status = authorized');
                }
            }

            // Fase 4: Cornelder
            if ($stage === 'cornelder') {
                if ($docType === 'receipt') {
                    $shipment->update(['cornelder_payment_status' => 'paid']);
                    Log::info('Status atualizado: cornelder_payment_status = paid');
                }
            }

            // Fase 6: Faturação
            if ($stage === 'financas') {
                if ($docType === 'receipt' || $docType === 'client_payment') {
                    $shipment->update(['client_payment_status' => 'paid']);
                    Log::info('Status atualizado: client_payment_status = paid');
                }
            }

        } catch (\Exception $e) {
            Log::warning('Erro ao atualizar status', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Download de documento
     */
    public function download(Document $document)
    {
        try {
            if (!Storage::disk('public')->exists($document->path)) {
                return back()->withErrors(['error' => 'Arquivo não encontrado']);
            }

            return Storage::disk('public')->download($document->path, $document->name);
        } catch (\Exception $e) {
            Log::error('Erro ao fazer download', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erro ao baixar arquivo']);
        }
    }

    /**
     * Deletar documento
     */
    public function destroy(Document $document)
    {
        try {
            // Deletar arquivo físico
            if (Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }

            // Registrar activity
            try {
                Activity::create([
                    'shipment_id' => $document->shipment_id,
                    'user_id' => auth()->id(),
                    'action' => 'document_deleted',
                    'description' => "Documento removido: {$document->name}",
                    'metadata' => [
                        'document_id' => $document->id,
                        'document_type' => $document->type
                    ]
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada');
            }

            // Deletar registro
            $document->delete();

            return back()->with('success', 'Documento removido!');

        } catch (\Exception $e) {
            Log::error('Erro ao deletar documento', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erro ao remover documento']);
        }
    }
}
