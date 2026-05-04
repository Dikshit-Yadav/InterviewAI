import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"
import { useState, useRef } from "react"

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function AnswerBox({ value, onChange }: Props) {
  const [listening, setListening] = useState(false)

  const recognitionRef = useRef<any>(null)
  const finalTextRef = useRef("")

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    finalTextRef.current = "" 
    setListening(true)

    recognition.start()

    recognition.onresult = (event: any) => {
      let interim = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTextRef.current += transcript + " "
        } else {
          interim += transcript
        }
      }

      onChange(finalTextRef.current + interim)
    }

    recognition.onerror = () => {
      setListening(false)
      recognition.stop()
    }

    recognition.onend = () => {
      setListening(false)
    }
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="bg-[#0b0f2a] border border-gray-800 rounded-2xl p-4 relative">

      <button
        onClick={listening ? stopVoice : handleVoice}
        className={`absolute top-3 right-3 p-2 rounded-full transition
          ${listening ? "bg-red-500 animate-pulse" : "bg-gray-800 hover:bg-gray-700"}
        `}
      >
        <Mic size={18} className="text-white" />
      </button>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type or speak your answer..."
        className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 text-gray-200 placeholder:text-gray-500 pr-10"
      />
    </div>
  )
}