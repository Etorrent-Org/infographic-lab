import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const marketingWowRenderer = {
  name: "marketing-wow-renderer",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    const normalizedId = id.split("?", 1)[0].replace(/\\/g, "/");
    if (!normalizedId.endsWith("/src/MarketingStudio.tsx")) return null;
    return code.replace('from "./marketing"', 'from "./marketing-wow"');
  },
};

export default defineConfig({
  plugins: [marketingWowRenderer, react()],
  server: {
    host: "0.0.0.0",
    port: 3091,
  },
  preview: {
    host: "0.0.0.0",
    port: 3091,
  },
});
