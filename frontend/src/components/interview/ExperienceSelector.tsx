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
              "h-12 w-full border-border bg-surface",
              value === level &&
                "border-brand text-text-primary bg-surface-hover"
            )}
          >
            {level}
          </Button>
        ))}
      </div>
    </div>
  )
}