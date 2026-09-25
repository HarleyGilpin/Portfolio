import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { hashInlineScripts, injectCsp } from '../../scripts/csp-hashes.js';

const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`;

const page = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><script src="/assets/app.js"></script><script>window.a=1</script></head><body><script type="module">import "/x.js";</script></body></html>`;

describe('CSP hash injection', () => {
    it('hashes only inline scripts', () => {
        expect(hashInlineScripts(page)).toEqual([sha('window.a=1'), sha('import "/x.js";')]);
    });

    it('injects a strict script-src meta before any script', () => {
        const out = injectCsp(page);
        const meta = out.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
        expect(meta).toContain(`script-src 'self' https://js.stripe.com ${sha('window.a=1')}`);
        expect(meta).not.toContain('unsafe-inline');
        expect(out.indexOf('http-equiv')).toBeLessThan(out.indexOf('<script'));
    });

    it('is idempotent when run twice', () => {
        const twice = injectCsp(injectCsp(page));
        expect(twice.match(/http-equiv="Content-Security-Policy"/g)).toHaveLength(1);
    });

    it('refuses pages with inline event handlers', () => {
        expect(() => injectCsp('<html><head></head><body><img onload="x()"></body></html>')).toThrow(/Inline event handler/);
    });
});
