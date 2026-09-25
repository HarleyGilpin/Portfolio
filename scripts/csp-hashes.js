/**
 * Post-build: inject a strict script-src CSP <meta> into every prerendered page.
 *
 * React Router's prerendered HTML contains inline <script> blocks (hydration
 * context, scroll restoration), which is why the header CSP in vercel.json needs
 * 'unsafe-inline'. This script hashes each page's inline scripts and adds a
 * <meta http-equiv="Content-Security-Policy"> allowing only those hashes.
 * Browsers enforce every CSP they receive, so the stricter meta policy wins
 * and injected inline scripts are blocked.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const BUILD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../build/client');

// Must stay in sync with script-src in vercel.json (minus 'unsafe-inline')
const SCRIPT_SOURCES = ["'self'", 'https://js.stripe.com'];

const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
const EXISTING_META = /<meta http-equiv="Content-Security-Policy"[^>]*>/i;
const INLINE_HANDLER = /<[^>]+\son[a-z]+\s*=/i;

export function hashInlineScripts(html) {
    const hashes = new Set();
    for (const [, content] of html.matchAll(INLINE_SCRIPT)) {
        if (!content) continue;
        hashes.add(`'sha256-${crypto.createHash('sha256').update(content, 'utf8').digest('base64')}'`);
    }
    return [...hashes];
}

export function injectCsp(html) {
    if (INLINE_HANDLER.test(html)) {
        // Hashes don't cover inline event handlers; fail loudly rather than ship a broken page
        throw new Error('Inline event handler found; strict CSP would block it');
    }

    const policy = `script-src ${[...SCRIPT_SOURCES, ...hashInlineScripts(html)].join(' ')}`;
    const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;
    const withoutOld = html.replace(EXISTING_META, '');

    // Place it right after the charset declaration (or <head>) so it precedes every script
    const charset = withoutOld.match(/<meta charset[^>]*>/i);
    if (charset) {
        return withoutOld.replace(charset[0], `${charset[0]}${meta}`);
    }
    if (/<head[^>]*>/i.test(withoutOld)) {
        return withoutOld.replace(/<head[^>]*>/i, (head) => `${head}${meta}`);
    }
    throw new Error('No <head> found');
}

function findHtmlFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return findHtmlFiles(full);
        return entry.name.endsWith('.html') ? [full] : [];
    });
}

function main() {
    const files = findHtmlFiles(BUILD_DIR);
    if (files.length === 0) {
        throw new Error(`No HTML files found in ${BUILD_DIR}`);
    }

    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        try {
            fs.writeFileSync(file, injectCsp(html));
        } catch (error) {
            throw new Error(`${path.relative(BUILD_DIR, file)}: ${error.message}`);
        }
    }
    console.log(`CSP: injected script hashes into ${files.length} HTML files`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
