<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentStage;
use App\Models\Activity;
use Illuminate\Http\Request;

class StageController extends Controller
{
    public function updateStatus(Request $request, Shipment $shipment, ShipmentStage $stage)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,blocked',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $oldStatus = $stage->status;

        $stage->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'metadata' => $request->metadata,
            'updated_by' => auth()->id(),
            'started_at' => $request->status === 'in_progress' && !$stage->started_at ? now() : $stage->started_at,
            'completed_at' => $request->status === 'completed' ? now() : null
        ]);

        // Se completou o stage, ativar o próximo
        if ($request->status === 'completed') {
            $this->activateNextStage($shipment, $stage);
        }

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'stage_updated',
            'description' => "Stage '{$stage->stage}' mudou de '{$oldStatus}' para '{$request->status}'",
            'metadata' => [
                'stage' => $stage->stage,
                'old_status' => $oldStatus,
                'new_status' => $request->status
            ]
        ]);

        return back()->with('success', 'Status atualizado com sucesso!');
    }

    private function activateNextStage(Shipment $shipment, ShipmentStage $currentStage)
    {
        $stages = ['coleta_dispersa', 'legalizacao', 'alfandegas', 'cornelder', 'taxacao'];
        $currentIndex = array_search($currentStage->stage, $stages);

        if ($currentIndex !== false && isset($stages[$currentIndex + 1])) {
            $nextStage = $shipment->stages()
                ->where('stage', $stages[$currentIndex + 1])
                ->first();

            if ($nextStage) {
                $nextStage->update([
                    'status' => 'in_progress',
                    'started_at' => now()
                ]);
            }
        } else {
            // Último stage completado
            $shipment->update(['status' => 'completed']);
        }
    }
}
