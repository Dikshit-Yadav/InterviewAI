import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"
import { useState, useRef, useEffect } from "react"

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function AnswerBox({ value, onChange }: Props) {
  const [listening, setListening] = useState(false)

  const recognitionRef = useRef<any>(null)
  const finalTextRef = useRef("")

  // stop the mic when this box unmounts (next/previous question, leaving page)
  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

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
    <div className="bg-surface border border-border rounded-xl p-4 relative">

      <button
        onClick={listening ? stopVoice : handleVoice}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        aria-pressed={listening}
        title={listening ? "Stop voice input" : "Start voice input"}
        className={`absolute top-3 right-3 p-2 rounded-full transition
          ${listening ? "bg-error animate-pulse" : "bg-surface-hover hover:bg-surface-hover"}
        `}
      >
        <Mic size={18} className="text-text-primary" />
      </button>
      {listening && (
        <span className="absolute right-14 top-4 text-sm font-medium text-error">
          Listening
        </span>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={10_000}
        placeholder="Type or speak your answer..."
        className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 text-text-primary placeholder:text-text-muted pr-10"
      />
    </div>
  )
}