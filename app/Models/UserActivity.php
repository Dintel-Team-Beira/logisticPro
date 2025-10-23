<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model',
        'model_id',
        'description',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the activity.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a user activity
     */
    public static function log(string $action, string $description, ?string $model = null, ?int $modelId = null, ?array $properties = null)
    {
        return static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get icon based on action type
     */
    public function getIconAttribute()
    {
        return match($this->action) {
            'login' => '🔐',
            'logout' => '👋',
            'create' => '✨',
            'update' => '✏️',
            'delete' => '🗑️',
            'view' => '👁️',
            'approve' => '✅',
            'reject' => '❌',
            'export' => '📥',
            default => '📝',
        };
    }

    /**
     * Get color based on action type
     */
    public function getColorAttribute()
    {
        return match($this->action) {
            'login' => 'text-green-600',
            'logout' => 'text-gray-600',
            'create' => 'text-blue-600',
            'update' => 'text-yellow-600',
            'delete' => 'text-red-600',
            'view' => 'text-indigo-600',
            'approve' => 'text-green-600',
            'reject' => 'text-red-600',
            'export' => 'text-purple-600',
            default => 'text-gray-600',
        };
    }
}
