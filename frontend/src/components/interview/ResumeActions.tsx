import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  interviewService,
  type ResumeReview,
} from "@/services/interviewServices";

type Action = "start" | "review";

export default function ResumeActions() {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [review, setReview] = useState<ResumeReview | null>(null);

  const chooseFile = (nextAction: Action) => {
    setAction(nextAction);
    fileInput.current?.click();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const selectedAction = action;
    event.target.value = "";
    if (!file || !selectedAction || busy) return;

    setBusy(selectedAction);
    setReview(null);
    try {
      if (selectedAction === "start") {
        const result = await interviewService.startFromResume(
          file,
          "Intermediate",
          "Technical Interview",
        );
        navigate(`/interview/${result.interviewId}`);
        return;
      }

      const result = await interviewService.reviewResume(file);
      setReview(result);
      toast.success("Resume review is ready.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Could not process the resume. Please try again.",
      );
    } finally {
      setBusy(null);
      setAction(null);
    }
  };

  const renderList = (title: string, items: string[]) =>
    items.length > 0 && (
      <section>
        <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>
    );

  return (
    <section className="space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Use your resume
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Upload a PDF or DOCX (up to 5 MB). Resume text is sent to the AI
          provider to generate results and is not saved by InterviewAI.
        </p>
        <p className="mt-1 text-sm text-muted">
          Resume interviews use an intermediate technical interview format.
        </p>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFile}
        aria-label="Choose a PDF or DOCX resume"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
          onClick={() => chooseFile("start")}
          loading={busy === "start"}
          disabled={busy !== null}
        >
          Upload &amp; Start Interview
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-border text-foreground"
          onClick={() => chooseFile("review")}
          loading={busy === "review"}
          disabled={busy !== null}
        >
          Review resume
        </Button>
      </div>

      {review && (
        <div
          className="space-y-5 border-t border-border pt-5"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              Resume review
            </h3>
            {review.atsScore !== null && (
              <p className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground">
                ATS readiness estimate:{" "}
                <strong className="tabular-nums">{review.atsScore}/100</strong>
              </p>
            )}
          </div>

          {review.summary && (
            <p className="text-sm leading-6 text-secondary">{review.summary}</p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {renderList("What works well", review.strengths)}
            {renderList("Suggested improvements", review.improvements)}
            {renderList(
              "ATS-friendly template and formatting",
              review.formattingSuggestions,
            )}
            {renderList(
              "Keywords to consider learning",
              review.keywordsToConsider,
            )}
            {renderList("Recommended learning topics", review.learningTopics)}
            {renderList("Questions to practice", review.practiceQuestions)}
          </div>

          {review.bulletSuggestions.length > 0 && (
            <section>
              <h4 className="mb-3 font-semibold text-foreground">
                ATS-friendly content suggestions
              </h4>
              <div className="space-y-3">
                {review.bulletSuggestions.map((item, index) => (
                  <div
                    key={`bullet-${index}`}
                    className="rounded-lg border border-border bg-surface-elevated p-4 text-sm"
                  >
                    <p className="font-semibold text-neutral-800">
                      {item.original}
                    </p>

                    <p className="mt-2 text-sm font-normal text-neutral-600">
                      {item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
