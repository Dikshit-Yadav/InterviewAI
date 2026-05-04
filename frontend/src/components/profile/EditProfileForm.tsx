import { useState } from "react";
import { Button } from "@/components/ui/button";
import {updateProfile} from "@/services/profileService";

export default function EditProfileForm() {
  const uname = JSON.parse(sessionStorage.getItem("name"));
  const urole = JSON.parse(sessionStorage.getItem("role"));


  const [name, setName] = useState(uname || "");
  const [role, setRole] = useState(urole || "");

  const handleUpdate = async () => {
    try {
      const data = { name, role };
      const res = await updateProfile(data);
      console.log(res);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
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

      <Button onClick={handleUpdate}>
        Save Changes
      </Button>
    </div>
  );
}