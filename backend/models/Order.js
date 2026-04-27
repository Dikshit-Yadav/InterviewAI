import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryAddress: String,
    feedback: String,
    rating: Number,
    restaurant: {
        type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    items: [
        {
            food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
            quantity: Number,
        },
    ],
    status: {
        type: String,
        enum: ["placed", "preparing", "delivered"],
        default: "placed",
    },
    payment: {
        type: String,
        enum: ["cash", "online"],
        default: "cash",
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryMan: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

});

export default mongoose.model("Order", orderSchema);
