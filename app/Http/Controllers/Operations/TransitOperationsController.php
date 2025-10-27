<?php

namespace App\Http\Controllers\Operations;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransitOperationsController extends Controller
{
    /**
     * Fase 1: Recepção
     */
    public function recepcao()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'recepcao')
                    ->where('status', 'in_progress');
            })
            ->with(['client', 'documents'])
            ->get()
            ->map(function ($shipment) {
                $shipment->real_progress = $shipment->getRealProgressByType();
                return $shipment;
            });

        return Inertia::render('Operations/Transit/Recepcao', [
            'shipments' => $shipments,
        ]);
    }

    public function updateRecepcaoStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,received,verified',
        ]);

        $shipment->update([
            'tra_reception_status' => $request->status,
            'tra_reception_date' => $request->status === 'received' ? now() : $shipment->tra_reception_date,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'status_updated',
            'description' => "Status de recepção atualizado para: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    /**
     * Fase 2: Documentação
     */
    public function documentacao()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'documentacao_transito')
                    ->where('status', 'in_progress');
            })
            ->with(['client', 'documents'])
            ->get();

        return Inertia::render('Operations/Transit/Documentacao', [
            'shipments' => $shipments,
        ]);
    }

    public function updateDocumentacaoStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $shipment->update([
            'tra_documentation_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'status_updated',
            'description' => "Status de documentação atualizado para: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    /**
     * Fase 3: Desembaraço Aduaneiro
     */
    public function desembaraco()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'desembaraco_aduaneiro')
                    ->where('status', 'in_progress');
            })
            ->with(['client', 'documents'])
            ->get();

        return Inertia::render('Operations/Transit/Desembaraco', [
            'shipments' => $shipments,
        ]);
    }

    public function updateDesembaracoStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,cleared',
        ]);

        $shipment->update([
            'tra_customs_clearance_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'customs_status_updated',
            'description' => "Status de desembaraço atualizado para: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    public function updateDeclaration(Request $request, Shipment $shipment)
    {
        $request->validate([
            'declaration_number' => 'required|string|max:255',
        ]);

        $shipment->update([
            'tra_customs_declaration_number' => $request->declaration_number,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'declaration_registered',
            'description' => "Declaração de trânsito registrada: {$request->declaration_number}",
        ]);

        return back()->with('success', 'Número de declaração registrado!');
    }

    /**
     * Fase 4: Armazenamento
     */
    public function armazenamento()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'armazenamento')
                    ->where('status', 'in_progress');
            })
            ->with(['client'])
            ->get();

        return Inertia::render('Operations/Transit/Armazenamento', [
            'shipments' => $shipments,
        ]);
    }

    public function updateArmazenamentoStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:stored,ready_for_departure',
        ]);

        $shipment->update([
            'tra_storage_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'storage_status_updated',
            'description' => "Status de armazenamento atualizado para: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    public function updateWarehouseLocation(Request $request, Shipment $shipment)
    {
        $request->validate([
            'warehouse_location' => 'required|string|max:255',
        ]);

        $shipment->update([
            'tra_warehouse_location' => $request->warehouse_location,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'warehouse_location_set',
            'description' => "Localização no armazém: {$request->warehouse_location}",
        ]);

        return back()->with('success', 'Localização registrada!');
    }

    /**
     * Fase 5: Preparação de Partida
     */
    public function preparacaoPartida()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'preparacao_partida')
                    ->where('status', 'in_progress');
            })
            ->with(['client'])
            ->get();

        return Inertia::render('Operations/Transit/PreparacaoPartida', [
            'shipments' => $shipments,
        ]);
    }

    public function updatePreparacaoStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,ready',
        ]);

        $shipment->update([
            'tra_departure_prep_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'departure_prep_updated',
            'description' => "Preparação de partida: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    public function updateDepartureDate(Request $request, Shipment $shipment)
    {
        $request->validate([
            'departure_date' => 'required|date',
        ]);

        $shipment->update([
            'tra_departure_date' => $request->departure_date,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'departure_date_set',
            'description' => "Data de partida definida: {$request->departure_date}",
        ]);

        return back()->with('success', 'Data de partida registrada!');
    }

    /**
     * Fase 6: Transporte de Saída
     */
    public function transporteSaida()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'transporte_saida')
                    ->where('status', 'in_progress');
            })
            ->with(['client'])
            ->get();

        return Inertia::render('Operations/Transit/TransporteSaida', [
            'shipments' => $shipments,
        ]);
    }

    public function updateTransporteStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,in_transit,delivered',
        ]);

        $shipment->update([
            'tra_outbound_transport_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'transport_status_updated',
            'description' => "Status de transporte: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    public function updateActualDeparture(Request $request, Shipment $shipment)
    {
        $request->validate([
            'actual_departure_date' => 'required|date',
        ]);

        $shipment->update([
            'tra_actual_departure_date' => $request->actual_departure_date,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'actual_departure_set',
            'description' => "Data real de partida: {$request->actual_departure_date}",
        ]);

        return back()->with('success', 'Data de partida real registrada!');
    }

    /**
     * Fase 7: Entrega Final
     */
    public function entregaFinal()
    {
        $shipments = Shipment::where('type', 'transit')
            ->whereHas('stages', function ($query) {
                $query->where('stage', 'entrega_final')
                    ->where('status', 'in_progress');
            })
            ->with(['client'])
            ->get();

        return Inertia::render('Operations/Transit/EntregaFinal', [
            'shipments' => $shipments,
        ]);
    }

    public function updateEntregaStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,delivered,confirmed',
        ]);

        $shipment->update([
            'tra_delivery_status' => $request->status,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'delivery_status_updated',
            'description' => "Status de entrega: {$request->status}",
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    public function updateDeliveryDate(Request $request, Shipment $shipment)
    {
        $request->validate([
            'delivery_date' => 'required|date',
        ]);

        $shipment->update([
            'tra_delivery_date' => $request->delivery_date,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'delivery_date_set',
            'description' => "Data de entrega: {$request->delivery_date}",
        ]);

        return back()->with('success', 'Data de entrega registrada!');
    }

    public function updateFinalDestination(Request $request, Shipment $shipment)
    {
        $request->validate([
            'final_destination' => 'required|string|max:500',
        ]);

        $shipment->update([
            'tra_final_destination' => $request->final_destination,
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'final_destination_set',
            'description' => "Destino final confirmado: {$request->final_destination}",
        ]);

        return back()->with('success', 'Destino final registrado!');
    }

    /**
     * Avançar para próxima fase
     */
    public function advancePhase(Shipment $shipment)
    {
        $currentStage = $shipment->currentStage();

        if (!$currentStage) {
            return back()->with('error', 'Fase atual não encontrada');
        }

        $phaseMap = [
            'recepcao' => 1,
            'documentacao_transito' => 2,
            'desembaraco_aduaneiro' => 3,
            'armazenamento' => 4,
            'preparacao_partida' => 5,
            'transporte_saida' => 6,
            'entrega_final' => 7,
        ];

        $currentPhase = $phaseMap[$currentStage->stage] ?? null;

        if (!$currentPhase) {
            return back()->with('error', 'Fase inválida');
        }

        // Completar fase atual
        $shipment->completePhase($currentPhase);

        // Iniciar próxima fase (se não for a última)
        if ($currentPhase < 7) {
            $shipment->startPhase($currentPhase + 1);
        }

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'phase_advanced',
            'description' => "Avançou para a próxima fase",
        ]);

        return back()->with('success', 'Processo avançou para a próxima fase!');
    }

    /**
     * Finalizar processo de trânsito
     */
    public function complete(Shipment $shipment)
    {
        // Completar última fase
        $shipment->completePhase(7);

        // Atualizar status geral do shipment
        $shipment->update([
            'status' => 'completed',
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'process_completed',
            'description' => '🎉 Processo de trânsito finalizado com sucesso!',
        ]);

        return redirect()->route('shipments.show', $shipment->id)
            ->with('success', 'Processo de trânsito finalizado com sucesso!');
    }
}
