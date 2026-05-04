import { API } from "../api/axios";

export const updateProfile = async (data) => {
    const res = await API.put("/profile/update", data);
    return res.data;
}
