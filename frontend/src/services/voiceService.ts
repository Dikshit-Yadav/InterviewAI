import {API} from "../api/axios";

export const voiceService = async ()=>{
    const res = await API.post("/voice/start");
    return res.data;
}