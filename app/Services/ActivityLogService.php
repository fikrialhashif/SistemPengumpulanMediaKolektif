<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public static function log(string $action, ?int $mediaId = null, ?string $description = null, ?int $userId = null): void
    {
        // Gunakan userId yang dilempar, atau ambil dari auth() jika tidak ada
        $resolvedUserId = $userId ?? (Auth::check() ? Auth::id() : null);

        ActivityLog::create([
            'user_id' => $resolvedUserId,
            'action' => $action,
            'media_id' => $mediaId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => substr(request()->header('User-Agent', ''), 0, 500),
        ]);
    }
}