import { describe, expect, it } from "vitest";
import { findRelevantArticles, queryTerms, scoreArticle } from "./knowledge";

const articles = [
  {
    id: "certificate",
    title: "Certificado de alumno regular",
    category: "Certificados",
    keywords: "certificado alumno regular constancia",
    content: "Ingresa a Solicitudes y selecciona la categoría Certificados.",
  },
  {
    id: "convalidation",
    title: "Solicitud de convalidación",
    category: "Convalidaciones",
    keywords: "convalidación asignaturas reconocimiento",
    content: "Describe las asignaturas que deseas revisar.",
  },
];

describe("knowledge retrieval ranking", () => {
  it("normalizes Spanish accents and filters common words", () => {
    expect(queryTerms("¿Cómo solicito CONVALIDACIÓN de asignaturas?")).toEqual([
      "solicito",
      "convalidacion",
      "asignaturas",
    ]);
  });

  it("ranks matching institutional content above unrelated documents", () => {
    expect(scoreArticle("certificado alumno regular", articles[0])).toBeGreaterThan(
      scoreArticle("certificado alumno regular", articles[1]),
    );
    expect(findRelevantArticles("certificado de alumno regular", articles).map((article) => article.id)).toEqual([
      "certificate",
    ]);
  });

  it("returns no documents when the query has no supported terms", () => {
    expect(findRelevantArticles("¿Qué juegos puedo instalar?", articles)).toEqual([]);
  });
});
