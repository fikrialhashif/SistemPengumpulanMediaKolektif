<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'department_id' => ['sometimes', 'nullable', 'exists:master_departments,id'],
            'role_id' => ['sometimes', 'required', 'exists:master_roles,id'],
            'status' => ['sometimes', 'required', 'in:ACTIVE,INACTIVE'],
        ];
    }
}