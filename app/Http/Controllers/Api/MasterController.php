<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\RoleResource;
use App\Models\Category;
use App\Models\Department;
use App\Models\Role;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class MasterController extends Controller
{
    public function departments()
    {
        return response()->json([
            'success' => true,
            'data' => DepartmentResource::collection(Department::orderBy('name')->get())
        ], 200);
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:master_departments,code',
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ]);

        $department = Department::create($validated);
        ActivityLogService::log('CREATE_DEPARTMENT', null, "Menambahkan departemen {$department->name}");

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil ditambahkan',
            'data' => new DepartmentResource($department)
        ], 201);
    }

    public function updateDepartment(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:master_departments,code,' . $id,
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ]);

        $department->update($validated);
        ActivityLogService::log('UPDATE_DEPARTMENT', null, "Mengubah departemen {$department->name}");

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil diperbarui',
            'data' => new DepartmentResource($department)
        ], 200);
    }

    public function destroyDepartment($id)
    {
        $department = Department::findOrFail($id);

        \App\Models\Media::where('department_id', $department->id)->update(['department_id' => null]);
        \App\Models\User::where('department_id', $department->id)->update(['department_id' => null]);

        $department->delete();
        ActivityLogService::log('DELETE_DEPARTMENT', null, "Menghapus departemen {$department->name}");

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil dihapus'
        ], 200);
    }

    public function roles()
    {
        return response()->json([
            'success' => true,
            'data' => RoleResource::collection(Role::orderBy('name')->get())
        ], 200);
    }

    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection(Category::orderBy('name')->get())
        ], 200);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ]);

        $category = Category::create($validated);
        ActivityLogService::log('CREATE_CATEGORY', null, "Menambahkan kategori {$category->name}");

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data' => new CategoryResource($category)
        ], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ]);

        $category->update($validated);
        ActivityLogService::log('UPDATE_CATEGORY', null, "Mengubah kategori {$category->name}");

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => new CategoryResource($category)
        ], 200);
    }

    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);

        \App\Models\Media::where('category_id', $category->id)->update(['category_id' => null]);

        $category->delete();
        ActivityLogService::log('DELETE_CATEGORY', null, "Menghapus kategori {$category->name}");

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus'
        ], 200);
    }
}