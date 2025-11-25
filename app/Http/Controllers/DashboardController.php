<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\Client;
use App\Models\ShippingLine;
use App\Models\Document;
use App\Models\Activity;
use App\Models\PaymentRequest;
use App\Models\ShipmentStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * DashboardController - LOGISTICA PRO
 * Dashboard operacional completo com sistema de roles
 *
 * @author Arnaldo Tomo
 */
class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $period = $request->get('period', 'month');

        // Datas do período
        $startDate = $this->getStartDate($period);
        $endDate = now();

        // Buscar dados baseados no role do usuário
        $data = [
            'stats' => $this->getMainStats($startDate, $endDate),
            'recentShipments' => $this->getRecentShipments($user->role),
            'recentActivities' => $this->getRecentActivities(10),
            'stageStats' => $this->getStageStats(),
            'alerts' => $this->getUrgentAlerts($user->role),
        ];

        // Dados financeiros apenas para Admin e Manager
        if (in_array($user->role, ['admin', 'manager'])) {
            $data['financialSummary'] = $this->getFinancialSummary($startDate, $endDate);
        }

        return Inertia::render('Dashboard', $data);
    }

    /**
     * Estatísticas principais
     */
    private function getMainStats($startDate, $endDate)
    {
        // Shipments ativos (não completados ou cancelados)
        $activeShipments = Shipment::whereNotIn('status', ['completed', 'cancelled'])->count();

        // Novos esta semana
        $newThisWeek = Shipment::where('created_at', '>=', now()->startOfWeek())->count();

        // Growth comparado ao período anterior
        $previousPeriod = $this->getPreviousPeriod($startDate, $endDate);
        $currentShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])->count();
        $previousShipments = Shipment::whereBetween('created_at', [$previousPeriod['start'], $previousPeriod['end']])->count();
        $shipmentsGrowth = $previousShipments > 0
            ? round((($currentShipments - $previousShipments) / $previousShipments) * 100, 1)
            : 0;

        // Documentos pendentes
        $pendingDocuments = Document::whereHas('shipment', function($q) {
            $q->whereNotIn('status', ['completed', 'cancelled']);
        })->count();

        // Documentos urgentes (shipments com deadline próximo sem documentos essenciais)
        $documentsUrgent = Shipment::where('storage_deadline', '<=', now()->addDays(3))
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->whereDoesntHave('documents', function($q) {
                $q->whereIn('type', ['bl', 'delivery_order']);
            })
            ->count();

        // Faturas pendentes
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'overdue')->count();
        $pendingAmount = Invoice::where('status', 'pending')->sum('amount');

        $peddingPayment= PaymentRequest::where('status','approved')->count();
        // Shipments por mês (para gráfico)
        $monthlyShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%b") as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->get();

        return [
            'activeShipments' => $activeShipments,
            'newThisWeek' => $newThisWeek,
            'shipmentsGrowth' => $shipmentsGrowth,
            'pendingDocuments' => $pendingDocuments,
            'documentsUrgent' => $documentsUrgent,
            'pendingInvoices' => $pendingInvoices,
            'overdueInvoices' => $overdueInvoices,
            'pendingAmount' => $pendingAmount,
            'monthlyShipments' => $monthlyShipments,
            'peddingPayment'=> $peddingPayment,
        ];
    }

    /**
     * Resumo financeiro (apenas Admin/Manager)
     */
    private function getFinancialSummary($startDate, $endDate)
    {
        // Receita total
        $totalRevenue = Invoice::where('status', 'paid')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        // Despesas totais (invoices que a empresa paga)
        $totalExpenses = Invoice::whereIn('type', ['coleta_dispersa', 'alfandegas', 'cornelder'])
            ->where('status', 'paid')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        // Lucro
        $profit = $totalRevenue - $totalExpenses;

        // Growth
        $previousPeriod = $this->getPreviousPeriod($startDate, $endDate);
        $previousRevenue = Invoice::where('status', 'paid')
            ->whereBetween('payment_date', [$previousPeriod['start'], $previousPeriod['end']])
            ->sum('amount');

        $revenueGrowth = $previousRevenue > 0
            ? round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : 0;

        // Dados mensais para gráfico
        $monthlyData = Invoice::where('status', 'paid')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE_FORMAT(payment_date, "%b") as month'),
                DB::raw('SUM(CASE WHEN type = "faturacao" OR type = "cliente" THEN amount ELSE 0 END) as revenue'),
                DB::raw('SUM(CASE WHEN type IN ("coleta_dispersa", "alfandegas", "cornelder", "outros") THEN amount ELSE 0 END) as expenses')
            )
            ->groupBy('month')
            ->orderBy(DB::raw('DATE_FORMAT(payment_date, "%Y-%m")'))
            ->get()
            ->map(function($item) {
                return [
                    'month' => $item->month,
                    'revenue' => (float) $item->revenue,
                    'expenses' => (float) $item->expenses,
                    'profit' => (float) ($item->revenue - $item->expenses),
                ];
            });

        return [
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'profit' => $profit,
            'revenueGrowth' => $revenueGrowth,
            'monthlyData' => $monthlyData,
        ];
    }

    /**
     * Estatísticas por fase (ShipmentStages)
     */
    private function getStageStats()
    {
        $stages = [
            'coleta_dispersa' => 'Coleta de Despesas',
            'legalizacao' => 'Legalização',
            'alfandegas' => 'Alfândegas',
            'cornelder' => 'Cornelder',
            'taxacao' => 'Taxação',
        ];

        $distribution = [];
        foreach ($stages as $key => $label) {
            $count = ShipmentStage::where('stage', $key)
                ->where('status', 'in_progress')
                ->count();

            if ($count > 0) {
                $distribution[] = [
                    'name' => $label,
                    'value' => $count,
                    'stage' => $key,
                ];
            }
        }

        // Adicionar concluídos
        $completed = Shipment::where('status', 'completed')->count();
        if ($completed > 0) {
            $distribution[] = [
                'name' => 'Concluído',
                'value' => $completed,
                'stage' => 'completed',
            ];
        }

        return [
            'distribution' => $distribution,
            'total' => collect($distribution)->sum('value'),
        ];
    }

    /**
     * Shipments recentes
     */
    private function getRecentShipments($role)
    {
        $query = Shipment::with([
            'client:id,name',
            'shippingLine:id,name',
            'stages' => function($q) {
                $q->where('status', 'in_progress')
                  ->orWhere('status', 'pending')
                  ->orderBy('id', 'desc')
                  ->limit(1);
            }
        ])
        ->whereNotIn('status', ['completed', 'cancelled'])
        ->orderBy('created_at', 'desc')
        ->limit(5);

        // Filtrar por role se necessário
        // Se tiver alguma regra específica de acesso, aplicar aqui

        return $query->get()->map(function($shipment) {
            return [
                'id' => $shipment->id,
                'reference_number' => $shipment->reference_number,
                'bl_number' => $shipment->bl_number,
                'client' => $shipment->client,
                'shipping_line' => $shipment->shippingLine,
                'current_phase' => $shipment->current_phase,
                'stages' => $shipment->stages,
                'created_at' => $shipment->created_at->format('d/m/Y H:i'),
            ];
        });
    }

    /**
     * Atividades recentes
     */
    private function getRecentActivities($limit = 10)
    {
        return Activity::with(['user:id,name', 'shipment:id,reference_number'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'user' => $activity->user,
                    'shipment_ref' => $activity->shipment->reference_number ?? null,
                    'created_at' => $activity->created_at->toIso8601String(),
                ];
            });
    }

    /**
     * Alertas urgentes
     */
    private function getUrgentAlerts($role)
    {
        $alerts = [];

        // Storage crítico (deadline em menos de 3 dias)
        $criticalStorage = Shipment::where('storage_deadline', '<=', now()->addDays(3))
            ->where('storage_deadline', '>=', now())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($criticalStorage > 0) {
            $alerts[] = [
                'type' => 'storage',
                'severity' => 'high',
                'message' => "{$criticalStorage} processo(s) com deadline de storage crítico (< 3 dias)",
                'link' => '/shipments?filter=storage_critical'
            ];
        }

        // Faturas vencidas (apenas Admin/Manager)
        if (in_array($role, ['admin', 'manager'])) {
            $overdueInvoices = Invoice::where('status', 'overdue')->count();

            if ($overdueInvoices > 0) {
                $alerts[] = [
                    'type' => 'invoice',
                    'severity' => 'high',
                    'message' => "{$overdueInvoices} fatura(s) vencida(s) pendente(s) de pagamento",
                    'link' => '/invoices?status=overdue'
                ];
            }
        }

        // Documentos essenciais faltando
        $missingDocs = Shipment::whereDoesntHave('documents', function($q) {
                $q->where('type', 'bl');
            })
            ->where('created_at', '<=', now()->subDays(2))
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($missingDocs > 0) {
            $alerts[] = [
                'type' => 'documents',
                'severity' => 'medium',
                'message' => "{$missingDocs} processo(s) sem BL anexado há mais de 2 dias",
                'link' => '/shipments?filter=missing_bl'
            ];
        }

        // Processos parados há muito tempo
        $stuckProcesses = ShipmentStage::where('status', 'in_progress')
            ->where('started_at', '<=', now()->subDays(7))
            ->count();

        if ($stuckProcesses > 0) {
            $alerts[] = [
                'type' => 'process',
                'severity' => 'medium',
                'message' => "{$stuckProcesses} processo(s) parado(s) na mesma fase há mais de 7 dias",
                'link' => '/operations'
            ];
        }

        return $alerts;
    }

    /**
     * Helpers para datas
     */
    private function getStartDate($period)
    {
        return match($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };
    }

    private function getPreviousPeriod($startDate, $endDate)
    {
        $diff = $startDate->diffInDays($endDate);

        return [
            'start' => $startDate->copy()->subDays($diff + 1),
            'end' => $startDate->copy()->subDay(),
        ];
    }

    /**
     * API endpoint para stats (para refresh assíncrono)
     */
    public function stats(Request $request)
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = now();

        return response()->json([
            'stats' => $this->getMainStats($startDate, $endDate),
            'stageStats' => $this->getStageStats(),
            'alerts' => $this->getUrgentAlerts(auth()->user()->role),
        ]);
    }
}
