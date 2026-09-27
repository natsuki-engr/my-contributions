package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type graphQLRequest struct {
	Query     string           `json:"query"`
	Variables graphQLVariables `json:"variables"`
}

type graphQLVariables struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type graphQLResponse struct {
	Data struct {
		Viewer struct {
			Login                   string `json:"login"`
			ContributionsCollection struct {
				TotalCommitContributions            int `json:"totalCommitContributions"`
				TotalIssueContributions             int `json:"totalIssueContributions"`
				TotalPullRequestContributions       int `json:"totalPullRequestContributions"`
				TotalPullRequestReviewContributions int `json:"totalPullRequestReviewContributions"`
				TotalRepositoryContributions        int `json:"totalRepositoryContributions"`
				RestrictedContributionsCount        int `json:"restrictedContributionsCount"`
				ContributionCalendar                struct {
					Weeks []struct {
						ContributionDays []struct {
							Date              string `json:"date"`
							ContributionCount int    `json:"contributionCount"`
						} `json:"contributionDays"`
					} `json:"weeks"`
				} `json:"contributionCalendar"`
			} `json:"contributionsCollection"`
		} `json:"viewer"`
	}
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

func main() {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Fatal("load .env:", err)
	}

	token := os.Getenv("CONTRIBUTIONS_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "CONTRIBUTIONS_TOKEN is not set")
		os.Exit(1)
	}

	tokyo, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		log.Fatal("load JST timezone:", err)
	}
	targetDate := time.Now().In(tokyo).AddDate(0, 0, -1)
	from := time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), 0, 0, 0, 0, tokyo)
	to := from.AddDate(0, 0, 1).Add(-time.Nanosecond)
	date := from.Format("2006-01-02")

	body, err := json.Marshal(graphQLRequest{
		Query: `query($from: DateTime!, $to: DateTime!) {
			viewer {
				login
				contributionsCollection(from: $from, to: $to) {
					totalCommitContributions
					totalIssueContributions
					totalPullRequestContributions
					totalPullRequestReviewContributions
					totalRepositoryContributions
					restrictedContributionsCount
					contributionCalendar {
						weeks {
							contributionDays {
								date
								contributionCount
							}
						}
					}
				}
			}
		}`,
		Variables: graphQLVariables{
			From: from.Format(time.RFC3339Nano),
			To:   to.Format(time.RFC3339Nano),
		},
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
		fmt.Fprintln(os.Stderr, "GraphQL error:", result.Errors[0].Message)
		os.Exit(1)
	}

	collection := result.Data.Viewer.ContributionsCollection
	var dailyTotal int
	for _, week := range collection.ContributionCalendar.Weeks {
		for _, day := range week.ContributionDays {
			if day.Date == date {
				dailyTotal = day.ContributionCount
			}
		}
	}

	fmt.Printf("User: %s\n", result.Data.Viewer.Login)
	fmt.Printf("Date: %s\n", date)
	fmt.Printf("Total contributions: %d\n", dailyTotal)
	fmt.Printf("Commits: %d\n", collection.TotalCommitContributions)
	fmt.Printf("Issues: %d\n", collection.TotalIssueContributions)
	fmt.Printf("Pull requests: %d\n", collection.TotalPullRequestContributions)
	fmt.Printf("Pull request reviews: %d\n", collection.TotalPullRequestReviewContributions)
	fmt.Printf("Repositories created: %d\n", collection.TotalRepositoryContributions)
	fmt.Printf("Restricted contributions: %d\n", collection.RestrictedContributionsCount)
}
