<?php

namespace App\Services;

use App\Models\Shipment;
use App\Enums\ShipmentStatus;
use App\Enums\DocumentType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * ShipmentWorkflowService
 *
 * Gerencia o workflow completo de um Shipment através das 7 fases
 * Implementa RF-001 até RF-025 do SRS
 */
class ShipmentWorkflowService
{
    /**
     * Obter checklist de documentos necessários para a fase atual
     *
     * @param Shipment $shipment
     * @return array
     */
    public function getDocumentChecklist(Shipment $shipment): array
    {
        $currentPhase = ShipmentStatus::getPhase($shipment->status);
        $checklist = [];

        // Documentos obrigatórios por fase
        $requiredDocsByPhase = $this->getRequiredDocumentsByPhase($currentPhase);

        // Documentos já anexados
        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        foreach ($requiredDocsByPhase as $docType) {
            $isAttached = in_array($docType, $attachedDocs);

            $checklist[] = [
                'type' => $docType,
                'label' => DocumentType::labels()[$docType] ?? $docType,
                'description' => DocumentType::getDescription($docType),
                'required' => DocumentType::isRequired($docType, $currentPhase),
                'attached' => $isAttached,
                'icon' => DocumentType::icons()[$docType] ?? 'File',
            ];
        }

        return $checklist;
    }

    /**
     * Obter progresso do shipment (porcentagem)
     *
     * @param Shipment $shipment
     * @return float
     */
    public function getProgress(Shipment $shipment): float
    {
        $currentPhase = ShipmentStatus::getPhase($shipment->status);
        $totalPhases = 7;

        // Calcular progresso baseado na fase
        $phaseProgress = ($currentPhase / $totalPhases) * 100;

        // Ajustar progresso baseado no status dentro da fase
        $statusProgress = $this->getStatusProgressWithinPhase($shipment->status);

        return round($phaseProgress + ($statusProgress / $totalPhases), 2);
    }

