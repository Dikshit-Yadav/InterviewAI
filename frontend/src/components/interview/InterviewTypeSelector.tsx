import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const types = [
  "Technical Interview",
  "HR Interview",
  "System Design Interview",
  "Behavioral Interview",
]

type Props = {
  value: string
  onChange: (type: string) => void
}

export default function InterviewTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-4">3. Interview type</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => onChange(type)}
            className={cn(
              "justify-start border-border bg-surface",
              value === type &&
                "border-brand text-text-primary bg-surface-hover"
            )}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  )
}