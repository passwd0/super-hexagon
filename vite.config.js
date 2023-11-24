import { defineConfig } from 'vite'

/** @type {import('vite').UserConfig} */
export default defineConfig({
    // ... other configurations ...
    assetsInclude: ['**/*.mp3'],
    build: {
        assetsDir: 'sounds', // set the directory name for assets
        rollupOptions: {
            // additional Rollup options
        }
    }
})
