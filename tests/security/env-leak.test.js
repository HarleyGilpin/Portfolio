import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Client bundle secret leak detection', () => {
    const buildClientDir = path.resolve(__dirname, '../../build/client');

    // Known secret patterns to scan for
    const SECRET_PATTERNS = [
        // Stripe secret keys
        /sk_test_[a-zA-Z0-9]{20,}/,
        /sk_live_[a-zA-Z0-9]{20,}/,
        // Webhook secrets
        /whsec_[a-zA-Z0-9]{20,}/,
        // Vercel blob tokens
        /vercel_blob_rw_[a-zA-Z0-9]{20,}/,
        // Linear API keys
        /lin_api_[a-zA-Z0-9]{20,}/,
        // Postgres connection strings
        /postgres:\/\/[^'"\s]{20,}/,
    ];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return [];
        const results = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...scanDirectory(fullPath));
            } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                for (const pattern of SECRET_PATTERNS) {
                    const match = content.match(pattern);
                    if (match) {
                        results.push({
                            file: path.relative(buildClientDir, fullPath),
                            pattern: pattern.source,
                            match: match[0].substring(0, 20) + '...',
                        });
                    }
                }
            }
        }
        return results;
    }

    it('should not contain secret keys in client bundle', () => {
        if (!fs.existsSync(buildClientDir)) {
            // Build hasn't been run yet — skip gracefully
            console.warn('Skipping: build/client directory not found. Run `npm run build` first.');
            return;
        }

        const leaks = scanDirectory(buildClientDir);

        if (leaks.length > 0) {
            const report = leaks.map(l => `  ${l.file}: matched ${l.pattern} → "${l.match}"`).join('\n');
            expect.fail(`Secrets detected in client bundle:\n${report}`);
        }
    });
});
