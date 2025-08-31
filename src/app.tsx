import { Hono } from "hono";
import { readFileSync, existsSync } from "fs";

const app = new Hono();

interface PR {
  repo: string;
  title: string;
  url: string;
  created_at: string;
  state: "merged" | "closed" | "open";
  number: number;
}

interface PRData {
  user: string;
  user_name: string;
  avatar: string;
  fetched_at: string;
  total_count: number;
  prs: PR[];
}

function loadPRsData(): PRData | null {
  try {
    const path = "data/prs.json";
    if (!existsSync(path)) {
      console.log("data/prs.json not found.");
      return null;
    }
    const data = readFileSync(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading or parsing prs.json:", error);
    return null;
  }
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [intervalName, seconds] of Object.entries(intervals)) {
    const intervalCount = Math.floor(diffInSeconds / seconds);
    if (intervalCount >= 1) {
      return `${intervalCount} ${intervalName}${intervalCount > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

const PullRequestIcon = ({ state }: { state: PR["state"] }) => {
  const color = {
    open: "#2da44e", // green
    merged: "#8250df", // purple
    closed: "#cf222e", // red
  }[state];

  return (
    <svg
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
      height="16"
      aria-hidden="true"
      style={{ fill: color, marginRight: "8px", verticalAlign: "text-bottom" }}
    >
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.434a.75.75 0 0 1 .612.865l-.621 2.483a.75.75 0 0 1-1.484-.37l.621-2.483a.75.75 0 0 1 .872-.495ZM11.5 3.25a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm-3.25.75a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 0 1.5 0Z"></path>
      <path d="M14.25 5.372a2.25 2.25 0 0 1-1.5-2.122v-.002a2.25 2.25 0 0 1 1.5 2.122Z"></path>
    </svg>
  );
};

app.get("/", (c) => {
  const data = loadPRsData();

  return c.html(
    <html lang="en">
      <head>
        <title>{data ? `${data.user_name}'s Contributions` : "My Contributions"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          :root {
            --color-bg: #0d1117;
            --color-text: #c9d1d9;
            --color-text-secondary: #8b949e;
            --color-border: #30363d;
            --color-link: #58a6ff;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            line-height: 1.5;
            background-color: var(--color-bg);
            color: var(--color-text);
          }
          a {
            color: inherit;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
            color: var(--color-link);
          }
          .container {
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
          }
          .header-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
          }
          .header-info h1 {
            font-size: 24px;
            font-weight: 600;
          }
          .header-info p {
            color: var(--color-text-secondary);
            font-size: 14px;
          }
          .pr-list {
            border-top: 1px solid var(--color-border);
            padding-top: 24px;
            margin-top: 24px;
          }
          .pr-item {
            display: flex;
            gap: 16px;
            padding: 12px 8px;
            border-bottom: 1px solid var(--color-border);
          }
          .pr-item:last-child {
            border-bottom: none;
          }
          .repo-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-top: 2px;
          }
          .pr-details {
            flex-grow: 1;
          }
          .pr-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .pr-repo {
            font-size: 14px;
            color: var(--color-text-secondary);
          }
          .pr-meta {
            min-width: 100px;
            text-align: right;
            font-size: 14px;
            color: var(--color-text-secondary);
          }
          .pr-meta span {
            display: block;
          }
          .pr-meta .pr-date {
            font-size: 12px;
          }
          .no-prs {
            text-align: center;
            padding: 40px;
            border: 1px solid var(--color-border);
            border-radius: 6px;
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          {data ? (
            <>
              <header class="header">
                <img src={data.avatar} alt="User avatar" class="header-avatar" />
                <div class="header-info">
                  <h1>{data.user_name} is Contributing...</h1>
                  <p>{data.user}'s recent pull requests on GitHub</p>
                </div>
              </header>

              <main class="pr-list">
                {data.prs.map((pr) => (
                  <article class="pr-item">
                    <a href={`https://github.com/${pr.repo.split('/')[0]}`} target="_blank" rel="noopener noreferrer">
                      <img src={`https://github.com/${pr.repo.split('/')[0]}.png`} alt="Repository owner avatar" class="repo-avatar" />
                    </a>
                    <div class="pr-details">
                      <div class="pr-title">
                        <a href={pr.url} target="_blank" rel="noopener noreferrer">
                          <PullRequestIcon state={pr.state} />
                          {pr.title}
                        </a>
                      </div>
                      <div class="pr-repo">
                        {pr.repo}
                      </div>
                    </div>
                    <div class="pr-meta">
                      <a href={pr.url} target="_blank" rel="noopener noreferrer">
                        <span class="pr-number">#{pr.number}</span>
                        <span class="pr-date">{timeAgo(pr.created_at)}</span>
                      </a>
                    </div>
                  </article>
                ))}
              </main>
            </>
          ) : (
            <div class="no-prs">
              <h2>No pull request data found</h2>
              <p>Run the fetch script or check the data/prs.json file.</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
});

export default app;