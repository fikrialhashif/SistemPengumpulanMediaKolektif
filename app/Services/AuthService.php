<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(array $data): User
    {
        $user = User::with(['role', 'department'])->where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new \Exception('Email atau password salah');
        }

        if ($user->status !== 'ACTIVE') {
            throw new \Exception('Akun Anda tidak aktif. Hubungi Superadmin.');
        }

        // Create token
        $user->token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogService::log('LOGIN', null, "User {$user->email} logged in", $user->id);

        return $user;
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'department_id' => $data['department_id'],
            'role_id' => $data['role_id'],
            'status' => 'ACTIVE',
        ]);

        $user->load(['role', 'department']);
        $user->token = $user->createToken('auth_token')->plainTextToken;

        return $user;
    }
}