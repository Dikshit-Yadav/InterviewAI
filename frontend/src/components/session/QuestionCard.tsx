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

      <h2 className="text-xl md:text-2xl font-semibold leading-relaxed">
        {question}
      </h2>
    </div>
  )
}