<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserStoreRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request)
    {
        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $perPage = $request->query('per_page', 20);
        $query = User::with(['department', 'role']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ]
        ], 200);
    }

    public function show($id)
    {
        if (auth()->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = User::with(['department', 'role'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ], 200);
    }

    public function store(UserStoreRequest $request)
    {
        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = $this->userService->create($request->validated());

        ActivityLogService::log('CREATE_USER', null, "Membuat user: {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'User berhasil dibuat'
        ], 201);
    }

    public function update(UserUpdateRequest $request, $id)
    {
        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = $this->userService->update($request->validated(), User::findOrFail($id));

        ActivityLogService::log('UPDATE_USER', null, "Update user: {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'User berhasil diperbarui'
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = User::findOrFail($id);
        $userId = $user->id;
        $userName = $user->name;

        $user->delete();

        ActivityLogService::log('DELETE_USER', null, "Menghapus user: {$userName}");

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus'
        ], 200);
    }

    public function activate($id)
    {
        if (auth()->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = User::findOrFail($id);

        $user->status = 'ACTIVE';
        $user->save();

        ActivityLogService::log('ACTIVATE_USER', null, "Aktifkan user: {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'User berhasil diaktifkan'
        ], 200);
    }

    public function deactivate($id)
    {
        if (auth()->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $user = User::findOrFail($id);

        $user->status = 'INACTIVE';
        $user->save();

        ActivityLogService::log('DEACTIVATE_USER', null, "Nonaktifkan user: {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'User berhasil dinonaktifkan'
        ], 200);
    }
}