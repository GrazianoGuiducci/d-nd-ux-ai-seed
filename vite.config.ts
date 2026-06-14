import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: mode === 'lib' ? false : 'public',
  build:
    mode === 'lib'
      ? {
          lib: {
            entry: 'src/index.ts',
            name: 'DndUxAiSeed',
            fileName: 'd-nd-ux-ai-seed',
            formats: ['es', 'umd'],
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'jsxRuntime',
              },
            },
          },
        }
      : undefined,
}));
