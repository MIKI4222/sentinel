import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [react()], build: { rolldownOptions: { output: { codeSplitting: { groups: [
  { name: 'genlayer', test: /node_modules[\\/](genlayer-js|viem|abitype|ox)[\\/]/ },
] } } } } });
