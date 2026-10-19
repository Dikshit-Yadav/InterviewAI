type Props = {
  current: number
  total: number
  answered?: number
  timeLeft: string
}

export default function ProgressHeader({ current, total, answered }: Props) {

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>
          Question {current} of {total}
        </span>

        {answered !== undefined && (
          <span>
            {answered}/{total} answered
          </span>
        )}
      </div>

    </div>
  )
}
