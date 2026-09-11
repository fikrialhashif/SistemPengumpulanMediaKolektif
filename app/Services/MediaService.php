<?php

namespace App\Services;

use App\Models\Media;
use App\Models\MediaFile;
use App\Models\Department;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    public static function upload(array $files, array $metadata): Media
    {
        $user = auth()->user();
        $department = Department::find($metadata['department_id']);
        $dir = 'media/' . Str::slug($department->code);

        $firstFile = $files[0];

        $media = Media::create([
            'department_id' => $metadata['department_id'],
            'uploaded_by' => $user->id,
            'category_id' => $metadata['category_id'],
            'title' => $metadata['title'],
            'description' => $metadata['description'] ?? null,
            'event_date' => $metadata['event_date'],
            'file_name' => $firstFile->getClientOriginalName(),
            'file_path' => '',
            'file_type' => $firstFile->getClientMimeType(),
            'file_size' => 0,
        ]);

        $totalSize = 0;
        foreach ($files as $file) {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($dir, $filename);

            MediaFile::create([
                'media_id' => $media->id,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            $totalSize += $file->getSize();
        }

        $firstStoredFile = $media->files()->first();
        $media->update([
            'file_path' => $firstStoredFile->file_path,
            'file_size' => $totalSize,
        ]);

        return $media->fresh();
    }

    public static function update(Media $media, array $metadata, ?array $files = null): Media
    {
        if ($files && count($files) > 0) {
            foreach ($media->files as $oldFile) {
                Storage::delete($oldFile->file_path);
            }
            $media->files()->delete();

            Storage::delete($media->file_path);

            $department = Department::find($metadata['department_id'] ?? $media->department_id);
            $dir = 'media/' . Str::slug($department->code);

            $totalSize = 0;
            foreach ($files as $file) {
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($dir, $filename);

                MediaFile::create([
                    'media_id' => $media->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);

                $totalSize += $file->getSize();
            }

            $firstFile = $files[0];
            $firstStoredFile = $media->files()->first();
            $media->update([
                'category_id' => $metadata['category_id'] ?? $media->category_id,
                'title' => $metadata['title'] ?? $media->title,
                'description' => $metadata['description'] ?? $media->description,
                'event_date' => $metadata['event_date'] ?? $media->event_date,
                'file_name' => $firstFile->getClientOriginalName(),
                'file_path' => $firstStoredFile->file_path,
                'file_type' => $firstFile->getClientMimeType(),
                'file_size' => $totalSize,
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
        foreach ($media->files as $file) {
            Storage::delete($file->file_path);
        }
        $media->files()->delete();
        Storage::delete($media->file_path);
        $media->forceDelete();
    }
}