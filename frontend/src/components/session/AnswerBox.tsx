import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"
import { useState, useRef, useEffect, useLayoutEffect } from "react"

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultsLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultsLike;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function AnswerBox({ value, onChange }: Props) {
  const [listening, setListening] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const finalTextRef = useRef("")

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "0px"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  // stop the mic when this box unmounts (next/previous question, leaving page)
  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const handleVoice = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

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

    recognition.onresult = (event) => {
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
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={10_000}
        placeholder="Type or speak your answer..."
        className="field-sizing-fixed min-h-[160px] resize-none overflow-hidden bg-transparent border-none focus-visible:ring-0 text-text-primary placeholder:text-text-muted pr-10 sm:min-h-[200px]"
      />
    </div>
  )
}