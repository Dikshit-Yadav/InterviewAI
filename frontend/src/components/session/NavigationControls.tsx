import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Props = {
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  disablePrev?: boolean
}

export default function NavigationControls({
  onPrev,
  onNext,
  onSubmit,
  disablePrev,
}: Props) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={disablePrev}
        className="border-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Submit answer
        </Button>

        <Button
          variant="outline"
          onClick={onNext}
          className="border-gray-700"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}