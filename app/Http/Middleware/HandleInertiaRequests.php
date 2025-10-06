<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'notifications' => $this->getNotifications($request),
        ];
    }

    /**
     * Get user notifications (mock for now)
     */
    private function getNotifications(Request $request): array
    {
        if (!$request->user()) {
            return [];
        }

        // Mock de notificações - depois você substitui por dados reais do banco
        return [
            [
                'id' => 1,
                'title' => 'Novo Shipment',
                'message' => 'Shipment SHP-2025-00123 foi criado',
                'type' => 'info',
                'time' => '5 minutos atrás',
                'read' => false
            ],
            [
                'id' => 2,
                'title' => 'Documento Aprovado',
                'message' => 'BL carimbado para SHP-2025-00122',
                'type' => 'success',
                'time' => '1 hora atrás',
                'read' => false
            ]
        ];
    }
}
