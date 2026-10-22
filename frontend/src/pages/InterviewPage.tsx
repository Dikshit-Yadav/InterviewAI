import { useState } from "react"

import Navbar from "@/components/dashboard/DashboardNavbar"
import InterviewHeader from "@/components/interview/InterviewHeader"
import RoleSelector from "@/components/interview/RoleSelector"
import ExperienceSelector from "@/components/interview/ExperienceSelector"
import InterviewTypeSelector from "@/components/interview/InterviewTypeSelector"
import FooterBar from "@/components/interview/FooterBar"

export default function InterviewPage() {
  const [role, setRole] = useState<string | null>(null)
  const [technologies, setTechnologies] = useState("")
  const [level, setLevel] = useState("Intermediate")
  const [type, setType] = useState("Technical Interview")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <InterviewHeader />

          <RoleSelector value={role} onChange={setRole} />

          <div className="space-y-2">
            <label htmlFor="interview-technologies" className="font-semibold">
              Technologies you work with <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="interview-technologies"
              type="text"
              maxLength={500}
              value={technologies}
              onChange={(event) => setTechnologies(event.target.value)}
              placeholder="For example: HTML, CSS, Bootstrap, React"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-describedby="interview-technologies-help"
            />
            <p id="interview-technologies-help" className="text-sm text-100">
              Questions will stay within the technologies you list. If you leave
              this blank, the interview will ask which technologies you use first.
            </p>
          </div>

          <ExperienceSelector value={level} onChange={setLevel} />

          <InterviewTypeSelector value={type} onChange={setType} />

          <FooterBar
            role={role}
            technologies={technologies}
            experience={level}
            interviewType={type}
          />
        </div>
      </div>
    </div>
  )
}