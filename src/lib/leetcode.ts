const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

interface LeetCodeQuestion {
  title: string;
  titleSlug: string;
  difficulty: string;
  content: string;
  topicTags: { name: string; slug: string }[];
  questionFrontendId: string;
}

export async function fetchLeetCodeQuestion(
  slug: string
): Promise<LeetCodeQuestion | null> {
  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        titleSlug
        difficulty
        content
        topicTags {
          name
          slug
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: slug },
      }),
    });

    if (!response.ok) {
      console.error("LeetCode API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data?.data?.question ?? null;
  } catch (error) {
    console.error("Failed to fetch LeetCode question:", error);
    return null;
  }
}

export async function searchLeetCodeQuestions(
  searchQuery: string
): Promise<{ title: string; titleSlug: string; difficulty: string }[]> {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        questions: data {
          title
          titleSlug
          difficulty
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 20,
          filters: { searchKeywords: searchQuery },
        },
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data?.data?.problemsetQuestionList?.questions ?? [];
  } catch {
    return [];
  }
}
