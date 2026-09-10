<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->constrained('master_departments')->onDelete('set null');
            $table->foreignId('role_id')->nullable()->constrained('master_roles')->onDelete('set null');
            $table->string('status')->default('ACTIVE');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['role_id']);
            $table->dropColumn(['department_id', 'role_id', 'status']);
        });
    }
};
