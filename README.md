# Sistem Pengumpulan Media Kolektif

A web application for centralizing documentation (photos, videos, documents) across 13 departments.

## Tech Stack
- **Backend**: Laravel 12, MySQL, Sanctum (API Auth)
- **Frontend**: React 18, Vite, TailwindCSS
- **Storage**: Laravel Local/Public Storage

## Features
- **Department Isolation**: Users only see/manage their own department's media.
- **CORSEC Access**: Corporate Secretary role can view and download media from all departments.
- **Superadmin**: Full user management, master data control, activity logs, and recycle bin (restore/force delete).
- **Activity Log**: Automatic logging for uploads, updates, deletes, downloads, and user management.
- **Responsive UI**: Modern dashboard with previews for images and videos.

## Requirements
- PHP ^8.2
- Node.js & NPM
- MySQL

## Installation

1. **Clone the project**
2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```
3. **Configuration**
   - Copy `.env.example` to `.env`
   - Set database credentials (MySQL)
   - Run `php artisan key:generate`
4. **Database Setup**
   ```bash
   php artisan migrate --seed
   ```
5. **Storage Setup**
   ```bash
   php artisan storage:link
   ```

## Running the Application

1. **Start Backend**
   ```bash
   php artisan serve
   ```
2. **Start Frontend**
   ```bash
   npm run dev
   ```

## Default Credentials
- **Superadmin**: `superadmin@example.com` / `password123`
- **CORSEC**: `corsec@example.com` / `password123`
- **User (QHSE)**: `user@example.com` / `password123`

## Project Structure
- `app/Http/Controllers/Api`: API Controllers
- `app/Services`: Business logic (Media, User, Auth, Activity)
- `resources/js`: React frontend
- `resources/js/pages`: Page components
- `resources/js/contexts`: Auth and Toast contexts
- `storage/app/public/media`: Uploaded file directory
