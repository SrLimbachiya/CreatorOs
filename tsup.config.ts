import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main/main.ts", "src/main/preload.ts"],
  format: ["cjs"],
  target: "node20",
  clean: true,
  minify: false,
  sourcemap: true,
  external: ["electron", "@libsql/client"],
  outDir: "dist/main",
  tsconfig: "tsconfig.main.json",
});
