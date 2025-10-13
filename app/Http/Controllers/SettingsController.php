<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use App\Models\UserSetting;
use App\Models\CompanySetting;

class SettingsController extends Controller
{
    /**
     * RF-033: Dashboard de Configurações
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Settings/Index', [
            'user' => $user,
            'userSettings' => $this->getUserSettings(),
            'companySettings' => $this->getCompanySettings(),
            'notificationPreferences' => $this->getNotificationPreferences(),
            'stats' => [
                'documents_uploaded' => $user->documents()->count() ?? 0,
                'shipments_created' => $user->shipments()->count() ?? 0,
                'last_login' => $user->last_login_at ? $user->last_login_at->diffForHumans() : null,
            ]
        ]);
    }

    // ============================================================================
    // PERFIL DO USUÁRIO
    // ============================================================================

    /**
     * RF-033.1: Atualizar Perfil
     */
    public function updateProfile(Request $request)
    {

        // dd($request->all());
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:100'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Perfil atualizado com sucesso!');
    }

    /**
     * RF-033.2: Upload de Foto de Perfil
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // 2MB max
        ]);

        $user = Auth::user();

        // Remover avatar antigo
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Fazer upload do novo
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return back()->with('success', 'Foto de perfil atualizada!');
    }

    /**
     * RF-033.3: Alterar Senha
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return back()->with('success', 'Senha alterada com sucesso!');
    }

    // ============================================================================
    // PREFERÊNCIAS DO SISTEMA
    // ============================================================================

    /**
     * RF-033.4: Atualizar Preferências de Interface
     */
    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'theme' => ['required', 'in:light,dark,auto'],
            'language' => ['required', 'in:pt,en,es'],
            'timezone' => ['required', 'string'],
            'date_format' => ['required', 'in:DD/MM/YYYY,MM/DD/YYYY,YYYY-MM-DD'],
            'currency' => ['required', 'in:MZN,USD,EUR'],
            'items_per_page' => ['required', 'integer', 'min:10', 'max:100'],
        ]);

        $user = Auth::user();

        UserSetting::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('success', 'Preferências atualizadas!');
    }

    // ============================================================================
    // NOTIFICAÇÕES
    // ============================================================================

    /**
     * RF-033.5: Configurar Notificações
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'email_notifications' => ['boolean'],
            'shipment_updates' => ['boolean'],
            'document_alerts' => ['boolean'],
            'payment_reminders' => ['boolean'],
            'storage_warnings' => ['boolean'],
            'deadline_alerts' => ['boolean'],
            'daily_summary' => ['boolean'],
            'weekly_report' => ['boolean'],
        ]);

        $user = Auth::user();

        $settings = UserSetting::firstOrCreate(['user_id' => $user->id]);
        $settings->update(['notifications' => $validated]);

        return back()->with('success', 'Preferências de notificação atualizadas!');
    }

    // ============================================================================
    // CONFIGURAÇÕES DA EMPRESA (Admin Only)
    // ============================================================================

   /**
 * RF-033.6: Atualizar Dados da Empresa (COMPLETO)
 */
public function updateCompany(Request $request)
{
    // dd($request->all());
    if (Auth::user()->role !== 'admin') {
        abort(403, 'Acesso negado');
    }

    $validated = $request->validate([
        'company_name' => ['sometimes', 'required', 'string', 'max:255'],
        'company_email' => ['sometimes', 'required', 'email'],
        'company_phone' => ['sometimes', 'required', 'string'],
        'company_address' => ['sometimes', 'nullable', 'string'],
        'tax_id' => ['sometimes', 'nullable', 'string'],
        'logo' => ['sometimes', 'nullable', 'image', 'max:2048'],
        'maintenance_mode' => ['sometimes', 'boolean'],
        'two_factor_enabled' => ['sometimes', 'boolean'],
        'session_timeout' => ['sometimes', 'integer', 'min:5', 'max:1440'],
    ]);

    $companySetting = CompanySetting::firstOrCreate(['id' => 1]);

    // Upload de logo
    if ($request->hasFile('logo')) {
        // Remover logo antigo
        if ($companySetting->logo) {
            Storage::disk('public')->delete($companySetting->logo);
        }
        $validated['logo'] = $request->file('logo')->store('company', 'public');
    }

    $companySetting->update($validated);

    return back()->with('success', 'Configurações da empresa atualizadas!');
}

    /**
     * RF-033.7: Configurações de Faturação
     */
    public function updateInvoiceSettings(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Acesso negado');
        }

        $validated = $request->validate([
            'invoice_prefix' => ['required', 'string', 'max:10'],
            'next_invoice_number' => ['required', 'integer', 'min:1'],
            'default_payment_terms' => ['required', 'integer', 'min:1'],
            'default_margin_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'bank_details' => ['required', 'string'],
            'invoice_notes' => ['nullable', 'string'],
        ]);

        CompanySetting::updateOrCreate(
            ['id' => 1],
            ['invoice_settings' => $validated]
        );

        return back()->with('success', 'Configurações de faturação atualizadas!');
    }

    // ============================================================================
    // INTEGRAÇÕES E API
    // ============================================================================

    /**
     * RF-033.8: Gerar API Token
     */
    public function generateApiToken(Request $request)
    {
        $user = Auth::user();

        // Revogar tokens antigos
        $user->tokens()->delete();

        // Gerar novo token
        $token = $user->createToken('api-token')->plainTextToken;

        return back()->with([
            'success' => 'Token API gerado com sucesso!',
            'token' => $token
        ]);
    }

    /**
     * RF-033.9: Configurar Webhooks
     */
    public function updateWebhooks(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Acesso negado');
        }

        $validated = $request->validate([
            'webhooks' => ['array'],
            'webhooks.*.url' => ['required', 'url'],
            'webhooks.*.events' => ['required', 'array'],
            'webhooks.*.active' => ['boolean'],
        ]);

        CompanySetting::updateOrCreate(
            ['id' => 1],
            ['webhooks' => $validated['webhooks']]
        );

        return back()->with('success', 'Webhooks configurados!');
    }

    // ============================================================================
    // MÉTODOS AUXILIARES
    // ============================================================================

    private function getUserSettings()
    {
        $user = Auth::user();
        return UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => 'light',
                'language' => 'pt',
                'timezone' => 'Africa/Maputo',
                'date_format' => 'DD/MM/YYYY',
                'currency' => 'MZN',
                'items_per_page' => 25,
            ]
        );
    }

    private function getCompanySettings()
    {
        // CORREÇÃO: Remover o ternário incorreto
        if (Auth::user()->role !== 'admin') {
            return null;
        }

        return CompanySetting::firstOrCreate(['id' => 1], [
            'company_name' => 'ALEK Logistics & Transport, LDA',
            'company_email' => 'info@alek.co.mzqq',
            'company_phone' => '+258 84 000 0000',
        ]);
    }

    private function getNotificationPreferences()
    {
        $settings = UserSetting::where('user_id', Auth::id())->first();

        return $settings ? ($settings->notifications ?? []) : [
            'email_notifications' => true,
            'shipment_updates' => true,
            'document_alerts' => true,
            'payment_reminders' => true,
            'storage_warnings' => true,
            'deadline_alerts' => true,
            'daily_summary' => false,
            'weekly_report' => true,
        ];
    }
}
