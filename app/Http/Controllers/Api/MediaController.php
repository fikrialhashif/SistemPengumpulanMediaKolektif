<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\MediaStoreRequest;
use App\Http\Requests\Media\MediaUpdateRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\ActivityLogService;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    protected $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    protected function userCanAccess(Media $media, $user): bool
    {
        if (!$user) return false;
        $role = $user->role->name;
        if ($role === 'SUPERADMIN') return true;

        // CORSEC hanya boleh lihat media yang sudah APPROVED
        if ($role === 'CORSEC') {
            return $media->approval_status === 'APPROVED';
        }

        // MANAGER boleh lihat semua media departemennya
        if ($role === 'MANAGER') {
            return $media->department_id === $user->department_id;
        }

        // Regular USER hanya boleh lihat media miliknya sendiri
        return $media->uploaded_by === $user->id;
    }

    protected function userCanModify(Media $media, $user): bool
    {
        if (!$user) return false;
        $role = $user->role->name;
        if ($role === 'SUPERADMIN') return true;
        
        // Regular user atau manager hanya pemilik yang bisa ubah metadata/file
        return $media->uploaded_by === $user->id;
    }

    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 20);
        $user = $request->user();
        $role = $user->role->name;

        $query = Media::with(['department', 'uploader', 'category', 'approver']);

        if ($role === 'USER') {
            // User hanya bisa melihat media miliknya sendiri
            $query->where('uploaded_by', $user->id);
            
            // Filter dropdown approved / unapproved / pending jika diminta
            if ($request->filled('approval_status')) {
                $query->where('approval_status', $request->string('approval_status'));
            }
        } elseif ($role === 'MANAGER') {
            // Manager melihat semua media yang diupload di departemennya
            $query->where('department_id', $user->department_id);

            if ($request->filled('approval_status')) {
                $query->where('approval_status', $request->string('approval_status'));
            }
        } elseif ($role === 'CORSEC') {
            // CORSEC HANYA DAPAT MELIHAT media yang sudah diapprove oleh Manager
            $query->where('approval_status', 'APPROVED');
        } elseif ($role === 'SUPERADMIN') {
            // Superadmin dapat melihat semua media terlepas status approval
            if ($request->filled('approval_status')) {
                $query->where('approval_status', $request->string('approval_status'));
            }
        }

        if ($request->filled('department_id') && in_array($role, ['CORSEC', 'SUPERADMIN'])) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('event_date')) {
            $query->whereDate('event_date', $request->date('event_date'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->date('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->date('to_date'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        $medias = $query->latest('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => MediaResource::collection($medias),
            'meta' => [
                'current_page' => $medias->currentPage(),
                'per_page' => $medias->perPage(),
                'total' => $medias->total(),
                'last_page' => $medias->lastPage(),
            ]
        ], 200);
    }

    public function show(Request $request, $id)
    {
        $media = Media::with(['department', 'uploader', 'category', 'files'])->findOrFail($id);
        $user = $request->user();

        if (!$this->userCanAccess($media, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke media ini.'
            ], 403);
        }

        ActivityLogService::log('VIEW_MEDIA', $media->id, "Melihat media: {$media->title}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media)
        ], 200);
    }

    public function store(MediaStoreRequest $request)
    {
        $user = $request->user();
        $role = $user->role->name;

        $validated = $request->validated();

        if (in_array($role, ['USER', 'MANAGER'])) {
            $validated['department_id'] = $user->department_id;
        } elseif ($role === 'CORSEC') {
            if (empty($validated['department_id'])) {
                $validated['department_id'] = $user->department_id;
            }
        }

        $files = $request->file('files');
        $media = $this->mediaService->upload($files, $validated);

        ActivityLogService::log('UPLOAD_MEDIA', $media->id, "Upload media: {$media->title} ({$media->files->count()} file) oleh {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media->load('files')),
            'message' => 'Media berhasil diunggah'
        ], 201);
    }

    public function update(MediaUpdateRequest $request, $id)
    {
        $media = Media::findOrFail($id);
        $user = $request->user();
        $role = $user->role->name;

        if (!$this->userCanModify($media, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengedit media ini.'
            ], 403);
        }

        if ($role === 'USER' && $request->has('department_id') && (int) $request->department_id !== $media->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat mengubah departemen media.'
            ], 403);
        }

        if ($role === 'USER' && $request->has('department_id')) {
            $request->merge(['department_id' => $media->department_id]);
        }

        $media = $this->mediaService->update($media, $request->validated(), $request->file('files'));

        ActivityLogService::log('UPDATE_MEDIA', $media->id, "Update media: {$media->title}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media->load('files')),
            'message' => 'Media berhasil diperbarui'
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $media = Media::findOrFail($id);
        $user = $request->user();
        $role = $user->role->name;

        if ($role === 'USER') {
            if ($media->uploaded_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda hanya dapat menghapus media yang Anda unggah.'
                ], 403);
            }
            MediaService::delete($media);
            ActivityLogService::log('DELETE_MEDIA', $media->id, "Hapus media: {$media->title} oleh {$user->name}");
            return response()->json([
                'success' => true,
                'message' => 'Media berhasil dihapus (soft delete)'
            ], 200);
        }

        // CORSEC or SUPERADMIN
        MediaService::delete($media);
        ActivityLogService::log('DELETE_MEDIA', $media->id, "Hapus media: {$media->title} oleh {$role} {$user->name}");
        return response()->json([
            'success' => true,
            'message' => 'Media berhasil dihapus'
        ], 200);
    }

    public function download(Request $request, $id)
    {
        $media = Media::with('files')->findOrFail($id);
        $user = $request->user();

        if (!$this->userCanAccess($media, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengunduh media ini.'
            ], 403);
        }

        $files = $media->files && $media->files->isNotEmpty()
            ? $media->files
            : collect([
                (object)[
                    'file_path' => $media->file_path,
                    'file_name' => $media->file_name,
                    'file_type' => $media->file_type,
                    'file_size' => $media->file_size,
                ]
            ]);

        $disk = Storage::disk(config('filesystems.default', 'public'));

        if ($files->count() === 1) {
            $file = $files->first();

            if (!$disk->exists($file->file_path)) {
                $fallbackPath = storage_path('app/public/assets/fallback-image.svg');
                $headers = [
                    'Content-Type' => 'image/svg+xml',
                    'Content-Disposition' => 'inline; filename="fallback-image.svg"',
                ];
                return response()->file($fallbackPath, $headers);
            }

            ActivityLogService::log('DOWNLOAD_MEDIA', $media->id, "Download media: {$media->title} oleh {$user->name}");

            $path = $disk->path($file->file_path);
            $headers = [
                'Content-Type' => $file->file_type,
                'Content-Disposition' => 'attachment; filename="' . $file->file_name . '"',
            ];

            return response()->download($path, $file->file_name, $headers);
        }

        // Multiple files - zip them
        $tmpFile = tempnam(sys_get_temp_dir(), 'mediakolektif_');
        $zip = new \ZipArchive();
        $zip->open($tmpFile, \ZipArchive::OVERWRITE);

        foreach ($files as $file) {
            if (!$disk->exists($file->file_path)) {
                continue;
            }
            $localPath = $disk->path($file->file_path);
            $zip->addFile($localPath, $file->file_name);
        }
        $zip->close();

        ActivityLogService::log('DOWNLOAD_MEDIA', $media->id, "Download media (ZIP - {$files->count()} files): {$media->title} oleh {$user->name}");

        $zipName = $media->title . '_files.zip';

        return response()->download($tmpFile, $zipName, [
            'Content-Type' => 'application/zip',
            'Content-Transfer-Encoding' => 'binary',
            'Pragma' => 'public',
            'Expires' => '0',
        ]);
    }

    public function downloadFile(Request $request, $id, $fileId)
    {
        $media = Media::with('files')->findOrFail($id);
        $user = $request->user();

        if (!$this->userCanAccess($media, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengunduh media ini.'
            ], 403);
        }

        $file = $media->files->firstWhere('id', $fileId);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan.'
            ], 404);
        }

        $disk = Storage::disk(config('filesystems.default', 'public'));

        if (!$disk->exists($file->file_path)) {
            $fallbackPath = storage_path('app/public/assets/fallback-image.svg');
            $headers = [
                'Content-Type' => 'image/svg+xml',
                'Content-Disposition' => 'inline; filename="fallback-image.svg"',
            ];
            return response()->file($fallbackPath, $headers);
        }

        ActivityLogService::log('DOWNLOAD_MEDIA', $media->id, "Download file: {$file->file_name} dari media: {$media->title} oleh {$user->name}");

        $path = $disk->path($file->file_path);
        $headers = [
            'Content-Type' => $file->file_type,
            'Content-Disposition' => 'attachment; filename="' . $file->file_name . '"',
        ];

        return response()->download($path, $file->file_name, $headers);
    }

    public function trash(Request $request)
    {
        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $perPage = $request->query('per_page', 20);
        $medias = Media::onlyTrashed()
            ->with(['department', 'uploader', 'category'])
            ->latest('deleted_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => MediaResource::collection($medias),
            'meta' => [
                'current_page' => $medias->currentPage(),
                'per_page' => $medias->perPage(),
                'total' => $medias->total(),
                'last_page' => $medias->lastPage(),
            ]
        ], 200);
    }

    public function restore(Request $request, $id)
    {
        $media = Media::onlyTrashed()->findOrFail($id);

        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        MediaService::restore($media);
        ActivityLogService::log('RESTORE_MEDIA', $media->id, "Restore media: {$media->title}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media),
            'message' => 'Media berhasil dipulihkan'
        ], 200);
    }

    public function approve(Request $request, $id)
    {
        $media = Media::findOrFail($id);
        $user = $request->user();
        $role = $user->role->name;

        // Hanya Manager departemen bersangkutan atau Superadmin yang dapat approve
        if ($role !== 'SUPERADMIN' && ($role !== 'MANAGER' || $media->department_id !== $user->department_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Manager dari departemen terkait yang dapat menyetujui media ini.'
            ], 403);
        }

        $media->update([
            'approval_status' => 'APPROVED',
            'review_notes' => $request->input('review_notes', null),
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        ActivityLogService::log('APPROVE_MEDIA', $media->id, "Media disetujui oleh {$user->name}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media->fresh(['department', 'uploader', 'category', 'approver', 'files'])),
            'message' => 'Media berhasil disetujui (Approved)'
        ], 200);
    }

    public function unapprove(Request $request, $id)
    {
        $media = Media::findOrFail($id);
        $user = $request->user();
        $role = $user->role->name;

        // Hanya Manager departemen bersangkutan atau Superadmin yang dapat unapprove
        if ($role !== 'SUPERADMIN' && ($role !== 'MANAGER' || $media->department_id !== $user->department_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Manager dari departemen terkait yang dapat menolak/unapprove media ini.'
            ], 403);
        }

        $request->validate([
            'review_notes' => ['required', 'string', 'min:3', 'max:1000'],
        ], [
            'review_notes.required' => 'Catatan review (alasan penolakan) wajib diisi saat unapprove media.',
            'review_notes.min' => 'Catatan review minimal 3 karakter.',
        ]);

        $media->update([
            'approval_status' => 'UNAPPROVED',
            'review_notes' => $request->string('review_notes'),
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        ActivityLogService::log('UNAPPROVE_MEDIA', $media->id, "Media ditolak (Unapproved) oleh {$user->name}. Catatan: {$request->input('review_notes')}");

        return response()->json([
            'success' => true,
            'data' => new MediaResource($media->fresh(['department', 'uploader', 'category', 'approver', 'files'])),
            'message' => 'Media ditolak (Unapproved) dengan catatan review'
        ], 200);
    }

    public function forceDelete(Request $request, $id)
    {
        $media = Media::onlyTrashed()->findOrFail($id);

        if ($request->user()->role->name !== 'SUPERADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        MediaService::forceDelete($media);
        ActivityLogService::log('PERMANENT_DELETE_MEDIA', null, "Permanent delete media: {$media->title}");

        return response()->json([
            'success' => true,
            'message' => 'Media berhasil dihapus permanen'
        ], 200);
    }
}