    /**
     * Transicionar shipment para novo status
     *
     * @param Shipment $shipment
     * @param string $newStatus
     * @param int $userId
     * @param string|null $notes
     * @return bool
     * @throws \Exception
     */
    public function transition(
        Shipment $shipment,
        string $newStatus,
        int $userId,
        string $notes = null
    ): bool {
        $currentStatus = $shipment->status;

        // Validar se a transição é permitida
        if (!$this->canTransition($currentStatus, $newStatus)) {
            throw new \Exception("Transição de '{$currentStatus}' para '{$newStatus}' não é permitida.");
        }

        DB::beginTransaction();

        try {
            // Atualizar status
            $shipment->update(['status' => $newStatus]);

            // Registrar atividade
            try {
                $shipment->activities()->create([
                    'user_id' => $userId,
                    'action' => 'status_changed',
                    'description' => $notes ?? "Status alterado para: " . ShipmentStatus::labels()[$newStatus],
                    'metadata' => json_encode([
                        'old_status' => $currentStatus,
                        'new_status' => $newStatus,
                        'old_status_label' => ShipmentStatus::labels()[$currentStatus] ?? $currentStatus,
                        'new_status_label' => ShipmentStatus::labels()[$newStatus] ?? $newStatus,
                    ])
                ]);
            } catch (\Exception $e) {
                // Se tabela activities não existir, apenas loga
                Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
            }

            DB::commit();

            Log::info('Status alterado com sucesso', [
                'shipment_id' => $shipment->id,
                'from' => $currentStatus,
                'to' => $newStatus
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao transicionar status', [
                'shipment_id' => $shipment->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Obter próximo status permitido
     *
     * @param Shipment $shipment
     * @return string|null
     */
    public function getNextStatus(Shipment $shipment): ?string
    {
        return ShipmentStatus::getNextStatus($shipment->status);
    }

    /**
     * Verificar se tem todos os documentos obrigatórios para avançar
     *
     * @param Shipment $shipment
     * @param string $targetStatus
     * @return bool
     */
    public function hasRequiredDocuments(Shipment $shipment, string $targetStatus): bool
    {
        $targetPhase = ShipmentStatus::getPhase($targetStatus);
        $requiredDocs = $this->getRequiredDocumentsByPhase($targetPhase);
        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        foreach ($requiredDocs as $docType) {
            if (DocumentType::isRequired($docType, $targetPhase)) {
                if (!in_array($docType, $attachedDocs)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Verificar se pode fazer transição de status
     *
     * @param string $currentStatus
     * @param string $newStatus
     * @return bool
     */
    protected function canTransition(string $currentStatus, string $newStatus): bool
    {
        // Validar se o novo status é válido
        try {
            ShipmentStatus::from($newStatus);
        } catch (\ValueError $e) {
            return false;
        }

        // Validar se é o próximo status permitido OU se está avançando de fase
        $nextStatus = ShipmentStatus::getNextStatus($currentStatus);

        if ($nextStatus === $newStatus) {
            return true;
        }

        // Permitir pular para o primeiro status da próxima fase
        $currentPhase = ShipmentStatus::getPhase($currentStatus);
        $newPhase = ShipmentStatus::getPhase($newStatus);

        if ($newPhase === $currentPhase + 1) {
            $phaseStatuses = ShipmentStatus::getPhaseStatuses($newPhase);
            if (!empty($phaseStatuses) && $phaseStatuses[0]->value === $newStatus) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obter documentos obrigatórios por fase
     *
     * @param int $phase
     * @return array
     */
    protected function getRequiredDocumentsByPhase(int $phase): array
    {
        $documents = [
            1 => [ // Fase 1: Coleta de Dispersa
                'bl',              // BL Original (compatível com banco antigo)
                'carta_endosso',   // Carta de Endosso
                'invoice',         // Fatura da Linha
                'pop',             // Comprovativo de Pagamento
                'receipt',         // Recibo da Linha
            ],
            2 => [ // Fase 2: Legalização
                'bl',              // BL Carimbado
                'delivery_order',  // Delivery Order
            ],
            3 => [ // Fase 3: Alfândegas
                'packing_list',    // Packing List
                'invoice',         // Commercial Invoice
                'aviso',           // Aviso de Taxação
                'pop',             // POP Alfândegas
                'autorizacao',     // Autorização de Saída
            ],
            4 => [ // Fase 4: Cornelder
                'draft',           // Draft Cornelder
                'storage',         // Storage
                'pop',             // POP Cornelder
                'receipt',         // Recibo Cornelder
                'termo',           // Termo da Linha
            ],
            5 => [ // Fase 5: Taxação
                'sad',             // SAD (Documento de Trânsito)
                'delivery_order',  // IDO
            ],
            6 => [ // Fase 6: Faturação
                'invoice',         // Factura ao Cliente
            ],
            7 => [ // Fase 7: POD
                'receipt',         // POD
            ],
        ];

        return $documents[$phase] ?? [];
    }

    /**
     * Calcular progresso do status dentro da fase
     *
     * @param string $status
     * @return float
     */
    protected function getStatusProgressWithinPhase(string $status): float
    {
        $phase = ShipmentStatus::getPhase($status);
        $phaseStatuses = ShipmentStatus::getPhaseStatuses($phase);

        if (empty($phaseStatuses)) {
            return 0;
        }

        $totalStatusesInPhase = count($phaseStatuses);
        $currentStatusIndex = 0;

        foreach ($phaseStatuses as $index => $phaseStatus) {
            if ($phaseStatus->value === $status) {
                $currentStatusIndex = $index + 1;
                break;
            }
        }

        return ($currentStatusIndex / $totalStatusesInPhase) * 100;
    }

    /**
     * Verificar se o processo está atrasado
     *
     * @param Shipment $shipment
     * @return bool
     */
    public function isDelayed(Shipment $shipment): bool
    {
        // Se tiver storage_deadline definido
        if ($shipment->storage_deadline) {
            return now()->greaterThan($shipment->storage_deadline);
        }

        // Verificar se está há mais de 30 dias na mesma fase
        $lastActivity = $shipment->activities()
            ->where('action', 'status_changed')
            ->latest()
            ->first();

        if ($lastActivity) {
            return now()->diffInDays($lastActivity->created_at) > 30;
        }

        return false;
    }

    /**
     * Obter resumo do workflow
     *
     * @param Shipment $shipment
     * @return array
     */
    public function getWorkflowSummary(Shipment $shipment): array
    {
        return [
            'current_phase' => ShipmentStatus::getPhase($shipment->status),
            'current_phase_name' => ShipmentStatus::getPhaseName(ShipmentStatus::getPhase($shipment->status)),
            'current_status' => $shipment->status,
            'current_status_label' => ShipmentStatus::labels()[$shipment->status] ?? 'Desconhecido',
            'progress' => $this->getProgress($shipment),
            'next_status' => $this->getNextStatus($shipment),
            'next_status_label' => ShipmentStatus::labels()[$this->getNextStatus($shipment)] ?? null,
            'can_advance' => $this->canAdvance($shipment),
            'is_delayed' => $this->isDelayed($shipment),
            'missing_documents' => $this->getMissingDocuments($shipment),
        ];
    }

    /**
     * Verificar se pode avançar para próxima etapa
     *
     * @param Shipment $shipment
     * @return bool
     */
    public function canAdvance(Shipment $shipment): bool
    {
        $nextStatus = $this->getNextStatus($shipment);

        if (!$nextStatus) {
            return false;
        }

        return $this->hasRequiredDocuments($shipment, $nextStatus);
    }

    /**
     * Obter documentos faltantes
     *
     * @param Shipment $shipment
     * @return array
     */
    public function getMissingDocuments(Shipment $shipment): array
    {
        $currentPhase = ShipmentStatus::getPhase($shipment->status);
        $requiredDocs = $this->getRequiredDocumentsByPhase($currentPhase);
        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        $missing = [];

        foreach ($requiredDocs as $docType) {
            if (!in_array($docType, $attachedDocs)) {
                $missing[] = [
                    'type' => $docType,
                    'label' => DocumentType::labels()[$docType] ?? $docType,
                ];
            }
        }

        return $missing;
    }
}
