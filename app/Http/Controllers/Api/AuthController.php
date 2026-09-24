<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\ActivityLogService;
use App\Services\AuthService;
use App\Services\CaptchaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function captcha(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CaptchaService::generate(),
        ], 200);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $throttleKey = Str::transliterate(Str::lower($data['email']) . '|' . $request->ip());

        // Perlindungan Brute Force: Maksimal 5 percobaan per menit
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam {$seconds} detik.",
                'retry_after' => $seconds,
            ], 429);
        }

        // Validasi Captcha
        if (!CaptchaService::validate($data['captcha_key'] ?? null, $data['captcha_code'] ?? null)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'success' => false,
                'message' => 'Kode captcha salah atau sudah kadaluarsa. Silakan coba lagi.',
                'errors' => ['captcha_code' => ['Kode captcha salah atau sudah kadaluarsa.']]
            ], 422);
        }

        try {
            $user = $this->authService->login($data);
            RateLimiter::clear($throttleKey);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'Login successful'
            ], 200);
        } catch (Exception $e) {
            RateLimiter::hit($throttleKey, 60);

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

    public function updateAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'password.min' => 'Password baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $oldName = $user->name;
        $updates = [];

        // Update name
        if ($validated['name'] !== $user->name) {
            $updates['name'] = $validated['name'];
        }

        // Update password jika diisi
        if (!empty($validated['password'])) {
            if (empty($request->input('current_password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password saat ini wajib diisi untuk mengubah password.',
                    'errors' => ['current_password' => ['Password saat ini wajib diisi.']]
                ], 422);
            }

            if (!Hash::check($request->input('current_password'), $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password saat ini tidak sesuai.',
                    'errors' => ['current_password' => ['Password saat ini tidak sesuai.']]
                ], 422);
            }

            $updates['password'] = Hash::make($validated['password']);
        }

        if (empty($updates)) {
            return response()->json([
                'success' => true,
                'data' => new UserResource($user->load(['role', 'department'])),
                'message' => 'Tidak ada perubahan data.'
            ], 200);
        }

        $user->update($updates);
        $user->load(['role', 'department']);

        $logMsg = "User {$user->email} memperbarui akun";
        if (isset($updates['name'])) $logMsg .= " (nama diubah dari: {$oldName} menjadi: {$user->name})";
        if (isset($updates['password'])) $logMsg .= " (ganti password)";
        ActivityLogService::log('UPDATE_ACCOUNT', null, $logMsg, $user->id);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Akun (nama/password) berhasil diperbarui.'
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