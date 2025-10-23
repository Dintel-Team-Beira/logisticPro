<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\ShippingLine;
use App\Models\Document;
use App\Models\Activity;
use App\Models\Client;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = now();

        $data = [
            // Shipments Analytics
            'shipments_by_status' => $this->getShipmentsByStatus($startDate, $endDate),
            'shipments_by_stage' => $this->getShipmentsByStage($startDate, $endDate),
            'shipments_timeline' => $this->getShipmentsTimeline($startDate, $endDate),

            // Financial Analytics
            'revenue_summary' => $this->getRevenueSummary($startDate, $endDate),
            'revenue_by_month' => $this->getRevenueByMonth($startDate, $endDate),
            'invoices_summary' => $this->getInvoicesSummary($startDate, $endDate),
            'top_revenue_shipments' => $this->getTopRevenueShipments($startDate, $endDate),

            // Shipping Lines Performance
            'top_shipping_lines' => $this->getTopShippingLines($startDate, $endDate),
            'shipping_lines_performance' => $this->getShippingLinesPerformance($startDate, $endDate),

            // Operational Metrics
            'average_processing_time' => $this->getAverageProcessingTime($startDate, $endDate),
            'stage_completion_rates' => $this->getStageCompletionRates($startDate, $endDate),
            'documents_statistics' => $this->getDocumentsStatistics($startDate, $endDate),

            // Recent Activities
            'recent_activities' => $this->getRecentActivities(20),

            // Summary Cards
            'summary' => $this->getSummaryCards($startDate, $endDate),
        ];

        return Inertia::render('Reports/Index', [
            'data' => $data,
            'period' => $period,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }

    /**
     * Export reports to Excel/PDF.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'pdf'); // pdf, excel
        $type = $request->get('type', 'processes'); // processes, financial, performance
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = now();

        $fileName = $this->generateFileName($type, $format, $startDate, $endDate);

        // Export based on format
        if ($format === 'excel') {
            return $this->exportExcel($type, $startDate, $endDate, $fileName);
        } else {
            return $this->exportPDF($type, $startDate, $endDate, $fileName);
        }
    }

    /**
     * Export to Excel
     */
    private function exportExcel($type, $startDate, $endDate, $fileName)
    {
        $export = match($type) {
            'processes' => new \App\Exports\ProcessesExport($startDate, $endDate),
            'financial' => new \App\Exports\FinancialExport($startDate, $endDate),
            'performance' => new \App\Exports\PerformanceExport($startDate, $endDate),
            default => new \App\Exports\ProcessesExport($startDate, $endDate),
        };

        return Excel::download($export, $fileName);
    }

    /**
     * Export to PDF
     */
    private function exportPDF($type, $startDate, $endDate, $fileName)
    {
        $data = $this->getReportData($type, $startDate, $endDate);

        $pdf = Pdf::loadView("reports.pdf.{$type}", [
            'data' => $data,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
        ]);

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download($fileName);
    }

    /**
     * Get report data based on type
     */
    private function getReportData($type, $startDate, $endDate)
    {
        return match($type) {
            'processes' => [
                'shipments' => Shipment::with(['client', 'shippingLine', 'invoices'])
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->get(),
                'summary' => $this->getSummaryCards($startDate, $endDate),
                'by_status' => $this->getShipmentsByStatus($startDate, $endDate),
                'by_stage' => $this->getShipmentsByStage($startDate, $endDate),
            ],
            'financial' => [
                'invoices' => Invoice::with(['shipment'])
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->get(),
                'summary' => $this->getRevenueSummary($startDate, $endDate),
                'by_month' => $this->getRevenueByMonth($startDate, $endDate),
                'invoices_summary' => $this->getInvoicesSummary($startDate, $endDate),
            ],
            'performance' => [
                'shipping_lines' => $this->getShippingLinesPerformance($startDate, $endDate),
                'stage_completion' => $this->getStageCompletionRates($startDate, $endDate),
                'avg_processing_time' => $this->getAverageProcessingTime($startDate, $endDate),
                'documents_stats' => $this->getDocumentsStatistics($startDate, $endDate),
            ],
            default => [],
        };
    }

    /**
     * Generate file name for export
     */
    private function generateFileName($type, $format, $startDate, $endDate)
    {
        $typeName = match($type) {
            'processes' => 'processos',
            'financial' => 'financeiro',
            'performance' => 'desempenho',
            default => 'relatorio',
        };

        $dateRange = $startDate->format('Ymd') . '_' . $endDate->format('Ymd');

        return "relatorio_{$typeName}_{$dateRange}.{$format}";
    }

    /**
     * Get custom date range report.
     */
    public function customRange(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $data = [
            'shipments_by_status' => $this->getShipmentsByStatus($startDate, $endDate),
            'revenue_summary' => $this->getRevenueSummary($startDate, $endDate),
            'summary' => $this->getSummaryCards($startDate, $endDate),
        ];

        return response()->json($data);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Get start date based on period.
     */
    private function getStartDate($period)
    {
        return match($period) {
            'today' => now()->startOfDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            'all' => Carbon::create(2020, 1, 1),
            default => now()->subMonth()
        };
    }

    /**
     * Get summary cards data.
     */
    private function getSummaryCards($startDate, $endDate)
    {
        return [
            'total_shipments' => Shipment::whereBetween('created_at', [$startDate, $endDate])->count(),
            'active_shipments' => Shipment::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', '!=', 'completed')->count(),
            'completed_shipments' => Shipment::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'completed')->count(),
            'total_revenue' => Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->sum('amount'),
            'pending_invoices' => Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'pending')->count(),
            'overdue_invoices' => Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'overdue')->count(),
        ];
    }

    /**
     * Get shipments grouped by status.
     */
    private function getShipmentsByStatus($startDate, $endDate)
    {
        return Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'total' => $item->total,
                    'label' => $this->getStatusLabel($item->status),
                ];
            });
    }

    /**
     * Get shipments grouped by current stage.
     */
    private function getShipmentsByStage($startDate, $endDate)
    {
        return DB::table('shipment_stages')
            ->join('shipments', 'shipment_stages.shipment_id', '=', 'shipments.id')
            ->whereBetween('shipments.created_at', [$startDate, $endDate])
            ->where('shipment_stages.status', 'in_progress')
            ->select('shipment_stages.stage', DB::raw('count(*) as total'))
            ->groupBy('shipment_stages.stage')
            ->get();
    }

    /**
     * Get shipments timeline (created per day/week/month).
     */
    private function getShipmentsTimeline($startDate, $endDate)
    {
        $diff = $startDate->diffInDays($endDate);

        if ($diff <= 31) {
            // Daily for last month
            $format = '%Y-%m-%d';
            $groupBy = 'date';
        } elseif ($diff <= 90) {
            // Weekly for last quarter
            $format = '%Y-%u';
            $groupBy = 'week';
        } else {
            // Monthly for longer periods
            $format = '%Y-%m';
            $groupBy = 'month';
        }

        return Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
                DB::raw('count(*) as total')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    /**
     * Get revenue summary.
     */
    private function getRevenueSummary($startDate, $endDate)
    {
        $invoices = Invoice::whereBetween('created_at', [$startDate, $endDate]);

        return [
            'total' => $invoices->sum('amount'),
            'paid' => $invoices->where('status', 'paid')->sum('amount'),
            'pending' => $invoices->where('status', 'pending')->sum('amount'),
            'overdue' => $invoices->where('status', 'overdue')->sum('amount'),
            'by_currency' => $invoices->select('currency', DB::raw('SUM(amount) as total'))
                ->groupBy('currency')
                ->get(),
        ];
    }

    /**
     * Get revenue grouped by month.
     */
    private function getRevenueByMonth($startDate, $endDate)
    {
        return Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->select(
                DB::raw('DATE_FORMAT(payment_date, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get invoices summary.
     */
    private function getInvoicesSummary($startDate, $endDate)
    {
        $invoices = Invoice::whereBetween('created_at', [$startDate, $endDate]);

        return [
            'total_count' => $invoices->count(),
            'total_amount' => $invoices->sum('amount'),
            'paid_count' => $invoices->where('status', 'paid')->count(),
            'paid_amount' => $invoices->where('status', 'paid')->sum('amount'),
            'pending_count' => $invoices->where('status', 'pending')->count(),
            'pending_amount' => $invoices->where('status', 'pending')->sum('amount'),
            'overdue_count' => $invoices->where('status', 'overdue')->count(),
            'overdue_amount' => $invoices->where('status', 'overdue')->sum('amount'),
            'by_type' => $invoices->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('type')
                ->get(),
        ];
    }

    /**
     * Get top revenue generating shipments.
     */
    private function getTopRevenueShipments($startDate, $endDate, $limit = 10)
    {
        return Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->with(['shippingLine', 'invoices'])
            ->get()
            ->map(function ($shipment) {
                return [
                    'id' => $shipment->id,
                    'reference_number' => $shipment->reference_number,
                    'shipping_line' => $shipment->shippingLine->name ?? 'N/A',
                    'total_revenue' => $shipment->invoices->where('status', 'paid')->sum('amount'),
                ];
            })
            ->sortByDesc('total_revenue')
            ->take($limit)
            ->values();
    }

    /**
     * Get top performing shipping lines.
     */
    private function getTopShippingLines($startDate, $endDate, $limit = 10)
    {
        return ShippingLine::withCount(['shipments' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->having('shipments_count', '>', 0)
            ->orderByDesc('shipments_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get detailed shipping lines performance.
     */
    private function getShippingLinesPerformance($startDate, $endDate)
    {
        return ShippingLine::with(['shipments' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function ($line) {
                $shipments = $line->shipments;
                return [
                    'name' => $line->name,
                    'total_shipments' => $shipments->count(),
                    'completed' => $shipments->where('status', 'completed')->count(),
                    'in_progress' => $shipments->where('status', '!=', 'completed')->count(),
                    'avg_processing_time' => $this->calculateAvgTime($shipments),
                ];
            })
            ->sortByDesc('total_shipments')
            ->values();
    }

    /**
     * Get average processing time for shipments.
     */
    private function getAverageProcessingTime($startDate, $endDate)
    {
        $completedShipments = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->get();

        if ($completedShipments->isEmpty()) {
            return 0;
        }

        $totalDays = $completedShipments->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->updated_at);
        });

        return round($totalDays / $completedShipments->count(), 1);
    }

    /**
     * Get stage completion rates.
     */
    private function getStageCompletionRates($startDate, $endDate)
    {
        $stages = ['coleta_dispersa', 'legalizacao', 'alfandegas', 'cornelder', 'taxacao'];
        $results = [];

        foreach ($stages as $stage) {
            $total = DB::table('shipment_stages')
                ->join('shipments', 'shipment_stages.shipment_id', '=', 'shipments.id')
                ->whereBetween('shipments.created_at', [$startDate, $endDate])
                ->where('shipment_stages.stage', $stage)
                ->count();

            $completed = DB::table('shipment_stages')
                ->join('shipments', 'shipment_stages.shipment_id', '=', 'shipments.id')
                ->whereBetween('shipments.created_at', [$startDate, $endDate])
                ->where('shipment_stages.stage', $stage)
                ->where('shipment_stages.status', 'completed')
                ->count();

            $results[] = [
                'stage' => $stage,
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            ];
        }

        return $results;
    }

    /**
     * Get documents statistics.
     */
    private function getDocumentsStatistics($startDate, $endDate)
    {
        return [
            'total' => Document::whereBetween('created_at', [$startDate, $endDate])->count(),
            'by_type' => Document::whereBetween('created_at', [$startDate, $endDate])
                ->select('type', DB::raw('COUNT(*) as count'))
                ->groupBy('type')
                ->get(),
            'by_stage' => Document::whereBetween('created_at', [$startDate, $endDate])
                ->select('stage', DB::raw('COUNT(*) as count'))
                ->groupBy('stage')
                ->get(),
            'total_size' => Document::whereBetween('created_at', [$startDate, $endDate])->sum('size'),
        ];
    }

    /**
     * Get recent activities.
     */
    private function getRecentActivities($limit = 20)
    {
        return Activity::with(['user', 'shipment'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate average processing time for a collection of shipments.
     */
    private function calculateAvgTime($shipments)
    {
        $completed = $shipments->where('status', 'completed');

        if ($completed->isEmpty()) {
            return null;
        }

        $totalDays = $completed->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->updated_at);
        });

        return round($totalDays / $completed->count(), 1);
    }

    /**
     * Get status label in Portuguese.
     */
    private function getStatusLabel($status)
    {
        return match($status) {
            'coleta_dispersa' => 'Coleta Dispersa',
            'legalizacao' => 'Legalização',
            'alfandegas' => 'Alfândegas',
            'cornelder' => 'Cornelder',
            'taxacao' => 'Taxação',
            'completed' => 'Concluído',
            default => ucfirst($status)
        };
    }
}
