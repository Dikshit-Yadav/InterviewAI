import mongoose from "mongoose";
import { type } from "node:os";

const foodSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    isAvailable: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        enum: ["veg", "non-veg"],
    },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
    },

});

export default mongoose.model("Food", foodSchema);