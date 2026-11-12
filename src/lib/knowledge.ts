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
  "institucion",
  "institucional",
  "institucionales",
]);

const intentTerms = new Set(["saber", "pedir", "solicitar", "solicito", "obtener"]);

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

function words(value: string): Set<string> {
  return new Set(normalize(value).match(/[a-z0-9]+/g) ?? []);
}

function matchesTerm(term: string, word: string): boolean {
  if (term === word) return true;
  if (term.length < 5 || word.length < 5) return false;
  return term === `${word}s` || word === `${term}s` ||
    term === `${word}es` || word === `${term}es`;
}

function containsTerm(terms: Set<string>, query: string): boolean {
  return [...terms].some((word) => matchesTerm(query, word));
}

export function scoreArticle(query: string, article: KnowledgeCandidate): number {
  const terms = queryTerms(query);
  if (terms.length === 0) return 0;

  const title = words(article.title);
  const keywords = words(article.keywords);
  const content = words(article.content);
  let score = 0;

  for (const term of terms) {
    if (containsTerm(title, term)) score += 4;
    if (containsTerm(keywords, term)) score += 3;
    if (containsTerm(content, term)) score += 1;
  }
  return score;
}

export function findRelevantArticles<T extends KnowledgeCandidate>(
  query: string,
  articles: T[],
  limit = 3,
): Array<T & { relevance: number }> {
  const terms = queryTerms(query);
  const specificTerms = terms.filter((term) => !intentTerms.has(term));
  const ranked = articles
    .map((article) => {
      const title = words(article.title);
      const keywords = words(article.keywords);
      const titleMatches = terms.filter((term) => containsTerm(title, term)).length;
      const strongMatches = terms.filter(
        (term) => containsTerm(title, term) || containsTerm(keywords, term),
      ).length;
      return { article, relevance: scoreArticle(query, article), titleMatches, strongMatches };
    })
    .filter(({ relevance, titleMatches, strongMatches }) =>
      relevance >= 3 && (titleMatches > 0 || strongMatches >= 2 || (specificTerms.length === 1 && strongMatches === 1)),
    )
    .sort((left, right) => right.relevance - left.relevance);

  const bestScore = ranked[0]?.relevance ?? 0;
  const seen = new Set<string>();
  return ranked
    .filter(({ article, relevance }) => {
      if (relevance < bestScore * 0.6) return false;
      const key = JSON.stringify([article.title, article.category, article.content, article.keywords]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ article, relevance }) => ({ ...article, relevance }));
}
