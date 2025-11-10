<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class QuotationController extends Controller
{
    /**
     * Display quotation for a shipment
     */
    public function show(Shipment $shipment)
    {
        $shipment->load(['client', 'consignee', 'shippingLine']);

        return Inertia::render('Quotations/Show', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Generate and download quotation PDF
     */
    public function downloadPdf(Shipment $shipment)
    {
        $shipment->load(['client', 'consignee', 'shippingLine']);

        // Verificar se tem cotação
        if (!$shipment->quotation_reference) {
            return back()->with('error', 'Este processo não possui cotação gerada!');
        }

        $pdf = Pdf::loadView('pdfs.quotation', [
            'shipment' => $shipment,
        ]);

        return $pdf->download("cotacao-{$shipment->quotation_reference}.pdf");
    }

    /**
     * Approve quotation
     */
    public function approve(Shipment $shipment)
    {
        if (!$shipment->quotation_reference) {
            return back()->with('error', 'Este processo não possui cotação!');
        }

        $shipment->update([
            'quotation_status' => 'approved',
            'quotation_approved_at' => now(),
        ]);

        return back()->with('success', 'Cotação aprovada com sucesso!');
    }

    /**
     * Reject quotation
     */
    public function reject(Shipment $shipment)
    {
        if (!$shipment->quotation_reference) {
            return back()->with('error', 'Este processo não possui cotação!');
        }

        $shipment->update([
            'quotation_status' => 'rejected',
        ]);

        return back()->with('success', 'Cotação rejeitada!');
    }
}
