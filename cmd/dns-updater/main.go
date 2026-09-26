package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type graphQLRequest struct {
	Query string `json:"query"`
}

type graphQLResponse struct {
	Data struct {
		Viewer struct {
			Login string `json:"login"`
		} `json:"viewer"`
	}
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func main() {
	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "GITHUB_TOKEN is not set")
		os.Exit(1)
	}

	body, err := json.Marshal(graphQLRequest{
		Query: `query { viewer { login } }`,
	})
	if err != nil {
		fmt.Fprintln(os.Stderr, "encode request:", err)
		os.Exit(1)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"https://api.github.com/graphql",
		bytes.NewReader(body),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, "create request:", err)
		os.Exit(1)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintln(os.Stderr, "send request:", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Fprintf(os.Stderr, "GitHub API returned status %s\n", resp.Status)
		os.Exit(1)
	}

	var result graphQLResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Fprintln(os.Stderr, "decode response:", err)
		os.Exit(1)
	}

	if len(result.Errors) > 0 {
		fmt.Fprintln(os.Stderr, "GraphQL errorr:", result.Errors[0].Message)
		os.Exit(1)
	}

	fmt.Println("Authenticated as:", result.Data.Viewer.Login)
}
