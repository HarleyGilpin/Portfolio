import { describe, it, expect, afterEach } from 'vitest';
import { validateOrigin } from '../../api/_utils/csrf.js';

const post = (origin) => ({ method: 'POST', headers: { origin } });

describe('validateOrigin', () => {
    afterEach(() => {
        delete process.env.VERCEL_ENV;
    });

    it('allows the production origin', () => {
        expect(validateOrigin(post('https://harleygilpin.com')).valid).toBe(true);
    });

    it('rejects foreign origins', () => {
        expect(validateOrigin(post('https://evil.example')).valid).toBe(false);
    });

    it('rejects requests with no origin or referer', () => {
        expect(validateOrigin({ method: 'POST', headers: {} }).valid).toBe(false);
    });

    it('allows localhost outside production', () => {
        expect(validateOrigin(post('http://localhost:5173')).valid).toBe(true);
    });

    it('rejects localhost in production', () => {
        process.env.VERCEL_ENV = 'production';
        expect(validateOrigin(post('http://localhost:5173')).valid).toBe(false);
        expect(validateOrigin(post('http://127.0.0.1:3000')).valid).toBe(false);
    });
});
