import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables for server-side API middleware
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of Object.keys(env)) {
    if (!process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [
      react(),
      {
        name: "sicms-api-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith("/api")) {
              try {
                const { handleApiRequest } = await server.ssrLoadModule("/src/server/apiRouter.ts");
                await handleApiRequest(req, res);
              } catch (err) {
                console.error("Vite API Server Error:", err);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      error: err instanceof Error ? err.message : "Internal Server Error",
                    })
                  );
                }
              }
            } else {
              next();
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});
