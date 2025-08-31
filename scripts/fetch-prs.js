import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

// Load environment variables from .env file (optional)
try {
  config();
} catch (e) {}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  baseUrl: "https://api.github.com",
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
});

async function getUser(username) {
  try {
    console.log(`🔐 Fetching user info for: ${username}`);
    const userResponse = await octokit.request("GET /users/{username}", {
      username: username,
    });

    const user = {
      name: userResponse.data.name ?? userResponse.data.login,
      username: userResponse.data.login,
      avatar: userResponse.data.avatar_url,
    };

    console.log(`✅ User info fetched: ${user.name} (@${user.username})`);
    return user;
  } catch (error) {
    console.error("❌ Failed to fetch user info:", error.message);
    if (error.status === 401) {
      console.error("💡 This might be a GITHUB_TOKEN permissions issue.");
      console.error(
        "💡 Make sure your GitHub Actions workflow has the correct permissions:"
      );
      console.error("   permissions:");
      console.error("     pull-requests: read");
      console.error("     contents: read");
    }
    throw error;
  }
}

async function fetchAllPRs() {
  try {
    const targetUsername = process.env.GITHUB_ACTOR || "";
    const user = await getUser(targetUsername);
    console.log(`📋 Fetching PRs for user: ${user.username}`);

    const includeOwnRepos = process.env.INCLUDE_OWN_PRS === "true";
    const query = includeOwnRepos
      ? `type:pr+author:"${user.username}"`
      : `type:pr+author:"${user.username}"+-user:"${user.username}"`;

    console.log(`🔍 Search query: ${query}`);

    const { data } = await octokit.request("GET /search/issues", {
      q: query,
      per_page: 100,
      page: 1,
      advanced_search: "true",
    });

    console.log(
      `📊 Found ${data.total_count} total PRs, processing ${data.items.length} items`
    );

    const allPRs = data.items
      .filter(
        (pr) => !(pr.state === "closed" && pr.pull_request?.merged_at == null)
      )
      .map((pr) => ({
        repo: pr.repository_url.split("/").slice(-2).join("/"),
        title: pr.title,
        url: pr.html_url,
        created_at: pr.created_at,
        state: pr.pull_request?.merged_at != null ? "merged" : pr.state,
        number: pr.number,
      }));

    mkdirSync(dirname("data/prs.json"), { recursive: true });

    const outputData = {
      user: user.username,
      user_name: user.name,
      avatar: user.avatar,
      fetched_at: new Date().toISOString(),
      total_count: data.total_count,
      prs: allPRs,
    };

    writeFileSync("data/prs.json", JSON.stringify(outputData, null, 2));

    console.log(`✅ Successfully saved ${allPRs.length} PRs to data/prs.json`);

    const merged = allPRs.filter((pr) => pr.state === "merged").length;
    const open = allPRs.filter((pr) => pr.state === "open").length;
    const closed = allPRs.filter((pr) => pr.state === "closed").length;

    console.log(`📊 Statistics:`);
    console.log(`   Merged: ${merged}`);
    console.log(`   Open: ${open}`);
    console.log(`   Closed: ${closed}`);
    console.log(`   Total: ${allPRs.length}`);

    if (allPRs.length > 0) {
      console.log(`\n📝 Sample PRs:`);
      allPRs.slice(0, 3).forEach((pr, index) => {
        console.log(
          `   ${index + 1}. [${pr.state.toUpperCase()}] ${pr.repo}#${
            pr.number
          }: ${pr.title}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error fetching PRs:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      console.error("Response data:", error.response.data);
    }

    if (error.status === 403) {
      console.error(
        "💡 This might be a rate limiting issue or insufficient permissions."
      );
      console.error(
        "💡 Check if your GITHUB_TOKEN has the necessary permissions."
      );
    }

    process.exit(1);
  }
}

console.log("🚀 Starting PR fetch process...");
fetchAllPRs()
  .then(() => {
    console.log("🎉 PR fetch process completed successfully!");
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
