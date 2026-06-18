const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

if (!webhookUrl) {
  console.log(
    "DISCORD_WEBHOOK_URL이 설정되지 않아 Discord 알림을 생략합니다."
  );
  process.exit(0);
}

const serverUrl = process.env.SERVER_URL?.trim() || "https://github.com";
const repository =
  process.env.REPOSITORY?.trim() || "guseoh/guseoh.github.io";
const branch = process.env.BRANCH?.trim() || "main";

const refreshStatus =
  process.env.REFRESH_STATUS?.trim() || "unknown";
const refreshSource =
  process.env.REFRESH_SOURCE?.trim() || "unknown";
const refreshDetail = process.env.REFRESH_DETAIL?.trim();

const dataChanged = process.env.DATA_CHANGED === "true";
const committed = process.env.COMMITTED === "true";
const commitHash = process.env.COMMIT_HASH?.trim();

const deployOutcome =
  process.env.DEPLOY_OUTCOME?.trim() || "skipped";
const deployRunId = process.env.DEPLOY_RUN_ID?.trim();
const deployRunUrl = process.env.DEPLOY_RUN_URL?.trim();
const deployHeadSha = process.env.DEPLOY_HEAD_SHA?.trim();

const jobStatus = process.env.JOB_STATUS?.trim() || "unknown";
const workflowRunUrl = process.env.WORKFLOW_RUN_URL?.trim();

const repositoryUrl = `${serverUrl}/${repository}`;
const branchUrl = `${repositoryUrl}/tree/${encodeURIComponent(branch)}`;
const commitUrl = commitHash
  ? `${repositoryUrl}/commit/${commitHash}`
  : undefined;

const shortCommitHash = commitHash?.slice(0, 7);
const shortDeployHeadSha = deployHeadSha?.slice(0, 7);

const executedAt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
}).format(new Date());

const COLORS = {
  success: 0x2ecc71,
  info: 0x3498db,
  warning: 0xf1c40f,
  error: 0xe74c3c
};

function truncate(value, maximumLength = 1000) {
  if (!value) {
    return undefined;
  }

  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 3)}...`;
}

function createField(name, value, inline = true) {
  return {
    name,
    value: value || "-",
    inline
  };
}

function getSourceLabel(source) {
  const sourceLabels = {
    graphql: "GitHub GraphQL API",
    api: "GitHub API",
    html: "GitHub 공개 페이지",
    public: "GitHub 공개 페이지",
    "public-html": "GitHub 공개 페이지",
    fallback: "GitHub 공개 페이지",
    existing: "기존 JSON 데이터",
    empty: "빈 대체 데이터",
    unknown: "확인 필요"
  };

  return sourceLabels[source] || source;
}

function getDataStatus() {
  if (committed) {
    return "✅ 변경됨 · 자동 커밋 완료";
  }

  if (dataChanged) {
    return "⚠️ 변경 감지 · 커밋 확인 필요";
  }

  return "➖ 변경 없음";
}

function getDeployStatus() {
  switch (deployOutcome) {
    case "success":
      return "✅ 실행 요청 완료";

    case "failure":
      return "❌ 실행 요청 실패";

    case "cancelled":
      return "⚠️ 실행 요청 취소";

    case "skipped":
      return "➖ 배포 생략";

    default:
      return `⚠️ ${deployOutcome}`;
  }
}

function getNotification() {
  if (refreshStatus === "degraded") {
    const preservedExistingData = refreshSource === "existing";

    return {
      level: "error",
      title: "🚨 GitHub 활동 데이터 갱신 실패",
      description: preservedExistingData
        ? "GitHub 기여 데이터를 정상적으로 가져오지 못해 기존 JSON 데이터를 유지했습니다."
        : "GitHub 기여 데이터를 정상적으로 가져오지 못해 대체 데이터를 사용했습니다."
    };
  }

  if (deployOutcome === "failure") {
    return {
      level: "error",
      title: "🚨 GitHub 활동 배포 요청 실패",
      description:
        "기여 데이터 변경과 자동 커밋은 완료했지만 배포 워크플로 실행 요청에 실패했습니다."
    };
  }

  if (jobStatus === "failure") {
    return {
      level: "error",
      title: "🚨 GitHub Activity 워크플로 실패",
      description:
        "GitHub 활동 데이터 갱신 과정에서 처리되지 않은 오류가 발생했습니다."
    };
  }

  if (refreshStatus === "fallback") {
    return {
      level: "warning",
      title: "⚠️ GitHub 활동 데이터 대체 수집",
      description:
        "GitHub GraphQL API 수집에 실패하여 공개 GitHub 페이지를 통해 기여 데이터를 가져왔습니다."
    };
  }

  if (committed) {
    return {
      level: "success",
      title: "✅ GitHub 활동 데이터 업데이트 완료",
      description:
        "새로운 GitHub 기여 활동을 감지해 JSON 데이터를 자동 커밋했습니다. 최신 데이터를 반영하기 위한 배포 워크플로 실행도 요청했습니다."
    };
  }

  return {
    level: "info",
    title: "ℹ️ GitHub 활동 데이터 확인 완료",
    description:
      "GitHub 기여 데이터를 확인했지만 기존 데이터와 달라진 내용이 없어 커밋과 배포를 진행하지 않았습니다."
  };
}

const notification = getNotification();

const fields = [
  createField(
    "📦 저장소",
    `[${repository}](${repositoryUrl})`
  ),
  createField(
    "🌿 브랜치",
    `[\`${branch}\`](${branchUrl})`
  ),
  createField(
    "📊 데이터 상태",
    getDataStatus()
  ),
  createField(
    "🚀 배포 상태",
    getDeployStatus()
  ),
  createField(
    "🔎 데이터 출처",
    getSourceLabel(refreshSource)
  ),
  createField(
    "🕒 실행 시각",
    `${executedAt} KST`
  )
];

if (shortCommitHash && commitUrl) {
  fields.push(
    createField(
      "📝 자동 커밋",
      `[\`${shortCommitHash}\`](${commitUrl})`
    )
  );
}

if (shortDeployHeadSha) {
  fields.push(
    createField(
      "🎯 배포 대상",
      `\`${shortDeployHeadSha}\``
    )
  );
}

if (deployRunId) {
  fields.push(
    createField(
      "🆔 배포 실행 ID",
      `\`${deployRunId}\``
    )
  );
}

const links = [];

if (workflowRunUrl) {
  links.push(
    `[현재 워크플로 실행 결과](${workflowRunUrl})`
  );
}

if (deployRunUrl) {
  links.push(
    `[배포 워크플로 실행 결과](${deployRunUrl})`
  );
}

if (links.length > 0) {
  fields.push(
    createField(
      "🔗 바로가기",
      links.join(" · "),
      false
    )
  );
}

if (refreshDetail) {
  fields.push(
    createField(
      "📋 상세 내용",
      truncate(refreshDetail),
      false
    )
  );
}

const payload = {
  username: "GitHub Activity Bot",
  allowed_mentions: {
    parse: []
  },
  embeds: [
    {
      title: notification.title,
      url: workflowRunUrl || repositoryUrl,
      description: notification.description,
      color: COLORS[notification.level],
      fields,
      footer: {
        text: "guseoh.github.io · Update GitHub Activity"
      },
      timestamp: new Date().toISOString()
    }
  ]
};

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  const responseBody = await response.text();

  throw new Error(
    `Discord webhook 요청 실패: ${response.status} ${responseBody}`
  );
}

console.log(`Discord 알림 전송 완료: ${notification.title}`);
