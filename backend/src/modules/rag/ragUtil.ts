import { Document } from "langchain/document";

export function combineDocs(docs: Document[]) {
  return docs.map(doc => doc.pageContent).join("\n\n");
}

export function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
