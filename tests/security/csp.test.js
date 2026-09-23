import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Content Security Policy (vercel.json)', () => {
    const vercelConfig = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf-8')
    );

    const headerEntries = vercelConfig.headers?.[0]?.headers || [];
    const cspHeader = headerEntries.find(h => h.key.toLowerCase() === 'content-security-policy');

    it('has a Content-Security-Policy header', () => {
        expect(cspHeader).toBeDefined();
    });

    it('includes default-src directive', () => {
        expect(cspHeader?.value).toContain("default-src 'self'");
    });

    it('restricts object-src to none', () => {
        expect(cspHeader?.value).toContain("object-src 'none'");
    });

    it('restricts base-uri to self', () => {
        expect(cspHeader?.value).toContain("base-uri 'self'");
    });

    it('allows Stripe in script-src', () => {
        expect(cspHeader?.value).toContain('https://js.stripe.com');
    });

    it('allows Google Fonts in font-src', () => {
        expect(cspHeader?.value).toContain('https://fonts.gstatic.com');
    });

    it('allows Stripe in frame-src', () => {
        expect(cspHeader?.value).toContain('frame-src');
        expect(cspHeader?.value).toContain('https://js.stripe.com');
    });
});
