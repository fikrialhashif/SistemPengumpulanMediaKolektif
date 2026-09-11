<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;

class MediaUpdateRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'sometimes', 'string'],
            'category_id' => ['sometimes', 'required', 'exists:master_media_categories,id'],
            'event_date' => ['sometimes', 'required', 'date'],
            'department_id' => ['sometimes', 'required', 'exists:master_departments,id'],
            'file' => ['sometimes', 'file', 'max:102400', 'mimes:jpg,jpeg,png,webp,mp4,mov,avi,mkv,webm,pdf,doc,docx,ppt,pptx'],
            'files' => ['sometimes', 'array'],
            'files.*' => ['file', 'max:102400', 'mimes:jpg,jpeg,png,webp,mp4,mov,avi,mkv,webm,pdf,doc,docx,ppt,pptx'],
        ];
    }
}