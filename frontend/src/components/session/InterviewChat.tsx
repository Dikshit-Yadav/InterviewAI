import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button, Tooltip, Tag } from "antd";
import {
  SendOutlined,
  AudioOutlined,
  RobotOutlined,
  UserOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ChatMessage } from "@/types/api";

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
  messages: ChatMessage[];
  isAiGenerating: boolean;
  onSendMessage: (text: string) => void;
  onOpenCodingWorkspace?: () => void;
  hasActiveCodingQuestion?: boolean;
  isTerminated?: boolean;
  terminationReason?: string | null;
  unprofessionalStrikes?: number;
  onEndAssessment?: () => void;
};

const formatTime = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function InterviewChat({
  messages,
  isAiGenerating,
  onSendMessage,
  onOpenCodingWorkspace,
  hasActiveCodingQuestion = false,
  isTerminated = false,
  terminationReason = null,
  unprofessionalStrikes = 0,
  onEndAssessment,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef("");

  // Smooth auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiGenerating]);

  // Adjust textarea height dynamically
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [inputText]);

  // Stop mic on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Voice-to-Text handler
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      finalTextRef.current = inputText ? `${inputText.trim()} ` : "";
      setIsListening(true);

      recognition.start();

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTextRef.current += `${transcript} `;
          } else {
            interim += transcript;
          }
        }
        setInputText(finalTextRef.current + interim);
      };

      recognition.onerror = () => {
        setIsListening(false);
        recognition.stop();
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isAiGenerating) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    onSendMessage(trimmed);
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground transition-colors">
      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.role === "ai";
          const isSystem = msg.role === "system";
          const isCodingPrompt = msg.type === "CODING_QUESTION";
          const isRejected = msg.type === "INTERVIEW_REJECTED";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="rounded-full border border-border bg-surface px-4 py-1 text-xs text-muted-foreground shadow-xs">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 transition-opacity duration-200 ${
                isAI ? "justify-start" : "justify-end"
              }`}
            >
              {/* AI Avatar */}
              {isAI && (
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${
                    isRejected
                      ? "bg-destructive text-white"
                      : "bg-brand text-primary-foreground"
                  }`}
                >
                  {isRejected ? (
                    <CloseCircleOutlined className="text-base" />
                  ) : (
                    <RobotOutlined className="text-base" />
                  )}
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs transition-all ${
                  isAI
                    ? isRejected
                      ? "border-2 border-destructive/70 bg-destructive/10 text-foreground"
                      : isCodingPrompt
                      ? "border border-amber-500/50 bg-amber-500/5 text-foreground dark:bg-amber-950/20"
                      : "border border-border bg-card text-foreground"
                    : "bg-brand text-primary-foreground rounded-tr-sm shadow-sm"
                }`}
              >
                {/* AI Question Metadata / Tags */}
                {isAI && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {isRejected && (
                      <Tag
                        color="error"
                        className="border text-xs px-2 py-0.5 rounded-full font-bold"
                      >
                        <CloseCircleOutlined className="mr-1" />
                        Candidacy Terminated (3/3 Strikes)
                      </Tag>
                    )}
                    {msg.isUnprofessional && !isRejected && (
                      <Tag
                        color="warning"
                        className="border text-xs px-2 py-0.5 rounded-full font-semibold"
                      >
                        <ExclamationCircleOutlined className="mr-1" />
                        Conduct Warning
                      </Tag>
                    )}
                    {msg.isFollowUp && (
                      <Tag
                        color="purple"
                        className="border text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        <ThunderboltOutlined className="mr-1" />
                        Follow-up Question
                      </Tag>
                    )}
                    {isCodingPrompt && (
                      <Tag
                        color="gold"
                        className="border text-xs px-2 py-0.5 rounded-full font-semibold"
                      >
                        <CodeOutlined className="mr-1" />
                        Coding Challenge
                      </Tag>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap select-none leading-relaxed">
                  {msg.content}
                </div>

                {/* Coding Round Callout */}
                {isCodingPrompt && onOpenCodingWorkspace && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Code Editor activated in workspace
                    </span>
                    <Button
                      size="small"
                      type="primary"
                      icon={<CodeOutlined />}
                      onClick={onOpenCodingWorkspace}
                      className="bg-brand text-primary-foreground hover:bg-brand-hover border-0 text-xs font-semibold rounded-md"
                    >
                      Focus Editor
                    </Button>
                  </div>
                )}

                {/* Candidate timestamp */}
                {!isAI && (
                  <div className="mt-1.5 text-right text-[10px] opacity-75">
                    {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>

              {/* Candidate Avatar */}
              {!isAI && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-foreground border border-border shadow-xs">
                  <UserOutlined className="text-base" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing / Thinking Indicator */}
        {isAiGenerating && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-primary-foreground font-bold shadow-xs">
              <RobotOutlined className="text-base" />
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground flex items-center gap-2.5 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="font-medium">AI Interviewer is analyzing and formulating a response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-surface/90 p-3 sm:p-4 backdrop-blur-md">
        {isTerminated ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-destructive font-bold text-sm">
              <CloseCircleOutlined className="text-base" />
              <span>
                {terminationReason === "UNPROFESSIONAL_CONDUCT"
                  ? "Interview Terminated: Candidacy rejected due to repeated unprofessional conduct."
                  : "Interview Terminated: Assessment concluded."}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You have accumulated 3 warnings for non-serious or unprofessional communication. The assessment has been terminated and the conversation is locked.
            </p>
            {onEndAssessment && (
              <button
                type="button"
                onClick={onEndAssessment}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90 text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>End Assessment &amp; View Summary</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Conduct warning banner when strikes > 0 */}
            {unprofessionalStrikes > 0 && (
              <div className="mb-2.5 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <ExclamationCircleOutlined />
                  Professional Conduct Alert: <strong>{unprofessionalStrikes}/3</strong> warning{unprofessionalStrikes > 1 ? "s" : ""} issued. Real-world professional communication is required.
                </span>
              </div>
            )}

            {/* Active listening status bar */}
            {isListening && (
              <div className="mb-2 flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive animate-pulse">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Microphone recording &mdash; speaking will transcribe in real-time...
                </span>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className="font-semibold underline hover:opacity-80 cursor-pointer"
                >
                  Stop Voice
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Textarea */}
              <div className="relative flex-1 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-ring transition-colors shadow-xs">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  disabled={isAiGenerating || isTerminated}
                  maxLength={10000}
                  placeholder={
                    isListening
                      ? "Transcribing your speech..."
                      : "Type your answer or use microphone to speak (Enter to send)..."
                  }
                  className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Voice Mic Button */}
              <Tooltip title={isListening ? "Stop voice input" : "Answer with Voice (Speech to Text)"}>
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={isAiGenerating || isTerminated}
                  className={`rounded-xl h-10 w-10 flex items-center justify-center shrink-0 border transition cursor-pointer disabled:opacity-50 ${
                    isListening
                      ? "bg-destructive border-destructive text-white animate-pulse"
                      : "border-border bg-surface-elevated text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <AudioOutlined />
                </button>
              </Tooltip>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || isAiGenerating || isTerminated}
                className="flex items-center justify-center gap-1.5 rounded-xl h-10 px-4 bg-brand hover:bg-brand-hover text-primary-foreground border-0 shrink-0 font-semibold text-sm transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <SendOutlined />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Shift + Enter for new line • Enter to submit</span>
              <span>{inputText.length}/10,000</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
