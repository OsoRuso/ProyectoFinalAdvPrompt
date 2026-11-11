export type KnowledgeCandidate = {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string;
};

const ignoredTerms = new Set([
  "para",
  "como",
  "donde",
  "cuando",
  "cual",
  "cuales",
  "que",
  "por",
  "con",
  "del",
  "las",
  "los",
  "una",
  "uno",
  "necesito",
  "quiero",
  "puedo",
  "debo",
  "hay",
  "tiene",
  "tengo",
]);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function queryTerms(query: string): string[] {
  return [...new Set(normalize(query).match(/[a-z0-9]+/g) ?? [])].filter(
    (term) => term.length > 2 && !ignoredTerms.has(term),
  );
}

export function scoreArticle(query: string, article: KnowledgeCandidate): number {
  const terms = queryTerms(query);
  if (terms.length === 0) return 0;

  const title = normalize(article.title);
  const keywords = normalize(article.keywords);
  const content = normalize(article.content);
  let score = 0;

  for (const term of terms) {
    if (title.includes(term)) score += 4;
    if (keywords.includes(term)) score += 3;
    if (content.includes(term)) score += 1;
  }
  return score;
}

export function findRelevantArticles<T extends KnowledgeCandidate>(
  query: string,
  articles: T[],
  limit = 3,
): Array<T & { relevance: number }> {
  return articles
    .map((article) => ({ ...article, relevance: scoreArticle(query, article) }))
    .filter((article) => article.relevance >= 3)
    .sort((left, right) => right.relevance - left.relevance)
    .slice(0, limit);
}
