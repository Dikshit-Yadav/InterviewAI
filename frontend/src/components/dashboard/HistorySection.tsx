import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import type { InterviewHistoryItem } from "@/types/api";

type Props = {
  history: InterviewHistoryItem[];
  defaultPageSize?: number;
};

export default function HistorySection({ history, defaultPageSize = 5 }: Props) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, history.length);

  const currentItems = useMemo(() => {
    return history.slice(startIndex, endIndex);
  }, [history, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "terminated":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Terminated
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <PlayCircle className="w-3 h-3" />
            In Progress
          </span>
        );
    }
  };

  // Helper to generate page buttons with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 mt-8 shadow-sm">
      {/* Header with Title, Count Badge, and Page Size Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              Interview History
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                {history.length} {history.length === 1 ? "interview" : "interviews"}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review your past performance, AI rubrics, and detailed evaluation reports
            </p>
          </div>
        </div>

        {history.length > 5 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black/30 border border-white/15 rounded-md px-2.5 py-1 text-xs text-gray-200 outline-none focus:border-white/30 cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        )}
      </div>

      {/* History Items or Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02]">
          <div className="inline-flex p-3 rounded-full bg-white/5 text-gray-400 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-gray-300">No interviews yet</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Take your first technical or behavioral AI interview to generate comprehensive reports and track your progress.
          </p>
          <button
            onClick={() => navigate("/interview")}
            className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((h) => (
            <div
              key={h._id}
              onClick={() => navigate(`/report/${h._id}`)}
              className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-white/5 text-gray-300 border border-white/5 group-hover:border-white/20 transition shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground group-hover:text-primary transition">
                      {h.role}
                    </p>
                    {getStatusBadge(h.status)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{h.experience}</span>
                    <span>•</span>
                    <span>{h.interviewType}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {new Date(h.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-foreground transition">
                  <span className="hidden sm:inline">View Report</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {history.length > 0 && totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 order-2 sm:order-1">
            Showing <span className="font-medium text-gray-200">{startIndex + 1}</span>–
            <span className="font-medium text-gray-200">{endIndex}</span> of{" "}
            <span className="font-medium text-gray-200">{history.length}</span> interviews
          </p>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-foreground hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {getPageNumbers().map((page, idx) =>
              typeof page === "number" ? (
                <button
                  key={idx}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition ${
                    safePage === page
                      ? "bg-white/20 text-white font-semibold border border-white/25 shadow-sm"
                      : "text-gray-400 hover:text-foreground hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-1 text-gray-500 text-xs">
                  {page}
                </span>
              )
            )}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-foreground hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
