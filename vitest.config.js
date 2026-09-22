import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/**/*.test.{js,ts}'],
        alias: {
            '@': path.resolve(__dirname, './app'),
        },
    },
});
