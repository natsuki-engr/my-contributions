import { render } from "hono/jsx/dom";
import { App, type PRData } from "./components";

// For client-side hydration, we can optionally refresh the data
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
  // On initial load, the HTML is already pre-rendered by SSG
  // We can optionally re-render with fresh data for client-side updates
  const root = document.getElementById("root");
  
  if (root) {
    // Only fetch and re-render if needed (e.g., for client-side updates)
    // For now, we'll just enable this for client-side interactivity
    // The pre-rendered content from SSG will be shown immediately
    
    // Optionally reload data on client-side
    const data = await loadPRsData();
    if (data) {
      render(<App data={data} />, root);
    }
  } else {
    console.error("Root element not found");
  }
}

main();
