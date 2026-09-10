<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Department;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    public static function upload(UploadedFile $file, array $metadata): Media
    {
        $user = auth()->user();

        $department = Department::find($metadata['department_id']);

        $dir = 'media/' . Str::slug($department->code);

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs($dir, $filename);

        return Media::create([
            'department_id' => $metadata['department_id'],
            'uploaded_by' => $user->id,
            'category_id' => $metadata['category_id'],
            'title' => $metadata['title'],
            'description' => $metadata['description'] ?? null,
            'event_date' => $metadata['event_date'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);
    }

    public static function update(Media $media, array $metadata, ?UploadedFile $file = null): Media
    {
        if ($file) {
            Storage::delete($media->file_path);

            $department = Department::find($metadata['department_id'] ?? $media->department_id);
            $dir = 'media/' . Str::slug($department->code);
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $filename);

            $media->update([
                'category_id' => $metadata['category_id'] ?? $media->category_id,
                'title' => $metadata['title'] ?? $media->title,
                'description' => $metadata['description'] ?? $media->description,
                'event_date' => $metadata['event_date'] ?? $media->event_date,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        } else {
            $media->update([
                'category_id' => $metadata['category_id'] ?? $media->category_id,
                'title' => $metadata['title'] ?? $media->title,
                'description' => $metadata['description'] ?? $media->description,
                'event_date' => $metadata['event_date'] ?? $media->event_date,
            ]);
        }

        return $media->fresh();
    }

    public static function delete(Media $media): void
    {
        $media->delete();
    }

    public static function restore(Media $media): void
    {
        $media->restore();
    }

    public static function forceDelete(Media $media): void
    {
        Storage::delete($media->file_path);
        $media->forceDelete();
    }
}