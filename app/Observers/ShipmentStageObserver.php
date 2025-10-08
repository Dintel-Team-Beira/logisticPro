<?php

// / ============================================================================
// EXEMPLO 6: Observer para Log Automático
// ============================================================================

// app/Observers/ShipmentStageObserver.php

namespace App\Observers;

use App\Models\ShipmentStage;
use App\Models\Activity;

class ShipmentStageObserver
{
    public function created(ShipmentStage $stage)
    {
        // Registrar activity
        Activity::create([
            'shipment_id' => $stage->shipment_id,
            'user_id' => auth()->id() ?? 1,
            'action' => 'stage_started',
            'description' => "Fase '{$stage->stage}' iniciada",
            'metadata' => [
                'stage' => $stage->stage,
                'status' => $stage->status,
            ],
        ]);
    }

    public function updated(ShipmentStage $stage)
    {
        if ($stage->wasChanged('status')) {
            $action = match($stage->status) {
                'completed' => 'stage_completed',
                'blocked' => 'stage_blocked',
                default => 'stage_updated',
            };

            Activity::create([
                'shipment_id' => $stage->shipment_id,
                'user_id' => auth()->id() ?? 1,
                'action' => $action,
                'description' => "Fase '{$stage->stage}' {$stage->status}",
                'metadata' => [
                    'stage' => $stage->stage,
                    'old_status' => $stage->getOriginal('status'),
                    'new_status' => $stage->status,
                ],
            ]);
        }
    }
}
