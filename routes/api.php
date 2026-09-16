<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Master data
    Route::get('/departments', [MasterController::class, 'departments']);
    Route::post('/departments', [MasterController::class, 'storeDepartment']);
    Route::put('/departments/{id}', [MasterController::class, 'updateDepartment']);
    Route::delete('/departments/{id}', [MasterController::class, 'destroyDepartment']);

    Route::get('/roles', [MasterController::class, 'roles']);

    Route::get('/categories', [MasterController::class, 'categories']);
    Route::post('/categories', [MasterController::class, 'storeCategory']);
    Route::put('/categories/{id}', [MasterController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [MasterController::class, 'destroyCategory']);

    // Media
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);

    // Approval routes
    Route::post('/media/{id}/approve', [MediaController::class, 'approve']);
    Route::post('/media/{id}/unapprove', [MediaController::class, 'unapprove']);

    // Recycle bin (harus sebelum /media/{id} agar tidak bentrok)
    Route::get('/media/trash', [MediaController::class, 'trash']);
    Route::post('/media/{id}/restore', [MediaController::class, 'restore']);
    Route::delete('/media/{id}/force', [MediaController::class, 'forceDelete']);

    Route::get('/media/{id}', [MediaController::class, 'show']);
    Route::put('/media/{id}', [MediaController::class, 'update']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);
    Route::get('/media/{id}/download', [MediaController::class, 'download']);
    Route::get('/media/{id}/files/{fileId}/download', [MediaController::class, 'downloadFile']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/activate', [UserController::class, 'activate']);
    Route::post('/users/{id}/deactivate', [UserController::class, 'deactivate']);

    // Activity logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});