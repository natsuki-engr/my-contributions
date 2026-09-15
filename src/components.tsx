export interface PR {
  repo: string;
  title: string;
  url: string;
  created_at: string;
  state: "merged" | "closed" | "open";
  number: number;
}

export interface PRData {
  user: string;
  user_name: string;
  avatar: string;
  fetched_at: string;
  total_count: number;
  prs: PR[];
}

export function timeAgo(dateString: string): string {
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

export const PullRequestIcon = ({ state }: { state: PR["state"] }) => {
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

export const App = ({ data }: { data: PRData | null }) => {
  return (
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
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span class="pr-number">#{pr.number}</span>
                  </a>
                  <span class="pr-date" title={pr.created_at}>
                    {timeAgo(pr.created_at)}
                  </span>
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
  );
};
