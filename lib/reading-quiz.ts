import { ARTICLES, type KnowledgeArticle } from "@/lib/articles";

export type ReadingQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};
export type ReadingQuizResult = {
  source: "ai" | "offline";
  questions: ReadingQuestion[];
};

function normalized(text: string) {
  return text.trim().toLocaleLowerCase("en");
}

function chooseOthers(target: string, pool: string[], number: number, seed: number) {
  const unique = [...new Set(pool.filter((item) => normalized(item) !== normalized(target)))];
  const taken: string[] = [];
  for (let step = 0; step < number && unique.length > 0; step++) {
    const index = (seed + step * 13) % unique.length;
    taken.push(unique.splice(index, 1)[0]);
  }
  return taken;
}

function arrange(correct: string, distractors: string[], index: number) {
  const position = index % (distractors.length + 1);
  const options = [...distractors];
  options.splice(position, 0, correct);
  return { options, answerIndex: position };
}

/** A non-AI fallback that is always available, with answers derived from vetted article data. */
export function buildOfflineReadingQuiz(article: KnowledgeArticle): ReadingQuizResult {
  const otherArticles = ARTICLES.filter((item) => item.id !== article.id);
  const unrelatedIdeas = otherArticles.flatMap((item) => item.keyIdeas);
  const otherTerms = otherArticles.flatMap((item) => item.vocabulary.map((v) => v.word));
  const questions: ReadingQuestion[] = [];

  article.keyIdeas.slice(0, 3).forEach((idea, i) => {
    const choices = arrange(idea, chooseOthers(idea, unrelatedIdeas, 3, i * 7 + article.id.length), i + 1);
    questions.push({
      id: "idea-" + i,
      prompt: i === 0
        ? "Which statement best reflects the article's central argument?"
        : i === 1
          ? "Which conclusion is supported by the text?"
          : "What further point does the author make?",
      ...choices,
      explanation: "The article supports this idea: " + idea
    });
  });

  article.vocabulary.slice(0, 2).forEach((entry, i) => {
    const choices = arrange(entry.word, chooseOthers(entry.word, [
      ...article.vocabulary.map((v) => v.word),
      ...otherTerms
    ], 3, i * 11 + article.id.length), i + 2);
    questions.push({
      id: "vocab-" + i,
      prompt: 'Which expression is associated with this meaning: "' + entry.meaning + '"?',
      ...choices,
      explanation: entry.word + " — " + entry.meaning
    });
  });

  return { source: "offline", questions };
}

export function validReadingQuestions(value: unknown): value is ReadingQuestion[] {
  return Array.isArray(value) && value.length >= 3 && value.length <= 7 &&
    value.every((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const q = item as Partial<ReadingQuestion>;
      return typeof q.id === "string" &&
        typeof q.prompt === "string" && q.prompt.length > 6 && q.prompt.length < 500 &&
        Array.isArray(q.options) && q.options.length === 4 &&
        q.options.every((option) => typeof option === "string" && option.length > 0 && option.length < 500) &&
        new Set(q.options.map(normalized)).size === 4 &&
        Number.isInteger(q.answerIndex) && q.answerIndex! >= 0 && q.answerIndex! < 4 &&
        typeof q.explanation === "string" && q.explanation.length > 0 && q.explanation.length < 1500;
    });
}
