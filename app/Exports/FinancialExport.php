<?php

namespace App\Exports;

use App\Models\Invoice;
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

class FinancialExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * Get collection of invoices
     */
    public function collection()
    {
        return Invoice::with(['shipment'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Map data for each row
     */
    public function map($invoice): array
    {
        return [
            $invoice->invoice_number,
            $invoice->shipment->reference_number ?? 'N/A',
            $invoice->issuer ?? 'N/A',
            $this->getTypeLabel($invoice->type),
            $invoice->amount,
            $invoice->currency,
            $this->getStatusLabel($invoice->status),
            $invoice->issue_date?->format('d/m/Y') ?? 'N/A',
            $invoice->due_date?->format('d/m/Y') ?? 'N/A',
            $invoice->payment_date?->format('d/m/Y') ?? 'N/A',
            $invoice->description ?? 'N/A',
            $invoice->created_at->format('d/m/Y H:i'),
        ];
    }

    /**
     * Define headings
     */
    public function headings(): array
    {
        return [
            'Nº Fatura',
            'Processo',
            'Emissor',
            'Tipo',
            'Valor',
            'Moeda',
            'Status',
            'Data Emissão',
            'Data Vencimento',
            'Data Pagamento',
            'Descrição',
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
                    'startColor' => ['rgb' => '059669'], // Emerald-600
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
        return 'Financeiro';
    }

    /**
     * Get type label in Portuguese
     */
    private function getTypeLabel($type)
    {
        return match($type) {
            'shipping' => 'Frete',
            'storage' => 'Armazenagem',
            'customs' => 'Alfândega',
            'tax' => 'Taxa',
            'other' => 'Outros',
            default => ucfirst($type)
        };
    }

    /**
     * Get status label in Portuguese
     */
    private function getStatusLabel($status)
    {
        return match($status) {
            'pending' => 'Pendente',
            'paid' => 'Pago',
            'overdue' => 'Vencido',
            'cancelled' => 'Cancelado',
            default => ucfirst($status)
        };
    }
}
