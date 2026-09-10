<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;

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
            'category_id' => ['required', 'exists:master_media_categories,id'],
            'event_date' => ['required', 'date'],
            'department_id' => ['nullable', 'exists:master_departments,id'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov,avi,mkv,webm,pdf,doc,docx,ppt,pptx'],
        ];
    }
}