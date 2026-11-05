import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FileText,
  Star,
  MapPin,
  Phone,
  Mail,
  Plus,
} from "lucide-react";
import { Github, Linkedin } from "@/components/ui/BrandIcons";
import type { UserProfile } from "@/services/profileService";

type Props = {
  user: UserProfile;
  onEditClick: () => void;
};

export default function ProfileInfo({ user, onEditClick }: Props) {
  const hasSkills = user.skills && user.skills.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              Professional Summary
            </h3>
            <button
              onClick={onEditClick}
              className="text-xs text-gray-400 hover:text-foreground transition cursor-pointer"
            >
              Edit
            </button>
          </div>

          {user.bio && user.bio.trim() ? (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {user.bio}
            </p>
          ) : (
            <div className="py-6 px-4 rounded-xl border border-dashed border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">
                You haven&apos;t added a professional summary yet.
              </p>
              <button
                onClick={onEditClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-foreground transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Professional Bio
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand" />
              <h3 className="text-base font-semibold text-foreground">
                Technical Skills & Scope
              </h3>
              {hasSkills && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                  {user.skills.length}
                </span>
              )}
            </div>
            <button
              onClick={onEditClick}
              className="text-xs text-gray-400 hover:text-foreground transition cursor-pointer"
            >
              Manage Skills
            </button>
          </div>

          {hasSkills ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => {
                const isStrongest =
                  user.strongstSkill &&
                  user.strongstSkill.toLowerCase() === skill.toLowerCase();
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                      isStrongest
                        ? "bg-brand/20 text-brand-hover border-brand/40 shadow-sm"
                        : "bg-white/5 text-gray-200 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {isStrongest && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    <span>{skill}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="py-6 px-4 rounded-xl border border-dashed border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">
                No technical skills added yet. Add your tech stack to tailor interview questions.
              </p>
              <button
                onClick={onEditClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-foreground transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Your Skills
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand" />
            Career Overview
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Target Role</span>
              <p className="text-sm font-medium text-foreground">
                {user.targetRole || "Software Engineer"}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-gray-400 block mb-1">Experience Level</span>
              <p className="text-sm font-medium text-foreground">
                {user.experience || "Intermediate"}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-gray-400 block mb-1">Education</span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                {user.education && user.education.trim() ? user.education : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-brand" />
            Contact & Links
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>

            {user.phone ? (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-4 h-4 text-gray-600 shrink-0" />
                <span>Phone not provided</span>
              </div>
            )}

            {user.location ? (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{user.location}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
                <span>Location not provided</span>
              </div>
            )}

            {user.github && (
              <div className="flex items-center gap-2 text-gray-300 pt-1 border-t border-white/5">
                <Github className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{user.github}</span>
              </div>
            )}

            {user.linkedin && (
              <div className="flex items-center gap-2 text-gray-300">
                <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{user.linkedin}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
