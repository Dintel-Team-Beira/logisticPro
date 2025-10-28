<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClientAuthController extends Controller
{
    /**
     * Show login form
     */
    public function showLogin()
    {
        return Inertia::render('Client/Auth/Login');
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->password) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if (!$client->canAccessPortal()) {
            throw ValidationException::withMessages([
                'email' => ['Seu acesso ao portal foi desativado. Entre em contato conosco.'],
            ]);
        }

        if (!Hash::check($request->password, $client->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        Auth::guard('client')->login($client, $request->boolean('remember'));

        $client->updateLastLogin();

        $request->session()->regenerate();

        // dd($request);

        return redirect()->intended(route('client.dashboard'));
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Auth::guard('client')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('client.login');
    }

    /**
     * Show initial setup form (for first access with token)
     */
    public function showInitialSetup(Request $request)
    {
        $token = $request->query('token');
        $email = $request->query('email');

        if (!$token || !$email) {
            return redirect()->route('client.login')
                ->with('error', 'Link inválido ou expirado.');
        }

        $client = Client::where('email', $email)->first();

        if (!$client || !$client->validateInitialAccessToken($token)) {
            return redirect()->route('client.login')
                ->with('error', 'Link inválido ou expirado.');
        }

        return Inertia::render('Client/Auth/InitialSetup', [
            'email' => $email,
            'token' => $token,
            'clientName' => $client->display_name,
        ]);
    }

    /**
     * Handle initial setup (password creation)
     */
    public function initialSetup(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->validateInitialAccessToken($request->token)) {
            return back()->withErrors([
                'email' => 'Link inválido ou expirado.',
            ]);
        }

        // Set password and activate portal
        $client->setPortalPassword($request->password);

        // Auto login
        Auth::guard('client')->login($client);

        $request->session()->regenerate();

        return redirect()->route('client.dashboard')
            ->with('success', 'Bem-vindo! Sua conta foi configurada com sucesso.');
    }

    /**
     * Show forgot password form
     */
    public function showForgotPassword()
    {
        return Inertia::render('Client/Auth/ForgotPassword');
    }

    /**
     * Handle forgot password request
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $request->email)->first();

        if ($client && $client->portal_access) {
            // Generate new token and send email
            $token = $client->generateInitialAccessToken();

            // TODO: Send email with reset link
            // Mail::to($client->email)->send(new ClientPasswordResetMail($client, $token));

            return back()->with('success', 'Instruções para redefinir sua senha foram enviadas para seu email.');
        }

        // Don't reveal if email exists or not
        return back()->with('success', 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.');
    }
}
