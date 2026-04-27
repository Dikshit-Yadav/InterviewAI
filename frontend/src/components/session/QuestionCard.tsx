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
    <div className="bg-[#0b0f2a] border border-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex gap-2">
        <Badge className="bg-[#11163a] text-gray-300 border border-gray-700">
          {category}
        </Badge>
        <Badge className="bg-[#11163a] text-gray-300 border border-gray-700">
          {difficulty}
        </Badge>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold leading-relaxed">
        {question}
      </h2>
    </div>
  )
}