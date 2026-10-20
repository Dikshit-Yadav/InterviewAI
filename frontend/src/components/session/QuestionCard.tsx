import { Badge } from "@/components/ui/badge"

type Props = {
  category: string
  difficulty: string
  question: string
}

export default function QuestionCard({
  category,
  difficulty,
  question,
}: Props) {
  const content: Array<{ type: "text" | "code"; value: string; language?: string }> = [];
  const codeBlock = /```([^\n]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  for (const match of question.matchAll(codeBlock)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      content.push({ type: "text", value: question.slice(lastIndex, matchIndex).trim() });
    }
    content.push({
      type: "code",
      value: match[2].trim(),
      language: match[1].trim(),
    });
    lastIndex = matchIndex + match[0].length;
  }
  if (lastIndex < question.length) {
    content.push({ type: "text", value: question.slice(lastIndex).trim() });
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="flex gap-2">
        <Badge className="bg-surface-hover text-text-secondary border border-border">
          {category}
        </Badge>
        <Badge className="bg-surface-hover text-text-secondary border border-border">
          {difficulty}
        </Badge>
      </div>

      <div className="space-y-4 text-xl md:text-2xl font-semibold leading-relaxed">
        {content.map((part, index) =>
          part.type === "code" ? (
            <pre
              key={`code-${index}`}
              className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-sm font-mono leading-6 text-text-primary"
            >
              {part.language && (
                <span className="mb-2 block text-xs font-sans font-normal text-text-muted">
                  {part.language}
                </span>
              )}
              <code>{part.value}</code>
            </pre>
          ) : (
            <p key={`text-${index}`} className="whitespace-pre-wrap">
              {part.value}
            </p>
          )
        )}
      </div>
    </div>
  )
}