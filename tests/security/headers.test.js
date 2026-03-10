import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security Headers (vercel.json)', () => {
    const vercelConfig = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf-8')
    );

    const headerEntries = vercelConfig.headers?.[0]?.headers || [];
    const headerKeys = headerEntries.map(h => h.key.toLowerCase());

    it('has Strict-Transport-Security header', () => {
        expect(headerKeys).toContain('strict-transport-security');
    });

    it('has X-Content-Type-Options header', () => {
        expect(headerKeys).toContain('x-content-type-options');
    });

    it('has X-Frame-Options header', () => {
        expect(headerKeys).toContain('x-frame-options');
    });

    it('has Referrer-Policy header', () => {
        expect(headerKeys).toContain('referrer-policy');
    });

    it('has Permissions-Policy header', () => {
        expect(headerKeys).toContain('permissions-policy');
    });

    it('HSTS max-age is at least 1 year', () => {
        const hsts = headerEntries.find(h => h.key.toLowerCase() === 'strict-transport-security');
        const maxAgeMatch = hsts?.value?.match(/max-age=(\d+)/);
        expect(maxAgeMatch).not.toBeNull();
        expect(parseInt(maxAgeMatch[1])).toBeGreaterThanOrEqual(31536000);
    });
});

describe('Environment variable safety', () => {
    it('.env does NOT contain VITE_ prefixed secrets', () => {
        const envPath = path.resolve(__dirname, '../../.env');
        if (!fs.existsSync(envPath)) return; // Skip in CI if .env not present

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));

        const viteSecrets = lines.filter(line => {
            const key = line.split('=')[0]?.trim();
            if (!key || !key.startsWith('VITE_')) return false;
            // VITE_ prefixed keys for public configs (like EmailJS public key) are OK
            // But passwords, secrets, and private keys should never be VITE_ prefixed
            const dangerousPatterns = ['PASSWORD', 'SECRET', 'PRIVATE', 'TOKEN', 'DATABASE', 'POSTGRES'];
            return dangerousPatterns.some(pattern => key.toUpperCase().includes(pattern));
        });

        expect(viteSecrets).toEqual([]);
    });
});
