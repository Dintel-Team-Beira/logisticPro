<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfNotClient
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('client')->check()) {
            return redirect()->route('client.login');
        }

        $client = Auth::guard('client')->user();

        // Check if client can access portal
        if (!$client->canAccessPortal()) {
            Auth::guard('client')->logout();
            return redirect()->route('client.login')
                ->with('error', 'Seu acesso ao portal foi desativado. Entre em contato conosco.');
        }

        return $next($request);
    }
}
