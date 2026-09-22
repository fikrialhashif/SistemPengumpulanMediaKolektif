<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'event_date' => $this->event_date,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'uploaded_by' => $this->uploaded_by,
            'department_id' => $this->department_id,
            'approval_status' => $this->approval_status ?? 'PENDING',
            'review_notes' => $this->review_notes,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at,
            'approver' => new UserResource($this->whenLoaded('approver')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'uploader' => new UserResource($this->whenLoaded('uploader')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'files' => $this->whenLoaded('files', function () {
                return $this->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'file_path' => $file->file_path,
                        'file_name' => $file->file_name,
                        'file_type' => $file->file_type,
                        'file_size' => $file->file_size,
                    ];
                });
            }),
        ];
    }
}