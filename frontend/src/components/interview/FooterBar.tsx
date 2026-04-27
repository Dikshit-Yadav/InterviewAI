import { Button } from "@/components/ui/button"
import {useNavigate} from "react-router-dom"

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
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        onClick={()=> navigate("/interview/session")}
      >
        Start Interview →
      </Button>
    </div>
  )
}