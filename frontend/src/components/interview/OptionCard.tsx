import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  icon?: React.ElementType
  selected?: boolean
  onClick?: () => void
}

export default function OptionCard({
  title,
  icon: Icon,
  selected,
  onClick,
}: Props) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer p-5 border border-border bg-surface hover:border-brand transition flex items-center gap-3",
        selected && "border-brand bg-surface-hover"
      )}
    >
      {Icon && <Icon className="w-5 h-5 text-accent-1" />}
      <p className="text-sm">{title}</p>
    </Card>
  )
}