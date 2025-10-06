<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return redirect('/login');
        }

        if (!in_array($request->user()->role, $roles)) {
            abort(403, 'Acesso não autorizado.');
        }

        return $next($request);
    }
}
