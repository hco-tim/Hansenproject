function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function normalizeArticleBody(value: string) {
  return decodeEntities(value)
    .replace(/<h2\b[^>]*>/gi, "\n\n## ")
    .replace(/<\/h2\s*>/gi, "\n\n")
    .replace(/<h3\b[^>]*>/gi, "\n\n### ")
    .replace(/<\/h3\s*>/gi, "\n\n")
    .replace(/<p\b[^>]*>/gi, "\n\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/li\s*>/gi, "")
    .replace(/<\/?(?:ul|ol)\b[^>]*>/gi, "\n")
    .replace(/<\/?(?:strong|b|em|i|u|span|a)\b[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\r/g, "")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ArticleBody({ body }: { body: string }) {
  const normalizedBody = normalizeArticleBody(body || "");
  const blocks = normalizedBody.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="article-content space-y-6 text-base leading-8 text-slate-200 md:text-lg">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return <h2 key={index} className="pt-4 text-2xl font-semibold leading-snug text-white md:text-3xl">{block.slice(3)}</h2>;
        }
        if (block.startsWith("### ")) {
          return <h3 key={index} className="pt-2 text-xl font-semibold leading-snug text-white md:text-2xl">{block.slice(4)}</h3>;
        }
        if (block.split("\n").every((line) => line.startsWith("- "))) {
          return <ul key={index} className="list-disc space-y-2 pl-6">{block.split("\n").map((line, itemIndex) => <li key={itemIndex}>{line.slice(2)}</li>)}</ul>;
        }
        return <p key={index} className="whitespace-pre-line">{block}</p>;
      })}
    </div>
  );
}
