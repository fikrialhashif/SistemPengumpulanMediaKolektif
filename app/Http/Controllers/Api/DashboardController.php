<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $role = $user->role->name;

        $data = [];

        if ($role === 'USER') {
            // Department-specific dashboard
            $departmentId = $user->department_id;

            $data['total_media'] = Media::where('department_id', $departmentId)->count();
            $data['media_by_category'] = Media::where('department_id', $departmentId)
                ->select('category_id', DB::raw('count(*) as total'))
                ->with('category:id,name')
                ->groupBy('category_id')
                ->get();
            $data['recent_media'] = Media::where('department_id', $departmentId)
                ->with(['category', 'uploader'])
                ->latest()
                ->take(5)
                ->get();
            $data['recent_uploads'] = ActivityLog::where('action', 'UPLOAD_MEDIA')
                ->whereHas('media', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                })
                ->with('user')
                ->latest()
                ->take(5)
                ->get();

            $data['my_media'] = Media::where('uploaded_by', $user->id)
                ->where('department_id', $departmentId)
                ->with(['category', 'uploader'])
                ->latest('created_at')
                ->take(3)
                ->get();
        } elseif ($role === 'CORSEC') {
            // CORSEC dashboard - all departments
            $data['total_media'] = Media::count();
            $data['media_by_department'] = Media::select('department_id', DB::raw('count(*) as total'))
                ->with('department:id,code,name')
                ->groupBy('department_id')
                ->get();
            $data['recent_media'] = Media::with(['department', 'category', 'uploader'])
                ->latest()
                ->take(10)
                ->get();
        } else {
            // SUPERADMIN dashboard
            $data['total_users'] = User::count();
            $data['total_departments'] = Department::count();
            $data['total_media'] = Media::count();
            $data['total_deleted_media'] = Media::onlyTrashed()->count();
            $data['activities_today'] = ActivityLog::whereDate('created_at', today())->count();
            $data['recent_media'] = Media::with(['department', 'category', 'uploader'])
                ->latest()
                ->take(5)
                ->get();
            $data['recent_users'] = User::with(['department', 'role'])
                ->latest()
                ->take(5)
                ->get();
            $data['recent_activities'] = ActivityLog::with(['user.department', 'user.role', 'media'])
                ->latest()
                ->take(10)
                ->get();
            $data['media_by_department'] = Media::select('department_id', DB::raw('count(*) as total'))
                ->with('department:id,code,name')
                ->groupBy('department_id')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }
}