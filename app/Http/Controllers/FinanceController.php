// app/Http/Controllers/FinanceController.php
public function payments(Request $request)
{
    $query = PaymentRequest::with(['shipment.client', 'payment_proof'])
        ->where('status', 'paid');

    // Filtros
    if ($request->search) {
        $query->where(function($q) use ($request) {
            $q->whereHas('shipment', function($sq) use ($request) {
                $sq->where('reference_number', 'like', "%{$request->search}%")
                   ->orWhere('client_name', 'like', "%{$request->search}%");
            })
            ->orWhere('payee', 'like', "%{$request->search}%");
        });
    }

    if ($request->status && $request->status != 'all') {
        $query->where('status', $request->status);
    }

    // Ordenação
    $sortBy = $request->sort ?? 'date_desc';
    switch ($sortBy) {
        case 'date_asc':
            $query->orderBy('paid_at', 'asc');
            break;
        case 'amount_desc':
            $query->orderBy('amount', 'desc');
            break;
        case 'amount_asc':
            $query->orderBy('amount', 'asc');
            break;
        default:
            $query->orderBy('paid_at', 'desc');
    }

    $payments = $query->paginate(20);

    $stats = [
        'total_paid' => PaymentRequest::where('status', 'paid')->sum('amount'),
        'this_month' => PaymentRequest::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)->sum('amount'),
        'total_payments' => PaymentRequest::where('status', 'paid')->count(),
        'average_payment' => PaymentRequest::where('status', 'paid')->avg('amount'),
    ];

    return inertia('Finance/Payments', [
        'payments' => $payments,
        'stats' => $stats,
        'filters' => $request->only(['search', 'status', 'date', 'sort']),
    ]);
}

public function budgets(Request $request)
{
    $year = $request->year ?? now()->year;

    $budgets = Budget::where('year', $year)->get();

    $yearlyStats = [
        'total_budget' => $budgets->sum('amount'),
        'total_spent' => $budgets->sum('spent'),
    ];

    return inertia('Finance/Budgets', [
        'budgets' => $budgets,
        'currentYear' => $year,
        'yearlyStats' => $yearlyStats,
    ]);
}

public function storeBudget(Request $request)
{
    $validated = $request->validate([
        'category' => 'required|string|max:255',
        'description' => 'nullable|string',
        'amount' => 'required|numeric|min:0',
        'year' => 'required|integer',
    ]);

    Budget::create($validated);

    return redirect()->back()->with('success', 'Orçamento criado com sucesso!');
}

public function updateBudget(Request $request, Budget $budget)
{
    $validated = $request->validate([
        'category' => 'required|string|max:255',
        'description' => 'nullable|string',
        'amount' => 'required|numeric|min:0',
    ]);

    $budget->update($validated);

    return redirect()->back()->with('success', 'Orçamento atualizado!');
}

public function destroyBudget(Budget $budget)
{
    $budget->delete();

    return redirect()->back()->with('success', 'Orçamento excluído!');
}
