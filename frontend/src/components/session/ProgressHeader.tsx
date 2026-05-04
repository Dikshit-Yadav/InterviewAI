type Props = {
  current: number
  total: number
  timeLeft: string
}

export default function ProgressHeader({ current, total }: Props) {

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>
          Question {current} of {total}
        </span>

      </div>

    </div>
  )
}