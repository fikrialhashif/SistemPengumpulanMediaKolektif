<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'master_media_categories';
    protected $fillable = ['name', 'description', 'status'];

    public function media()
    {
        return $this->hasMany(Media::class);
    }
}
