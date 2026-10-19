import { Button } from "@/components/ui/button"
import { useState } from "react"
import {useNavigate} from "react-router-dom"
import {interviewService} from "@/services/interviewServices"
import { toast } from "react-toastify"
import { interviewStartSchema } from "@/lib/validation"

type Props = {
  role: string | null
  experience: string | null
  interviewType: string | null
}

export default function FooterBar({
  role,
  experience,
  interviewType,
}: Props) {
  const navigate = useNavigate();
  const isReady = role && experience && interviewType
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (loading) return
    const validation = interviewStartSchema.safeParse({
      role,
      experience,
      interviewType,
    })
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }
    setLoading(true)

    try {
      const res = await interviewService.startInterview(validation.data);
      console.log(res.interviewId);
      navigate(`/interview/${res.interviewId}`);
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the interview. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-between items-center border border-gray-800 rounded-xl p-4 bg-[#0b0f2a]">
      <div className="text-sm text-gray-400 space-y-1">
        <p>
          Role:{" "}
          <span className="text-white">
            {role || "Not selected"}
          </span>
        </p>

        <p>
          Experience:{" "}
          <span className="text-white">
            {experience || "Not selected"}
          </span>
        </p>

        <p>
          Interview Type:{" "}
          <span className="text-white">
            {interviewType || "Not selected"}
          </span>
        </p>
      </div>

      <Button
        disabled={!isReady}
        loading={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        onClick={handleStart}
      >
        {loading ? "Preparing your interview..." : "Start Interview →"}
      </Button>
    </div>
  )
}