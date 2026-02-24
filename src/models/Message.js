import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // Maps to payload.sender_psid
    recipientId: { type: String, required: true }, // Maps to payload.recipient_page_id
    timestamp: { type: Date, required: true }, // Maps to payload.time
    message: { type: String, required: true }, // Maps to payload.text
    mid: { type: String, required: true, unique: true }, // Maps to payload.id
    eventType: { type: String, default: "message" }, // Hardcoded as "message"
    isEcho: { type: Boolean, default: false }, // Not present in new payload, defaults to false
    senderFirstName: { type: String }, // Maps to payload.sender_first_name
    senderLastName: { type: String }, // Maps to payload.sender_last_name
    senderFullName: { type: String }, // Maps to payload.sender_full_name
    locale: { type: String }, // Maps to payload.locale
    timezone: { type: String }, // Maps to payload.timezone
  },
  { timestamps: true },
);

// Export the model, reusing it if already defined to avoid OverwriteModelError
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
