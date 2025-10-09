<?php

// app/Models/UserSetting.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'timezone',
        'date_format',
        'currency',
        'items_per_page',
        'notifications',
    ];

    protected $casts = [
        'notifications' => 'array',
        'items_per_page' => 'integer',
    ];

    /**
     * Relação com o usuário
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verificar se uma notificação está ativa
     */
    public function isNotificationEnabled(string $key): bool
    {
        return $this->notifications[$key] ?? false;
    }
}
