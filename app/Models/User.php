<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'department'

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

      /**
     * Relação com configurações
     */
    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }

    /**
     * Obter configuração específica
     */
    public function getSetting(string $key, $default = null)
    {
        if (!$this->settings) {
            return $default;
        }

        return $this->settings->$key ?? $default;
    }

    /**
     * Verificar se notificação está ativa
     */
    public function hasNotificationEnabled(string $key): bool
    {
        return $this->settings?->isNotificationEnabled($key) ?? false;
    }

    /**
     * Atualizar último login
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    public function documents(){
           return $this->hasMany(Document::class,'uploaded_by');
    }
    public function shipments(){
           return $this->hasMany(Shipment::class,'created_by');
    }




    // ========================================
    // MÉTODOS DE VERIFICAÇÃO DE DEPARTAMENTO
    // ========================================

    /**
     * Verifica se o usuário é do departamento de Finanças
     */
    public function isFinance(): bool
    {
        return in_array($this->department, ['finance', 'financas', 'financeiro'])
            || $this->role === 'finance'
            || $this->hasPermission('process_payment');
    }

    /**
     * Verifica se o usuário é do departamento de Operações
     */
    public function isOperations(): bool
    {
        return in_array($this->department, ['operations', 'operacoes', 'operacional'])
            || $this->role === 'operations'
            || $this->hasPermission('create_payment_request');
    }

    /**
     * Verifica se o usuário é Gestor (pode aprovar)
     */
    public function isGestor(): bool
    {
        return in_array($this->role, ['admin', 'manager', 'gestor'])
            || $this->hasPermission('approve_payment_request');
    }

    /**
     * Verifica se o usuário é Admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Verifica se o usuário tem permissão específica
     */
    public function hasPermission(string $permission): bool
    {
        // Se você tem um sistema de permissões, implemente aqui
        // Caso contrário, usar role-based:

        $rolePermissions = [
            'admin' => ['*'], // Admin tem todas as permissões

            'manager' => [
                'view_dashboard',
                'view_shipments',
                'approve_payment_request',
                'view_finance_dashboard',
                'view_payments',
            ],

            'finance' => [
                'view_finance_dashboard',
                'process_payment',
                'view_payments',
            ],

            'operations' => [
                'view_dashboard',
                'view_shipments',
                'create_payment_request',
                'attach_receipt',
            ],

            'user' => [
                'view_dashboard',
                'view_shipments',
            ],
        ];

        // Admin tem tudo
        if ($this->role === 'admin') {
            return true;
        }

        // Verificar permissões da role
        $permissions = $rolePermissions[$this->role] ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Obter nome do departamento formatado
     */
    public function getDepartmentNameAttribute(): string
    {
        $departments = [
            'finance' => 'Finanças',
            'financas' => 'Finanças',
            'operations' => 'Operações',
            'operacoes' => 'Operações',
            'admin' => 'Administração',
        ];

        return $departments[$this->department] ?? $this->department ?? 'N/A';
    }
 /**
     * Verifica se o usuário é administrador.
     */
    public function HasRole(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Obter nome da role formatado
     */
    public function getRoleNameAttribute(): string
    {
        $roles = [
            'admin' => 'Administrador',
            'manager' => 'Gestor',
            'finance' => 'Financeiro',
            'operations' => 'Operações',
            'user' => 'Usuário',
        ];

        return $roles[$this->role] ?? $this->role ?? 'N/A';
    }

    // ========================================
    // RELATIONSHIPS PARA PAYMENT REQUESTS
    // ========================================

    /**
     * Solicitações criadas pelo usuário
     */
    public function createdPaymentRequests()
    {
        return $this->hasMany(PaymentRequest::class, 'requested_by');
    }

    /**
     * Solicitações aprovadas pelo usuário
     */
    public function approvedPaymentRequests()
    {
        return $this->hasMany(PaymentRequest::class, 'approved_by');
    }

    /**
     * Pagamentos processados pelo usuário
     */
    public function processedPayments()
    {
        return $this->hasMany(PaymentRequest::class, 'paid_by');
    }

    /**
     * Atividades do usuário
     */
    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    // ========================================
    // SCOPES ÚTEIS
    // ========================================

    /**
     * Scope: Usuários do departamento de Finanças
     */
    public function scopeFinance($query)
    {
        return $query->where(function($q) {
            $q->where('department', 'finance')
              ->orWhere('department', 'financas')
              ->orWhere('role', 'finance');
        });
    }

    /**
     * Scope: Usuários do departamento de Operações
     */
    public function scopeOperations($query)
    {
        return $query->where(function($q) {
            $q->where('department', 'operations')
              ->orWhere('department', 'operacoes')
              ->orWhere('role', 'operations');
        });
    }

    /**
     * Scope: Gestores (podem aprovar)
     */
    public function scopeManagers($query)
    {
        return $query->whereIn('role', ['admin', 'manager', 'gestor']);
    }

    // ========================================
    // ESTATÍSTICAS DO USUÁRIO
    // ========================================

    /**
     * Estatísticas de solicitações criadas
     */
    public function getPaymentRequestsStatsAttribute(): array
    {
        if (!$this->isOperations()) {
            return [];
        }

        return [
            'total' => $this->createdPaymentRequests()->count(),
            'pending' => $this->createdPaymentRequests()->where('status', 'pending')->count(),
            'approved' => $this->createdPaymentRequests()->where('status', 'approved')->count(),
            'paid' => $this->createdPaymentRequests()->where('status', 'paid')->count(),
            'rejected' => $this->createdPaymentRequests()->where('status', 'rejected')->count(),
        ];
    }

    /**
     * Estatísticas de aprovações (para gestores)
     */
    public function getApprovalsStatsAttribute(): array
    {
        if (!$this->isGestor()) {
            return [];
        }

        return [
            'total_approved' => $this->approvedPaymentRequests()->where('status', 'approved')->count(),
            'total_rejected' => $this->approvedPaymentRequests()->where('status', 'rejected')->count(),
            'pending_approval' => PaymentRequest::where('status', 'pending')->count(),
        ];
    }

    /**
     * Estatísticas de pagamentos processados (para finanças)
     */
    public function getPaymentsStatsAttribute(): array
    {
        if (!$this->isFinance()) {
            return [];
        }

        return [
            'total_processed' => $this->processedPayments()->where('status', 'paid')->count(),
            'in_progress' => $this->processedPayments()->where('status', 'in_payment')->count(),
            'pending' => PaymentRequest::where('status', 'approved')->count(),
        ];
    }
}
