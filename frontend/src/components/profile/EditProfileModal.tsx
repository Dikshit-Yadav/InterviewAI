import { useState, useEffect } from "react";
import {
  X,
  Plus,
  LoaderCircle,
  Save,
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Code2,
  FileText,
  Star,
  Target,
} from "lucide-react";
import { Github, Linkedin } from "@/components/ui/BrandIcons";
import { toast } from "react-toastify";
import { updateProfile, type UserProfile } from "@/services/profileService";
import { profileSchema } from "@/lib/validation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
};

const SUGGESTED_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Next.js",
  "System Design",
  "GraphQL",
  "Tailwind CSS",
  "Express.js",
  "Data Structures",
];

function EditProfileModalContent({
  isOpen,
  onClose,
  user,
  onSuccess,
}: Props) {
  const [name, setName] = useState(user.name || "");
  const [targetRole, setTargetRole] = useState(user.targetRole || "");
  const [experience, setExperience] = useState(user.experience || "Intermediate");
  const [education, setEducation] = useState(user.education || "");
  const [bio, setBio] = useState(user.bio || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState(user.location || "");
  const [github, setGithub] = useState(user.github || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [strongstSkill, setStrongstSkill] = useState(user.strongstSkill || "");
  const [weakestSkill, setWeakestSkill] = useState(user.weakestSkill || "");

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "skills" | "about">("general");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added to your skills.`);
      return;
    }
    if (skills.length >= 25) {
      toast.warn("You can add up to 25 technical skills.");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    if (strongstSkill === skillToRemove) setStrongstSkill("");
    if (weakestSkill === skillToRemove) setWeakestSkill("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      name: name.trim(),
      targetRole: targetRole.trim(),
      experience: experience.trim(),
      education: education.trim(),
      bio: bio.trim(),
      skills,
      strongstSkill: strongstSkill.trim(),
      weakestSkill: weakestSkill.trim(),
      location: location.trim(),
      phone: phone.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
    };

    const validation = profileSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setLoading(true);
    try {
      const response = await updateProfile(validation.data);


      sessionStorage.setItem("name", JSON.stringify(response.user.name));
      sessionStorage.setItem("role", JSON.stringify(response.user.targetRole));

      toast.success("Profile updated successfully!");
      onSuccess(response.user);
      onClose();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(message || "Could not update your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      <div className="relative w-full max-w-2xl bg-surface-elevated border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand/20 text-brand-hover">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Edit Candidate Profile
              </h2>
              <p className="text-xs text-gray-400">
                Update your professional info, skills, and background
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-foreground hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 border-b border-white/10 flex gap-4 text-xs font-medium bg-white/[0.01]">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            General & Career
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "skills"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Skills & Tech Stack ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "about"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Bio & Social Links
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === "general" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Target Role <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Experience Level
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition cursor-pointer"
                    >
                      <option value="Beginner">Beginner / Entry-Level (0-2 yrs)</option>
                      <option value="Intermediate">Intermediate / Mid-Level (2-5 yrs)</option>
                      <option value="Advanced">Senior / Lead (5+ yrs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    Education / Degree
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science or Self-Taught"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA or Remote"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Add Technical Skill
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(newSkillInput);
                        }
                      }}
                      placeholder="e.g. React, Kubernetes, Go, PyTorch"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill(newSkillInput)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-foreground transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Current Skills ({skills.length})
                  </label>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/30 border border-white/10 min-h-16">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-gray-200 border border-white/15 group"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-gray-400 hover:text-rose-400 transition cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500">
                      No skills added yet. Type a skill above or click from suggestions below.
                    </div>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-400 mb-2">
                    Popular Suggestions (Click to add)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.map((suggested) => {
                      const alreadyAdded = skills.some(
                        (s) => s.toLowerCase() === suggested.toLowerCase()
                      );
                      return (
                        <button
                          key={suggested}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSkill(suggested)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            alreadyAdded
                              ? "opacity-40 cursor-not-allowed bg-transparent border-white/5 text-gray-500"
                              : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-foreground"
                          }`}
                        >
                          + {suggested}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Competency Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      Strongest Competency
                    </label>
                    <input
                      type="text"
                      value={strongstSkill}
                      onChange={(e) => setStrongstSkill(e.target.value)}
                      placeholder="e.g. React Architecture"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-400" />
                      Growth / Target Area
                    </label>
                    <input
                      type="text"
                      value={weakestSkill}
                      onChange={(e) => setWeakestSkill(e.target.value)}
                      placeholder="e.g. Dynamic Programming"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      Professional Bio & Summary
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {bio.length}/1000 characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a brief overview of your background, experience with key stacks, engineering principles, or career goals..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition resize-none"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Online Profiles & Links
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-gray-300" />
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="e.g. username or https://github.com/username"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="e.g. username or https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-foreground placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-foreground hover:bg-white/5 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditProfileModal(props: Props) {
  return <EditProfileModalContent key={JSON.stringify(props.user)} {...props} />;
}
