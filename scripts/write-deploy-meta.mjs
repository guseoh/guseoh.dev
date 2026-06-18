import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const outputPath = path.join(process.cwd(), "dist", "deploy-meta.json");
const sha = await getCheckedOutSha();

const metadata = {
  sha,
  runId: process.env.GITHUB_RUN_ID ?? "",
  builtAt: new Date().toISOString()
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

console.log(`Wrote deploy metadata for ${sha} to ${outputPath}`);

async function getCheckedOutSha() {
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8"
  });

  return stdout.trim();
}
