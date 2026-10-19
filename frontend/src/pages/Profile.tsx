import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";
import Navbar from "@/components/dashboard/DashboardNavbar";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
    
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
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