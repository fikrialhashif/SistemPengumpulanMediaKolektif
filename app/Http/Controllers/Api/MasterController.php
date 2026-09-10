<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\RoleResource;
use App\Models\Category;
use App\Models\Department;
use App\Models\Role;
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
}