import { Textarea } from "@/components/ui/textarea"

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function AnswerBox({ value, onChange }: Props) {
  return (
    <div className="bg-[#0b0f2a] border border-gray-800 rounded-2xl p-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here. Be specific, give examples, walk through your thinking..."
        className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 text-gray-200 placeholder:text-gray-500"
      />
    </div>
  )
}