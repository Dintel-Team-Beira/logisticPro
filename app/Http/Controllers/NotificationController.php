<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Notificação',
                    'message' => $notification->data['message'] ?? '',
                    'type' => $notification->data['type'] ?? 'info',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'read' => $notification->read_at !== null,
                    'time' => $notification->created_at->diffForHumans(),
                    'created_at' => $notification->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $count = Auth::user()->unreadNotifications()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = Auth::user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notificação marcada como lida'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notificação não encontrada'
        ], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Todas as notificações foram marcadas como lidas'
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $notification = Auth::user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notificação excluída'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notificação não encontrada'
        ], 404);
    }

    /**
     * Delete all read notifications
     */
    public function deleteAllRead()
    {
        $deleted = Auth::user()
            ->notifications()
            ->whereNotNull('read_at')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deleted} notificações excluídas"
        ]);
    }
}
