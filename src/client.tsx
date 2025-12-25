import { render } from "hono/jsx/dom";
import { App, type PRData } from "./components";

// For SSG builds, the HTML is already pre-rendered
// This script provides optional client-side enhancements
async function loadPRsData(): Promise<PRData | null> {
  try {
    const response = await fetch("/prs.json");
    if (!response.ok) {
      console.log("prs.json not found.");
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading or parsing prs.json:", error);
    return null;
  }
}

async function main() {
  const root = document.getElementById("root");
  
  if (!root) {
    console.error("Root element not found");
    return;
  }

  // For SSG, the HTML is already pre-rendered with data
  // We only re-render if we need client-side updates
  // For now, we keep the pre-rendered content and just enable future interactivity
  
  // Optionally: Uncomment below to fetch and re-render with fresh data
  // const data = await loadPRsData();
  // if (data) {
  //   render(<App data={data} />, root);
  // }
}

main();
