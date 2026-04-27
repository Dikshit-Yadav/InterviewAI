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
        "cursor-pointer p-5 border border-gray-800 bg-[#0b0f2a] hover:border-purple-500 transition flex items-center gap-3",
        selected && "border-purple-500 bg-[#11163a]"
      )}
    >
      {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      <p className="text-sm">{title}</p>
    </Card>
  )
}