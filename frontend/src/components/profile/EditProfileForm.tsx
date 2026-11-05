import { useState } from "react";
import { Edit3 } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import type { UserProfile } from "@/services/profileService";

type Props = {
  user?: UserProfile;
  onSuccess?: (user: UserProfile) => void;
};

export default function EditProfileForm({ user, onSuccess }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fallbackUser: UserProfile = user || {
    _id: "me",
    name: JSON.parse(sessionStorage.getItem("name") || '"User"'),
    email: JSON.parse(sessionStorage.getItem("email") || '""'),
    targetRole: JSON.parse(sessionStorage.getItem("role") || '"Full Stack Developer"'),
    experience: "Intermediate",
    skills: [],
  };

  return (
    <>
      <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-base mb-2">Edit Candidate Profile</h3>
          <p className="text-xs text-gray-400 mb-4">
            Update your target role, experience, tech stack, and professional summary.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-foreground transition"
        >
          <Edit3 className="w-4 h-4" />
          Open Profile Editor
        </button>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={fallbackUser}
        onSuccess={(updated) => {
          if (onSuccess) onSuccess(updated);
        }}
      />
    </>
  );
}
