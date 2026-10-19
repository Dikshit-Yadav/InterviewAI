import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Props = {
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  disablePrev?: boolean
  isLast?: boolean
  submitting?: boolean
}
export default function NavigationControls({
  onPrev,
  onNext,
  onFinish,
  disablePrev,
  isLast,
  submitting,
}: Props) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={disablePrev || submitting}
        className="border-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <Button
        onClick={isLast ? onFinish : onNext}
        loading={submitting}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {submitting ? "Evaluating..." : isLast ? "Finish & Get Report" : "Next"}
        {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  )
}
