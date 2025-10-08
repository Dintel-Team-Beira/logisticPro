<?php

namespace App\Observers;

use App\Models\Shipment;
use Illuminate\Support\Facades\Log;

/**
 * ShipmentObserver
 *
 * Observer para automatizar ações no ciclo de vida do Shipment
 * - Iniciar automaticamente a fase 1 ao criar shipment
 * - Registrar logs de alterações
 * - Validar transições de fase
 *
 * @author Arnaldo Tomo
 */
class ShipmentObserver
{
    /**
     * Executado DEPOIS de criar um Shipment
     * Inicializa automaticamente a Fase 1: Coleta Dispersa
     */
    public function created(Shipment $shipment): void
    {
        try {
            // Verificar se já não tem nenhum stage criado
            if ($shipment->stages()->count() === 0) {
                // Iniciar automaticamente na Fase 1
                $shipment->startStage('coleta_dispersa');

                Log::info('ShipmentObserver: Fase 1 iniciada automaticamente', [
                    'shipment_id' => $shipment->id,
                    'reference' => $shipment->reference_number
                ]);

                // Registrar atividade
                try {
                    $shipment->activities()->create([
                        'user_id' => auth()->id() ?? 1,
                        'action' => 'phase_started',
                        'description' => 'Processo iniciado - Fase 1: Coleta Dispersa',
                        'metadata' => [
                            'phase' => 1,
                            'stage' => 'coleta_dispersa',
                            'auto_started' => true
                        ]
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Erro ao iniciar fase 1 automaticamente', [
                'shipment_id' => $shipment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Executado ANTES de atualizar um Shipment
     * Validar mudanças críticas
     */
    public function updating(Shipment $shipment): void
    {
        // Detectar se houve mudança de status crítico
        if ($shipment->isDirty('status')) {
            Log::info('Status do shipment está sendo alterado', [
                'shipment_id' => $shipment->id,
                'old_status' => $shipment->getOriginal('status'),
                'new_status' => $shipment->status
            ]);
        }

        // Detectar mudanças em campos de pagamento
        if ($shipment->isDirty('payment_status')) {
            Log::info('Status de pagamento alterado', [
                'shipment_id' => $shipment->id,
                'old' => $shipment->getOriginal('payment_status'),
                'new' => $shipment->payment_status
            ]);

            // Se pagamento foi confirmado, criar atividade
            if ($shipment->payment_status === 'paid') {
                try {
                    $shipment->activities()->create([
                        'user_id' => auth()->id() ?? 1,
                        'action' => 'payment_confirmed',
                        'description' => 'Pagamento confirmado para a linha de navegação',
                        'metadata' => ['payment_status' => 'paid']
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
                }
            }
        }

        // Detectar mudanças em quotation_status
        if ($shipment->isDirty('quotation_status')) {
            if ($shipment->quotation_status === 'received') {
                try {
                    $shipment->activities()->create([
                        'user_id' => auth()->id() ?? 1,
                        'action' => 'quotation_received',
                        'description' => 'Cotação recebida da linha de navegação',
                        'metadata' => ['quotation_status' => 'received']
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
                }
            }
        }
    }

    /**
     * Executado DEPOIS de atualizar
     */
    public function updated(Shipment $shipment): void
    {
        // Logs adicionais se necessário
    }

    /**
     * Executado ANTES de deletar (soft delete)
     */
    public function deleting(Shipment $shipment): void
    {
        Log::warning('Shipment sendo deletado', [
            'shipment_id' => $shipment->id,
            'reference' => $shipment->reference_number
        ]);
    }

    /**
     * Executado quando um shipment é restaurado (soft delete)
     */
    public function restored(Shipment $shipment): void
    {
        Log::info('Shipment restaurado', [
            'shipment_id' => $shipment->id,
            'reference' => $shipment->reference_number
        ]);
    }
}
