<?php

namespace App\Exports;

use App\Models\Shipment;
use App\Models\ShippingLine;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class PerformanceExport implements WithMultipleSheets
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * Return multiple sheets
     */
    public function sheets(): array
    {
        return [
            new PerformanceShippingLinesSheet($this->startDate, $this->endDate),
            new PerformanceStagesSheet($this->startDate, $this->endDate),
        ];
    }
}

/**
 * Shipping Lines Performance Sheet
 */
class PerformanceShippingLinesSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return ShippingLine::with(['shipments' => function ($query) {
                $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
            }])
            ->get()
            ->filter(function ($line) {
                return $line->shipments->count() > 0;
            });
    }

    public function map($line): array
    {
        $shipments = $line->shipments;
        $completed = $shipments->where('status', 'completed');
        $totalDays = $completed->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->updated_at);
        });
        $avgTime = $completed->count() > 0 ? round($totalDays / $completed->count(), 1) : 0;

        return [
            $line->name,
            $shipments->count(),
            $completed->count(),
            $shipments->count() - $completed->count(),
            $completed->count() > 0 ? round(($completed->count() / $shipments->count()) * 100, 1) . '%' : '0%',
            $avgTime . ' dias',
        ];
    }

    public function headings(): array
    {
        return [
            'Linha de Navegação',
            'Total Processos',
            'Concluídos',
            'Em Andamento',
            'Taxa de Conclusão',
            'Tempo Médio',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'D97706'], // Amber-600
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Linhas de Navegação';
    }
}

/**
 * Stages Performance Sheet
 */
class PerformanceStagesSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $stages = ['coleta_dispersa', 'legalizacao', 'alfandegas', 'cornelder', 'taxacao'];
        $data = collect();

        foreach ($stages as $stage) {
            $total = \DB::table('shipment_stages')
                ->join('shipments', 'shipment_stages.shipment_id', '=', 'shipments.id')
                ->whereBetween('shipments.created_at', [$this->startDate, $this->endDate])
                ->where('shipment_stages.stage', $stage)
                ->count();

            $completed = \DB::table('shipment_stages')
                ->join('shipments', 'shipment_stages.shipment_id', '=', 'shipments.id')
                ->whereBetween('shipments.created_at', [$this->startDate, $this->endDate])
                ->where('shipment_stages.stage', $stage)
                ->where('shipment_stages.status', 'completed')
                ->count();

            $data->push((object)[
                'stage' => $stage,
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            ]);
        }

        return $data;
    }

    public function map($item): array
    {
        return [
            $this->getStageLabel($item->stage),
            $item->total,
            $item->completed,
            $item->total - $item->completed,
            $item->rate . '%',
        ];
    }

    public function headings(): array
    {
        return [
            'Etapa',
            'Total Processos',
            'Concluídos',
            'Pendentes',
            'Taxa de Conclusão',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '7C3AED'], // Purple-600
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Desempenho por Etapa';
    }

    private function getStageLabel($stage)
    {
        return match($stage) {
            'coleta_dispersa' => 'Coleta Dispersa',
            'legalizacao' => 'Legalização',
            'alfandegas' => 'Alfândegas',
            'cornelder' => 'Cornelder',
            'taxacao' => 'Taxação',
            default => ucfirst($stage)
        };
    }
}
