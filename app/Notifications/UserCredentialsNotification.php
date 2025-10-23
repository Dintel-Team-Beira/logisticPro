<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserCredentialsNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $password;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $roleNames = [
            'admin' => 'Administrador',
            'manager' => 'Gerente',
            'operations' => 'Operações',
            'finance' => 'Financeiro',
            'viewer' => 'Visualizador',
        ];

        $roleName = $roleNames[$this->user->role] ?? $this->user->role;

        return (new MailMessage)
            ->subject('🔐 Credenciais de Acesso - LogisticaPro')
            ->greeting("Olá, {$this->user->name}!")
            ->line('Sua conta foi criada com sucesso no sistema LogisticaPro.')
            ->line('')
            ->line('**Suas credenciais de acesso:**')
            ->line("**Email:** {$this->user->email}")
            ->line("**Senha:** {$this->password}")
            ->line("**Perfil:** {$roleName}")
            ->line('')
            ->line('⚠️ **Importante:** Por motivos de segurança, recomendamos que você altere sua senha após o primeiro login.')
            ->line('')
            ->action('Acessar Sistema', url('/login'))
            ->line('Se você não solicitou esta conta, por favor ignore este email ou entre em contato com o administrador.')
            ->line('')
            ->line('Obrigado por usar o LogisticaPro!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_email' => $this->user->email,
        ];
    }
}
