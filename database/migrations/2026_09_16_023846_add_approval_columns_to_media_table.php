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
            $table->enum('approval_status', ['PENDING', 'APPROVED', 'UNAPPROVED'])->default('PENDING')->after('file_size');
            $table->text('review_notes')->nullable()->after('approval_status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('review_notes');
            $table->timestamp('approved_at')->nullable()->after('approved_by');

            $table->index('approval_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['approval_status', 'review_notes', 'approved_by', 'approved_at']);
        });
    }
};
