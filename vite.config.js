import { defineConfig } from 'vite';
import pushDev from './tools/push-dev-plugin.mjs';

// Режимы:
//   npm run dev         — обычный запуск, телефон открывает http://<IP компьютера>:5173 в локальной сети;
//   npm run dev:tunnel  — для теста push: страницу открывают по HTTPS через туннель (см. docs-src/push-test.md).
export default defineConfig(({ mode }) => ({
  server: {
    host: true,                 // доступ с телефона по IP из локальной сети
    port: 5173,
    strictPort: true,
    allowedHosts: true,         // Vite 7 по умолчанию отвергает чужие имена хоста; туннель даёт адрес вида *.trycloudflare.com
    // За туннелем страница открыта по https://…:443, а HMR (живая перезагрузка) по умолчанию стучится на :5173.
    hmr: mode === 'tunnel' ? { protocol: 'wss', clientPort: 443 } : undefined,
  },
  preview: { host: true, port: 4173 },
  build: { target: 'es2020' },
  plugins: [pushDev()],         // dev-заглушка отправки push; в сборку не попадает (apply: 'serve')
}));
