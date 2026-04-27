import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

type Props = {
  current: number
  total: number
  timeLeft: string
}

export default function ProgressHeader({ current, total, timeLeft }: Props) {
  const progress = (current / total) * 100

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>
          Question {current} of {total}
        </span>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}</span>
        </div>
      </div>

      <Progress value={progress} className="h-2 bg-gray-800" />
    </div>
  )
}