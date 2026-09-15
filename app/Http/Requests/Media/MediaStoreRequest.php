<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MediaStoreRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', Rule::exists('master_media_categories', 'id')->where('status', 'ACTIVE')],
            'event_date' => ['required', 'date'],
            'department_id' => ['nullable', Rule::exists('master_departments', 'id')->where('status', 'ACTIVE')],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['file', 'max:102400', 'mimes:jpg,jpeg,png,webp,mp4,mov,avi,mkv,webm,pdf,doc,docx,ppt,pptx'],
        ];
    }
}