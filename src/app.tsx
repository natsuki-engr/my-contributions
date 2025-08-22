import { Hono } from "hono";
import { readFileSync, existsSync } from "fs";

const app = new Hono();

interface PR {
  repo: string;
  title: string;
  url: string;
  created_at: string;
  state: string;
  number: number;
}

function loadPRs(): PR[] {
  try {
    if (!existsSync("data/prs.json")) {
      return [];
    }
    const data = readFileSync("data/prs.json", "utf-8");
    const jsonData = JSON.parse(data);
    // prs.jsonの構造に応じてデータを取得
    return jsonData.prs || jsonData || [];
  } catch (error) {
    console.error("Error loading PRs:", error);
    return [];
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP");
}

function getStateIcon(state: string): string {
  if (state === "merged") return "🟣";
  if (state === "closed") return "🔴";
  if (state === "open") return "🟢";
  return "⚪";
}

app.get("/", (c) => {
  // ビルド時には、この部分でprs.jsonのデータが使用される
  const prs = loadPRs();
  const totalPRs = prs.length;
  const mergedPRs = prs.filter((pr) => pr.state === "merged").length;
  const openPRs = prs.filter((pr) => pr.state === "open").length;

  return c.html(
    <html>
      <head>
        <title>My GitHub Contributions Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #24292e;
            background: #f6f8fa;
            padding: 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #0366d6;
          }
          
          .pr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 20px;
          }
          
          .pr-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .pr-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .pr-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .state-icon {
            font-size: 1.2rem;
            margin-top: 2px;
          }
          
          .pr-title {
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.4;
          }
          
          .pr-title a {
            color: #24292e;
            text-decoration: none;
          }
          
          .pr-title a:hover {
            color: #0366d6;
          }
          
          .pr-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            font-size: 0.85rem;
            color: #586069;
            border-top: 1px solid #e1e4e8;
            padding-top: 16px;
          }
          
          .repo-info {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .no-prs {
            text-align: center;
            padding: 60px 20px;
            color: #586069;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          @media (max-width: 768px) {
            .pr-grid {
              grid-template-columns: 1fr;
            }
            
            .stats {
              flex-direction: column;
              gap: 20px;
            }
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>My GitHub Contributions Portfolio</h1>
            <div class="stats">
              <div class="stat">
                <div class="stat-number">{totalPRs}</div>
                <div>Total PRs</div>
              </div>
              <div class="stat">
                <div class="stat-number">{mergedPRs}</div>
                <div>Merged</div>
              </div>
              <div class="stat">
                <div class="stat-number">{openPRs}</div>
                <div>Open</div>
              </div>
              <div class="stat">
                <div class="stat-number">{totalPRs - mergedPRs - openPRs}</div>
                <div>Closed</div>
              </div>
            </div>
          </header>

          <main>
            {totalPRs === 0 ? (
              <div class="no-prs">
                <h2>No pull requests found</h2>
                <p>Pull request data will appear here once fetched.</p>
              </div>
            ) : (
              <div class="pr-grid">
                {prs.map((pr) => (
                  <article class="pr-card">
                    <div class="pr-header">
                      <span class="state-icon">{getStateIcon(pr.state)}</span>
                      <h2 class="pr-title">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {pr.title}
                        </a>
                      </h2>
                    </div>

                    <div class="pr-meta">
                      <div class="repo-info">
                        <a
                          href={`https://github.com/${pr.repo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {pr.repo}
                        </a>
                      </div>
                      <span>•</span>
                      <span>#{pr.number}</span>
                      <span>•</span>
                      <span>{formatDate(pr.created_at)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </body>
    </html>
  );
});

export default app;
