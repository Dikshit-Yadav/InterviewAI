import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "@/components/dashboard/DashboardNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileInfo from "@/components/profile/ProfileInfo";
import EditProfileModal from "@/components/profile/EditProfileModal";
import {
  getProfile,
  type ProfileResponse,
  type UserProfile,
} from "@/services/profileService";

export default function Profile() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfileData(data);

      if (data.user) {
        if (data.user.name) sessionStorage.setItem("name", JSON.stringify(data.user.name));
        if (data.user.targetRole) sessionStorage.setItem("role", JSON.stringify(data.user.targetRole));
        if (data.user.email) sessionStorage.setItem("email", JSON.stringify(data.user.email));
      }
    } catch (err: unknown) {
      console.error("Failed to load user profile:", err);
      const storedName = JSON.parse(sessionStorage.getItem("name") || '"User"');
      const storedEmail = JSON.parse(sessionStorage.getItem("email") || '""');
      const storedRole = JSON.parse(sessionStorage.getItem("role") || '"Full Stack Developer"');

      setProfileData({
        user: {
          _id: "local",
          name: storedName,
          email: storedEmail,
          targetRole: storedRole,
          experience: "Intermediate",
          skills: [],
        },
        stats: {
          totalInterviews: 0,
          avgScore: 0,
          completedInterviews: 0,
          latestInterview: null,
        },
      });
      setError("Could not sync latest cloud profile data. Showing cached profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      void fetchProfileData();
    }, 0);
    return () => window.clearTimeout(fetchTimer);
  }, [fetchProfileData]);

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    setProfileData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link
              to="/dashboard"
              className="hover:text-foreground transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-foreground font-medium">Candidate Profile</span>
          </div>

          <button
            onClick={fetchProfileData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-gray-400 hover:text-foreground transition cursor-pointer"
            title="Refresh profile data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProfileData}
              className="underline font-medium hover:text-amber-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !profileData ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-2xl bg-white/5 border border-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-white/5 border border-white/10" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 rounded-2xl bg-white/5 border border-white/10" />
              <div className="h-72 rounded-2xl bg-white/5 border border-white/10" />
            </div>
          </div>
        ) : profileData ? (
          <>
            {/* 1. Profile Hero & Identity Header */}
            <ProfileHeader
              user={profileData.user}
              onEditClick={() => setIsEditModalOpen(true)}
            />

            {/* 2. Real-Time Interview Performance Metrics */}
            <ProfileStats
              stats={profileData.stats}
              strongstSkill={profileData.user.strongstSkill}
              weakestSkill={profileData.user.weakestSkill}
            />

            {/* 3. Detailed Professional Bio, Skills Cloud & Career Info */}
            <ProfileInfo
              user={profileData.user}
              onEditClick={() => setIsEditModalOpen(true)}
            />

            {/* 4. Edit Profile Modal Dialog */}
            <EditProfileModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              user={profileData.user}
              onSuccess={handleProfileUpdated}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
