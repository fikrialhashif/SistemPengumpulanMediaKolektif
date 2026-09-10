<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $table = 'master_departments';
    protected $fillable = ['code', 'name', 'status'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }
}
