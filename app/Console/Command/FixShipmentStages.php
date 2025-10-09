<?php

namespace App\Console\Commands;

use App\Models\Shipment;
use App\Models\ShipmentStage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Comando para diagnosticar e corrigir problemas com shipment_stages
 *
 * Uso:
 * php artisan FixShipmentStages:fix-stages --diagnose (apenas diagnosticar)
 * php artisan shipments:fix-stages --fix (diagnosticar e corrigir)
 *
 * @author Arnaldo Tomo
 */
class FixShipmentStages extends Command
{
    protected $signature = 'shipments:fix-stages
                            {--diagnose : Apenas diagnosticar problemas}
                            {--fix : Diagnosticar e corrigir}';

    protected $description = 'Diagnosticar e corrigir problemas com shipment_stages';

    public function handle()
    {
        $this->info('🔍 Iniciando diagnóstico de shipment_stages...');
        $this->newLine();

        $problems = [];

        // 1. Verificar shipments com múltiplos stages in_progress
        $this->info('1️⃣  Verificando shipments com múltiplos stages em progresso...');
        $multipleInProgress = $this->checkMultipleInProgress();

        if ($multipleInProgress->isNotEmpty()) {
            $problems[] = 'multiple_in_progress';
            $this->warn("   ⚠️  Encontrados {$multipleInProgress->count()} shipments com múltiplos stages em progresso");

            foreach ($multipleInProgress as $issue) {
                $this->line("   - Shipment #{$issue->shipment_id}: {$issue->stages_count} stages in_progress");
            }
        } else {
            $this->info('   ✅ Nenhum problema encontrado');
        }
        $this->newLine();

        // 2. Verificar shipments sem stages
        $this->info('2️⃣  Verificando shipments sem stages...');
        $withoutStages = $this->checkShipmentsWithoutStages();

        if ($withoutStages->isNotEmpty()) {
            $problems[] = 'without_stages';
            $this->warn("   ⚠️  Encontrados {$withoutStages->count()} shipments sem stages");

            foreach ($withoutStages as $shipment) {
                $this->line("   - Shipment #{$shipment->id}: {$shipment->reference_number}");
            }
        } else {
            $this->info('   ✅ Nenhum problema encontrado');
        }
        $this->newLine();

        // 3. Verificar stages órfãos (completados mas sem próximo)
        $this->info('3️⃣  Verificando stages completados sem próximo stage...');
        $orphanStages = $this->checkOrphanStages();

        if ($orphanStages->isNotEmpty()) {
            $problems[] = 'orphan_stages';
            $this->warn("   ⚠️  Encontrados {$orphanStages->count()} stages órfãos");

            foreach ($orphanStages as $stage) {
                $this->line("   - Shipment #{$stage->shipment_id}: stage '{$stage->stage}' completado sem próximo");
            }
        } else {
            $this->info('   ✅ Nenhum problema encontrado');
        }
        $this->newLine();

        // Resumo
        $this->info('📊 RESUMO DO DIAGNÓSTICO');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (empty($problems)) {
            $this->info('✅ Nenhum problema encontrado!');
            return 0;
        }

        $this->warn('Total de problemas: ' . count($problems));

        // Aplicar correções se solicitado
        if ($this->option('fix')) {
            $this->newLine();

            if (!$this->confirm('Deseja aplicar as correções?')) {
                $this->info('Correções canceladas.');
                return 0;
            }

            $this->newLine();
            $this->info('🔧 Aplicando correções...');
            $this->newLine();

            DB::beginTransaction();

            try {
                // Corrigir múltiplos in_progress
                if (in_array('multiple_in_progress', $problems)) {
                    $this->fixMultipleInProgress();
                }

                // Corrigir shipments sem stages
                if (in_array('without_stages', $problems)) {
                    $this->fixShipmentsWithoutStages();
                }

                // Corrigir stages órfãos
                if (in_array('orphan_stages', $problems)) {
                    $this->fixOrphanStages();
                }

                DB::commit();

                $this->newLine();
                $this->info('✅ Correções aplicadas com sucesso!');
                return 0;

            } catch (\Exception $e) {
                DB::rollBack();

                $this->error('❌ Erro ao aplicar correções: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->newLine();
            $this->info('💡 Execute com --fix para corrigir os problemas encontrados');
            $this->info('   Exemplo: php artisan shipments:fix-stages --fix');
        }

        return 0;
    }

    private function checkMultipleInProgress()
    {
        return DB::table('shipment_stages')
            ->select('shipment_id', DB::raw('COUNT(*) as stages_count'))
            ->where('status', 'in_progress')
            ->groupBy('shipment_id')
            ->having('stages_count', '>', 1)
            ->get();
    }

    private function checkShipmentsWithoutStages()
    {
        return Shipment::leftJoin('shipment_stages', 'shipments.id', '=', 'shipment_stages.shipment_id')
            ->whereNull('shipment_stages.id')
            ->select('shipments.id', 'shipments.reference_number')
            ->get();
    }

    private function checkOrphanStages()
    {
        // Stages completados que são o último stage do shipment
        // mas não são o último stage possível (pod)
        return ShipmentStage::where('status', 'completed')
            ->whereIn('stage', ['coleta_dispersa', 'legalizacao', 'alfandegas', 'cornelder', 'taxacao', 'faturacao'])
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('shipment_stages as st2')
                    ->whereColumn('st2.shipment_id', 'shipment_stages.shipment_id')
                    ->whereColumn('st2.id', '>', 'shipment_stages.id');
            })
            ->get();
    }

    private function fixMultipleInProgress()
    {
        $this->info('Corrigindo múltiplos stages in_progress...');

        $affected = DB::update("
            UPDATE shipment_stages st1
            SET status = 'completed',
                completed_at = NOW()
            WHERE status = 'in_progress'
            AND EXISTS (
                SELECT 1
                FROM shipment_stages st2
                WHERE st2.shipment_id = st1.shipment_id
                AND st2.status = 'in_progress'
                AND st2.id > st1.id
            )
        ");

        $this->info("   ✅ {$affected} stages atualizados");
    }

    private function fixShipmentsWithoutStages()
    {
        $this->info('Criando stages iniciais para shipments...');

        $shipments = $this->checkShipmentsWithoutStages();

        foreach ($shipments as $shipment) {
            ShipmentStage::create([
                'shipment_id' => $shipment->id,
                'stage' => 'coleta_dispersa',
                'status' => 'in_progress',
                'started_at' => now(),
                'updated_by' => auth()->id() ?? 1,
            ]);
        }

        $this->info("   ✅ {$shipments->count()} stages criados");
    }

    private function fixOrphanStages()
    {
        $this->info('Criando próximos stages para stages órfãos...');

        $nextStages = [
            'coleta_dispersa' => 'legalizacao',
            'legalizacao' => 'alfandegas',
            'alfandegas' => 'cornelder',
            'cornelder' => 'taxacao',
            'taxacao' => 'faturacao',
            'faturacao' => 'pod',
        ];

        $orphans = $this->checkOrphanStages();

        foreach ($orphans as $stage) {
            $nextStage = $nextStages[$stage->stage] ?? null;

            if ($nextStage) {
                ShipmentStage::create([
                    'shipment_id' => $stage->shipment_id,
                    'stage' => $nextStage,
                    'status' => 'in_progress',
                    'started_at' => now(),
                    'updated_by' => auth()->id() ?? 1,
                ]);
            }
        }

        $this->info("   ✅ {$orphans->count()} próximos stages criados");
    }
}
