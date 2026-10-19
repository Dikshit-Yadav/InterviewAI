import { API } from "../api/axios";
import { profileSchema, type ProfileFormData } from "@/lib/validation";

export const updateProfile = async (data: ProfileFormData) => {
    const validated = profileSchema.parse(data);
    const res = await API.put("/profile/update", validated);
    return res.data;
}
