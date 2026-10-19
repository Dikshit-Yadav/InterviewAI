import { useState } from "react"

import Navbar from "@/components/dashboard/DashboardNavbar"
import InterviewHeader from "@/components/interview/InterviewHeader"
import RoleSelector from "@/components/interview/RoleSelector"
import ExperienceSelector from "@/components/interview/ExperienceSelector"
import InterviewTypeSelector from "@/components/interview/InterviewTypeSelector"
import FooterBar from "@/components/interview/FooterBar"

export default function InterviewPage() {
  const [role, setRole] = useState<string | null>(null)
  const [level, setLevel] = useState("Intermediate")
  const [type, setType] = useState("Technical Interview")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <InterviewHeader />

          <RoleSelector value={role} onChange={setRole} />

          <ExperienceSelector value={level} onChange={setLevel} />

          <InterviewTypeSelector value={type} onChange={setType} />

          <FooterBar role={role} experience={level} interviewType={type}/>
        </div>
      </div>
    </div>
  )
}