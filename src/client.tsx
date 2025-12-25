import { render } from "hono/jsx/dom";
import { App, type PRData } from "./components";

async function loadPRsData(): Promise<PRData | null> {
  try {
    const response = await fetch("/data/prs.json");
    if (!response.ok) {
      console.log("data/prs.json not found.");
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
  const data = await loadPRsData();
  const root = document.getElementById("root");
  
  if (root) {
    render(<App data={data} />, root);
  }
}

main();
