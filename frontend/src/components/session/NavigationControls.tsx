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
    <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
      <Button
        variant="outline"
        onClick={() => onPrev()}
        disabled={disablePrev || submitting}
        className="w-full border-gray-700 sm:w-auto"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
        {!isLast && (
          <Button
            variant="outline"
            onClick={() => onFinish()}
            disabled={submitting}
            className="w-full border-border sm:w-auto"
          >
            Finish early
          </Button>
        )}
        <Button
          onClick={() => (isLast ? onFinish() : onNext())}
          loading={submitting}
          className="w-full bg-brand text-primary-foreground hover:bg-brand-hover sm:w-auto"
        >
          {submitting ? "Evaluating..." : isLast ? "Finish & Get Report" : "Next"}
          {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
      </div>
    </div>
  )
}
