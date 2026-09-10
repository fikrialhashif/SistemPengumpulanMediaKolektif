<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\ActivityLogService;
use App\Services\AuthService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            $user = $this->authService->login($data);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'Login successful'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            $user = $this->authService->register($data);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'Registration successful'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role', 'department']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->user()->currentAccessToken()->delete();

        ActivityLogService::log('LOGOUT', null, "User {$user->email} logged out", $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
}