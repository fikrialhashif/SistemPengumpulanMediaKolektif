<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['category_id']);
        });

        Schema::table('media', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->change();
            $table->unsignedBigInteger('category_id')->nullable()->change();

            $table->foreign('department_id')->references('id')->on('master_departments')->nullOnDelete();
            $table->foreign('category_id')->references('id')->on('master_media_categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['category_id']);
        });

        Schema::table('media', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable(false)->change();
            $table->unsignedBigInteger('category_id')->nullable(false)->change();

            $table->foreign('department_id')->references('id')->on('master_departments')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('master_media_categories')->onDelete('cascade');
        });
    }
};
