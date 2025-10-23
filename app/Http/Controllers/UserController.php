<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserActivity;
use App\Notifications\UserCredentialsNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('name')->paginate(15);

        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,manager,operations,finance,viewer'
        ]);

        // Guardar senha antes de hash para enviar no email
        $plainPassword = $validated['password'];

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password'])
        ]);

        // Enviar email com credenciais de acesso
        $user->notify(new UserCredentialsNotification($user, $plainPassword));

        return redirect()->route('users.index')
            ->with('success', 'Usuário criado com sucesso! Email com credenciais foi enviado.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,manager,operations,finance,viewer',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'Usuário atualizado com sucesso!');
    }

    public function show(User $user)
    {
        // Carregar estatísticas e atividades recentes
        $user->load(['activities' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(50);
        }]);

        // Estatísticas gerais
        $stats = [
            'total_activities' => $user->activities()->count(),
            'recent_logins' => $user->activities()->where('action', 'login')->count(),
            'shipments_created' => $user->shipments()->count(),
            'documents_uploaded' => $user->documents()->count(),
        ];

        // Adicionar estatísticas por role
        if ($user->isOperations()) {
            $stats['payment_requests'] = $user->getPaymentRequestsStatsAttribute();
        }

        if ($user->isGestor()) {
            $stats['approvals'] = $user->getApprovalsStatsAttribute();
        }

        if ($user->isFinance()) {
            $stats['payments'] = $user->getPaymentsStatsAttribute();
        }

        return Inertia::render('Users/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function activities(User $user)
    {
        $activities = $user->activities()
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'model' => $activity->model,
                    'model_id' => $activity->model_id,
                    'ip_address' => $activity->ip_address,
                    'created_at' => $activity->created_at->format('d/m/Y H:i:s'),
                    'icon' => $activity->icon,
                    'color' => $activity->color,
                    'time_ago' => $activity->created_at->diffForHumans(),
                ];
            });

        return response()->json($activities);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Você não pode excluir sua própria conta!');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuário removido com sucesso!');
    }
}
