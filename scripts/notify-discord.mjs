const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

if (!webhookUrl) {
  console.log("DISCORD_WEBHOOK_URL is not configured; skipping Discord notification.");
  process.exit(0);
}

const repository = process.env.REPOSITORY ?? "guseoh/guseoh.github.io";
const branch = process.env.BRANCH ?? "main";
const refreshStatus = process.env.REFRESH_STATUS ?? "unknown";
const source = process.env.REFRESH_SOURCE ?? "unknown";
const detail = process.env.REFRESH_DETAIL?.trim();
const changed = process.env.DATA_CHANGED === "true";
const committed = process.env.COMMITTED === "true";
const commitHash = process.env.COMMIT_HASH?.trim();
const deployOutcome = process.env.DEPLOY_OUTCOME ?? "skipped";
const jobStatus = process.env.JOB_STATUS ?? "unknown";
const runUrl = process.env.RUN_URL ?? "";
const time = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  dateStyle: "medium",
  timeStyle: "medium"
}).format(new Date());

const messages = [];

if (refreshStatus === "degraded") {
  messages.push([
    "[ALERT] GitHub Activity refresh degraded",
    "",
    `Repository: ${repository}`,
    `Branch: ${branch}`,
    `Result: ${source === "existing" ? "existing JSON was preserved" : "empty fallback data was used"}`,
    "Action: check token, GitHub API, or public HTML parser.",
    detail ? `Detail: ${detail}` : undefined,
    `Time: ${time}`
  ]);
} else if (refreshStatus === "fallback") {
  messages.push([
    "[WARNING] GitHub Activity fallback used",
    "",
    `Repository: ${repository}`,
    `Branch: ${branch}`,
    "Result: GraphQL failed, public HTML fallback was used",
    `Data changed: ${changed ? "yes" : "no"}`,
    committed && commitHash ? `Commit: ${commitHash}` : undefined,
    `Time: ${time}`
  ]);
} else if (committed) {
  messages.push([
    "[SUCCESS] GitHub Activity updated",
    "",
    `Repository: ${repository}`,
    `Branch: ${branch}`,
    "Result: contribution JSON changed and committed",
    commitHash ? `Commit: ${commitHash}` : undefined,
    `Deploy: ${deployOutcome === "success" ? "dispatch requested" : deployOutcome}`,
    `Time: ${time}`
  ]);
} else if (jobStatus !== "failure") {
  messages.push([
    "[INFO] GitHub Activity checked",
    "",
    `Repository: ${repository}`,
    `Branch: ${branch}`,
    "Result: no contribution changes",
    `Source: ${source}`,
    `Time: ${time}`
  ]);
}

if (deployOutcome === "failure") {
  messages.push([
    "[ALERT] GitHub Activity deploy dispatch failed",
    "",
    `Repository: ${repository}`,
    "Result: contribution JSON changed, but deploy workflow dispatch failed",
    runUrl ? `Run: ${runUrl}` : undefined,
    `Time: ${time}`
  ]);
}

if (jobStatus === "failure") {
  messages.push([
    "[ALERT] GitHub Activity workflow failed",
    "",
    `Repository: ${repository}`,
    "Workflow: Update GitHub Activity",
    runUrl ? `Run: ${runUrl}` : undefined,
    `Time: ${time}`
  ]);
}

for (const lines of messages) {
  const content = lines.filter(Boolean).join("\n");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
}

console.log(`Sent ${messages.length} Discord notification(s).`);
