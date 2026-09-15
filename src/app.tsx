import { Hono } from "hono";
import { readFileSync, existsSync } from "fs";
import { App, type PRData, timeAgo, PullRequestIcon } from "./components";

const app = new Hono();

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

app.get("/", (c) => {
  const data = loadPRsData();

  return c.html(
    <html lang="en">
      <head>
        <title>
          {data ? `${data.user_name}'s Contributions` : "My Contributions"}
        </title>
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
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js"></script>
        ) : (
          <script type="module" src="/src/client.tsx"></script>
        )}
      </head>
      <body>
        <div id="root">
          <App data={data} />
        </div>
      </body>
    </html>
  );
});

export default app;