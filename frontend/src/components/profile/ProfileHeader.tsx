import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Sparkles,
  ShieldCheck,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Github, Linkedin } from "@/components/ui/BrandIcons";
import type { UserProfile } from "@/services/profileService";

type Props = {
  user: UserProfile;
  onEditClick: () => void;
};

export default function ProfileHeader({ user, onEditClick }: Props) {
  const navigate = useNavigate();

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "Recently";

  const githubUrl = user.github
    ? user.github.startsWith("http")
      ? user.github
      : `https://github.com/${user.github.replace(/^@/, "")}`
    : null;

  const linkedinUrl = user.linkedin
    ? user.linkedin.startsWith("http")
      ? user.linkedin
      : `https://linkedin.com/in/${user.linkedin.replace(/^@/, "")}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 sm:p-8 backdrop-blur-md shadow-xl">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover text-white flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white/20 select-none">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md border-2 border-background"
              title="Verified Candidate"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Candidate
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300 flex-wrap">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <Briefcase className="w-4 h-4 text-brand" />
                {user.targetRole || "Software Engineer"}
              </span>
              <span className="text-gray-500">•</span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">
                {user.experience || "Intermediate"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Joined {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onEditClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium text-foreground transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/interview")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Take Interview
            </button>
          </div>

          {(githubUrl || linkedinUrl) && (
            <div className="flex items-center gap-2 pt-1">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-foreground transition cursor-pointer"
                  title="GitHub Profile"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-foreground transition cursor-pointer"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
