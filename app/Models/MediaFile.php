<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaFile extends Model
{
    protected $fillable = [
        'media_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}
