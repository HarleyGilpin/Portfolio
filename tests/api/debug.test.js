import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Debug endpoint removal', () => {
    it('debug-last-order.js should NOT exist', () => {
        const debugPath = path.resolve(__dirname, '../../api/debug-last-order.js');
        expect(fs.existsSync(debugPath)).toBe(false);
    });
});
