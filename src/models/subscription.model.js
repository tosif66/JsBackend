import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
            required: true
        },
        channel: {
            type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
            ref: "User",
            required: true
        }
    }, { timestamps: true })

subscriptionSchema.index(
    { channel: 1, subscriber: 1 },
    { unique: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema)