<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['code' => 'FINANCE_ICT', 'name' => 'FINANCE & ICT'],
            ['code' => 'EKS', 'name' => 'EKS'],
            ['code' => 'EPT', 'name' => 'EPT'],
            ['code' => 'PRODUCTION_OPERATION', 'name' => 'PRODUCTION OPERATION'],
            ['code' => 'DWO', 'name' => 'DWO'],
            ['code' => 'QHSE', 'name' => 'QHSE'],
            ['code' => 'HCM', 'name' => 'HCM'],
            ['code' => 'SCM', 'name' => 'SCM'],
            ['code' => 'OPERATION_SUPPORT', 'name' => 'OPERATION SUPPORT'],
            ['code' => 'CORSEC', 'name' => 'CORSEC'],
            ['code' => 'EA', 'name' => 'EA'],
            ['code' => 'SPRM', 'name' => 'SPRM'],
            ['code' => 'IA', 'name' => 'IA'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['code' => $dept['code']], ['name' => $dept['name'], 'status' => 'ACTIVE']);
        }

        $roles = [
            ['name' => 'USER', 'description' => 'Department User'],
            ['name' => 'MANAGER', 'description' => 'Department Manager - approves media'],
            ['name' => 'CORSEC', 'description' => 'Corporate Secretary'],
            ['name' => 'SUPERADMIN', 'description' => 'Super Administrator'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], ['description' => $role['description'], 'status' => 'ACTIVE']);
        }

        $categories = [
            'Kegiatan', 'Rapat', 'Event', 'Training', 'Workshop', 'Dokumentasi Lapangan', 'Sosialisasi', 'Lainnya'
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat], ['description' => $cat, 'status' => 'ACTIVE']);
        }

        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'department_id' => Department::where('code', 'CORSEC')->value('id'),
                'role_id' => Role::where('name', 'SUPERADMIN')->value('id'),
                'status' => 'ACTIVE',
            ]
        );

        $corsec = User::firstOrCreate(
            ['email' => 'corsec@example.com'],
            [
                'name' => 'CORSEC User',
                'password' => Hash::make('password123'),
                'department_id' => Department::where('code', 'CORSEC')->value('id'),
                'role_id' => Role::where('name', 'CORSEC')->value('id'),
                'status' => 'ACTIVE',
            ]
        );

        // Manager untuk setiap departemen (hanya 1 akun per departemen)
        $managerRole = Role::where('name', 'MANAGER')->first();
        foreach ($departments as $dept) {
            $deptModel = Department::where('code', $dept['code'])->first();
            if ($deptModel) {
                $emailSlug = strtolower(str_replace('_', '.', $dept['code']));
                User::firstOrCreate(
                    ['email' => "manager.{$emailSlug}@example.com"],
                    [
                        'name' => "Manager {$dept['name']}",
                        'password' => Hash::make('password123'),
                        'department_id' => $deptModel->id,
                        'role_id' => $managerRole->id,
                        'status' => 'ACTIVE',
                    ]
                );
            }
        }

        // Akun manager umum untuk tes cepat
        User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Manager QHSE',
                'password' => Hash::make('password123'),
                'department_id' => Department::where('code', 'QHSE')->value('id'),
                'role_id' => $managerRole->id,
                'status' => 'ACTIVE',
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'QHSE User',
                'password' => Hash::make('password123'),
                'department_id' => Department::where('code', 'QHSE')->value('id'),
                'role_id' => Role::where('name', 'USER')->value('id'),
                'status' => 'ACTIVE',
            ]
        );
    }
}
