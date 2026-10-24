// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react(),
            tailwindcss()
        ],

        server: {
            port: Number(env.VITE_PORT),
            allowedHosts: [
                env.VITE_ALLOWED_HOST
            ],
            proxy: {
                "/api": {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
                "/socket.io": {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                    ws: true,
                }
            }
        }
    };
});
