import { defineConfig } from 'vite';

// host: true — доступ с телефона по адресу из локальной сети (Network: http://192.168.x.x:5173)
export default defineConfig({
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 4173 },
  build: { target: 'es2020' },
});
