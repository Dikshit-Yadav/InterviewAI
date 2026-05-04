import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";
import Navbar from "@/components/dashboard/DashboardNavbar";

export default function Profile() {
  return (
    <div className="bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black text-white">
      <Navbar />
    
    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <ProfileHeader />

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileInfo />
          <EditProfileForm />
        </div>

        <ProfileStats />

      </div>
    </div>
    </div>
  );
}