<?php

namespace App\Exports;

use App\Models\Shipment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class ProcessesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * Get collection of shipments
     */
    public function collection()
    {
        return Shipment::with(['client', 'shippingLine', 'invoices'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Map data for each row
     */
    public function map($shipment): array
    {
        return [
            $shipment->reference_number,
            $shipment->type === 'import' ? 'Importação' : 'Exportação',
            $shipment->client->name ?? 'N/A',
            $shipment->shippingLine->name ?? 'N/A',
            $shipment->bl_number ?? 'N/A',
            $shipment->container_number ?? 'N/A',
            $shipment->vessel_name ?? 'N/A',
            $shipment->arrival_date?->format('d/m/Y') ?? 'N/A',
            $this->getStatusLabel($shipment->status),
            $shipment->cargo_description ?? 'N/A',
            $shipment->invoices->where('status', 'paid')->sum('amount'),
            $shipment->created_at->format('d/m/Y H:i'),
        ];
    }

    /**
     * Define headings
     */
    public function headings(): array
    {
        return [
            'Referência',
            'Tipo',
            'Cliente',
            'Navio/Linha',
            'BL Number',
            'Container',
            'Navio',
            'Data Chegada',
            'Status',
            'Descrição da Carga',
            'Receita Total',
            'Criado em',
        ];
    }

    /**
     * Apply styles to the sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Header row styling
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563EB'], // Blue-600
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

    /**
     * Sheet title
     */
    public function title(): string
    {
        return 'Processos';
    }

    /**
     * Get status label in Portuguese
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
