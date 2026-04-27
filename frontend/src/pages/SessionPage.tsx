import { useState } from "react"

import ProgressHeader from "@/components/session/ProgressHeader"
import QuestionCard from "@/components/session/QuestionCard"
import AnswerBox from "@/components/session/AnswerBox"
import NavigationControls from "@/components/session/NavigationControls"

export default function SessionPage() {
  const [answer, setAnswer] = useState("")

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <ProgressHeader
          current={1}
          total={5}
          timeLeft="3:53"
        />

        <QuestionCard
          category="JavaScript Basics"
          difficulty="easy"
          question="What are the key differences between 'var', 'let', and 'const' in JavaScript, and when should you use each?"
        />

        <AnswerBox value={answer} onChange={setAnswer} />

        <NavigationControls
          onPrev={() => console.log("prev")}
          onNext={() => console.log("next")}
          onSubmit={() => console.log("submit", answer)}
          disablePrev
        />
      </div>
    </div>
  )
}