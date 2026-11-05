// Local dev orchestrator: builds and runs the API, then starts the Vite dev server.
// Cross-platform: spawns node binaries directly (no npx/shell quoting issues on Windows);
// Ctrl-C stops all processes.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (args) => spawn(process.execPath, args, { stdio: "inherit", cwd: root });

const build = run([path.join(root, "node_modules/typescript/lib/tsc.js"), "-p", path.join(root, "tsconfig.build.json")]);
build.on("exit", (code) => {
  if (code) process.exit(code);

  const api = run([path.join(root, "dist/apps/api/src/index.js")]);
  const web = run([path.join(root, "node_modules/vite/bin/vite.js"), "apps/web"]);
  let stopping = false;
  const stopAll = (exitCode) => {
    if (stopping) return;
    stopping = true;
    api.kill();
    web.kill();
    process.exit(exitCode);
  };
  process.on("SIGINT", () => stopAll(0));
  process.on("SIGTERM", () => stopAll(0));
  api.on("exit", (c) => stopAll(c ?? 0));
  web.on("exit", (c) => stopAll(c ?? 0));
});
