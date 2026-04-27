import OptionCard from "./OptionCard"
import {
  Code,
  Database,
  Layers,
  BarChart,
  Cpu,
  Coffee,
  Briefcase,
} from "lucide-react"

const roles = [
  { name: "Frontend Developer", icon: Code },
  { name: "Backend Developer", icon: Database },
  { name: "Full Stack Developer", icon: Layers },
  { name: "Data Analyst", icon: BarChart },
  { name: "Machine Learning Engineer", icon: Cpu },
  { name: "Java Developer", icon: Coffee },
  { name: "Product Manager", icon: Briefcase },
]

type Props = {
  value: string | null
  onChange: (role: string) => void
}

export default function RoleSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-4">1. Target role</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <OptionCard
            key={role.name}
            title={role.name}
            icon={role.icon}
            selected={value === role.name}
            onClick={() => onChange(role.name)}
          />
        ))}
      </div>
    </div>
  )
}