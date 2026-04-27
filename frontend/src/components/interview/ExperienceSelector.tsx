import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const levels = ["Beginner", "Intermediate", "Advanced"]

type Props = {
  value: string
  onChange: (level: string) => void
}

export default function ExperienceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-4">2. Experience level</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {levels.map((level) => (
          <Button
            key={level}
            variant="outline"
            onClick={() => onChange(level)}
            className={cn(
              "h-12 w-full border-gray-700 bg-[#0b0f2a]",
              value === level &&
                "border-purple-500 text-white bg-[#11163a]"
            )}
          >
            {level}
          </Button>
        ))}
      </div>
    </div>
  )
}