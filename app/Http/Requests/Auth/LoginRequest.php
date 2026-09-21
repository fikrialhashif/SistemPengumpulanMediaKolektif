<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required'],
            'captcha_key' => ['required', 'string'],
            'captcha_code' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.exists' => 'Akun dengan email ini tidak ditemukan.',
            'password.required' => 'Password wajib diisi.',
            'captcha_key.required' => 'Sesi captcha tidak valid. Silakan muat ulang captcha.',
            'captcha_code.required' => 'Kode captcha wajib diisi.',
        ];
    }
}