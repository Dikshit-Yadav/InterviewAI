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
        onClick={() => onPrev()}
        disabled={disablePrev || submitting}
        className="border-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex flex-wrap justify-end gap-3">
        {!isLast && (
          <Button
            variant="outline"
            onClick={() => onFinish()}
            disabled={submitting}
            className="border-border"
          >
            Finish early
          </Button>
        )}
        <Button
          onClick={() => (isLast ? onFinish() : onNext())}
          loading={submitting}
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
        >
          {submitting ? "Evaluating..." : isLast ? "Finish & Get Report" : "Next"}
          {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
      </div>
    </div>
  )
}
