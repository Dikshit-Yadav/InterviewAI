import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { ProfileStatsData } from "@/services/profileService";

type Props = {
  stats: ProfileStatsData;
  strongstSkill?: string;
  weakestSkill?: string;
};

export default function ProfileStats({ stats, strongstSkill, weakestSkill }: Props) {
  const navigate = useNavigate();

  const getScoreRating = (score: number) => {
    if (score >= 8.5) return { label: "Top Tier", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 7.0) return { label: "Proficient", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    if (score >= 5.0) return { label: "Intermediate", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "In Training", color: "text-gray-400 bg-white/5 border-white/10" };
  };

  const scoreRating = getScoreRating(stats.avgScore || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand" />
          Interview Performance & Metrics
        </h2>
        <span className="text-xs text-gray-400">
          Updated in real time from AI evaluations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Assessments
            </span>
            <div className="p-2 rounded-lg bg-white/5 text-gray-300 border border-white/5">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {stats.totalInterviews}
            </span>
            <span className="text-xs text-gray-400">sessions</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.completedInterviews || 0} evaluated reports</span>
          </p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-lg bg-white/5 text-amber-300 border border-white/5">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "N/A"}
            </span>
            {stats.avgScore > 0 && (
              <span className="text-xs text-gray-400">/ 10</span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${scoreRating.color} ml-auto`}>
              {scoreRating.label}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (stats.avgScore / 10) * 100))}%` }}
            />
          </div>
        </div>

        {/* Strongest Skill */}
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Top Strength
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-semibold text-foreground truncate" title={strongstSkill || "Pending evaluation"}>
            {strongstSkill && strongstSkill.trim() ? strongstSkill : "Evaluating..."}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Highest consistent rubric rating
          </p>
        </div>

        {/* Target Area */}
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Growth Focus
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-semibold text-foreground truncate" title={weakestSkill || "None flagged"}>
            {weakestSkill && weakestSkill.trim() ? weakestSkill : "Balanced Performance"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Target area for mock interview practice
          </p>
        </div>
      </div>

      {/* Latest Interview Activity Banner if available */}
      {stats.latestInterview && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Latest Interview: {stats.latestInterview.role}
              </p>
              <p className="text-xs text-gray-400">
                {stats.latestInterview.interviewType} • Completed{" "}
                {new Date(stats.latestInterview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/report/${stats.latestInterview?._id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-foreground transition shrink-0 cursor-pointer"
          >
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
