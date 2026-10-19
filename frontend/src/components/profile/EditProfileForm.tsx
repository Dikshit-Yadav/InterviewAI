import { useState } from "react";
import { Button } from "@/components/ui/button";
import {updateProfile} from "@/services/profileService";
import { profileSchema } from "@/lib/validation";

export default function EditProfileForm() {
  const uname = JSON.parse(sessionStorage.getItem("name") ?? "null");
  const urole = JSON.parse(sessionStorage.getItem("role") ?? "null");


  const [name, setName] = useState(uname || "");
  const [role, setRole] = useState(urole || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const validation = profileSchema.safeParse({ name, targetRole: role });
    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      await updateProfile(validation.data);
      sessionStorage.setItem("name", JSON.stringify(validation.data.name));
      sessionStorage.setItem("role", JSON.stringify(validation.data.targetRole));
      setName(validation.data.name);
      setRole(validation.data.targetRole);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Could not update your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
      <h3 className="font-semibold">Edit Profile</h3>

      <input
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <Button onClick={handleUpdate} loading={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}