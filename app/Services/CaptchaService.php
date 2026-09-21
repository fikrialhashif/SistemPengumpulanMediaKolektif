<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CaptchaService
{
    /**
     * Generate a new captcha code, SVG image, and cache key.
     */
    public static function generate(): array
    {
        // Karakter mudah dibaca, hindari karakter ambigu (0, O, 1, I, L)
        $characters = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 5; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        $key = (string) Str::uuid();

        // Simpan dalam cache selama 5 menit
        Cache::put("captcha:{$key}", strtolower($code), now()->addMinutes(5));

        $svg = self::renderSvg($code);

        return [
            'captcha_key' => $key,
            'captcha_svg' => $svg,
        ];
    }

    /**
     * Validate captcha and invalidate key immediately.
     */
    public static function validate(?string $key, ?string $userInput): bool
    {
        if (empty($key) || empty($userInput)) {
            return false;
        }

        $cacheKey = "captcha:{$key}";
        $expected = Cache::get($cacheKey);

        // Langsung hapus setelah diperiksa (one-time use untuk cegah brute force / replay attack)
        Cache::forget($cacheKey);

        if (!$expected) {
            return false;
        }

        return hash_equals($expected, strtolower(trim($userInput)));
    }

    /**
     * Render SVG representation of the captcha.
     */
    private static function renderSvg(string $code): string
    {
        $width = 160;
        $height = 48;

        $colors = ['#047857', '#0f766e', '#1e293b', '#0369a1', '#15803d', '#334155'];

        $elements = [];

        // Garis-garis noise latar belakang
        for ($i = 0; $i < 4; $i++) {
            $x1 = random_int(5, $width - 5);
            $y1 = random_int(5, $height - 5);
            $x2 = random_int(5, $width - 5);
            $y2 = random_int(5, $height - 5);
            $c = $colors[array_rand($colors)];
            $elements[] = "<line x1=\"{$x1}\" y1=\"{$y1}\" x2=\"{$x2}\" y2=\"{$y2}\" stroke=\"{$c}\" stroke-width=\"1.5\" stroke-opacity=\"0.35\" />";
        }

        // Titik-titik noise
        for ($i = 0; $i < 24; $i++) {
            $cx = random_int(4, $width - 4);
            $cy = random_int(4, $height - 4);
            $r = random_int(1, 2);
            $c = $colors[array_rand($colors)];
            $elements[] = "<circle cx=\"{$cx}\" cy=\"{$cy}\" r=\"{$r}\" fill=\"{$c}\" fill-opacity=\"0.3\" />";
        }

        // Karakter teks
        $len = strlen($code);
        $charWidth = ($width - 30) / $len;

        for ($i = 0; $i < $len; $i++) {
            $char = $code[$i];
            $x = 16 + ($i * $charWidth) + random_int(-2, 3);
            $y = 33 + random_int(-3, 3);
            $rotation = random_int(-18, 18);
            $fontSize = random_int(22, 26);
            $color = $colors[array_rand($colors)];

            $elements[] = "<text x=\"{$x}\" y=\"{$y}\" font-family=\"monospace, sans-serif\" font-size=\"{$fontSize}\" font-weight=\"bold\" fill=\"{$color}\" transform=\"rotate({$rotation} {$x} {$y})\">{$char}</text>";
        }

        // Garis gelombang distorsi depan
        $midY = $height / 2;
        $d = "M 5 " . random_int(15, 35) . " Q " . ($width / 2) . " " . random_int(10, 40) . " " . ($width - 5) . " " . random_int(15, 35);
        $elements[] = "<path d=\"{$d}\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"1.5\" stroke-opacity=\"0.5\" />";

        $inner = implode("\n", $elements);

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {$width} {$height}\" width=\"{$width}\" height=\"{$height}\" class=\"rounded-xl select-none bg-emerald-50/70 border border-emerald-200\">\n{$inner}\n</svg>";
    }
}
