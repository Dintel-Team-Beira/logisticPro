<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
// use App\Models\AuditLog;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Registrar apenas ações importantes (POST, PUT, PATCH, DELETE)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
             AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $request->method() . ' ' . $request->path(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'route_name' => $request->route()?->getName(),
                'payload' => json_encode($request->except(['password', '_token'])),
                'created_at' => now(),
            ]);
        }

        return $response;
    }
}
