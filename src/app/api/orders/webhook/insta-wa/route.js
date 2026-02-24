import { NextResponse } from "next/server";
import Message from "../../../../../models/Message";
import dbConnect from "@/lib/db/connection";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
      throw new Error("Please define the VERIFY_TOKEN environment variable");
    }

    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Handle webhook verification
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log("Webhook verification failed");
      return NextResponse.json(
        { error: "Verification token mismatch" },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Connect to MongoDB
    console.log("webhook called");

    await dbConnect();

    const payload = await request.json();
    console.log("Raw payload:", JSON.stringify(payload, null, 2)); // Log full payload for debugging

    // Construct message data from the new payload structure
    const messageData = {
      senderId: payload.sender_psid,
      recipientId: payload.recipient_page_id,
      timestamp: new Date(payload.time),
      message: payload.text || "No text content",
      mid: payload.id,
      eventType: "message",
      isEcho: false,
      senderFirstName: payload.sender_first_name,
      senderLastName: payload.sender_last_name,
      senderFullName: payload.sender_full_name,
      locale: payload.locale,
      timezone: payload.timezone,
    };

    // Log the message to console
    console.log("Received Message:", JSON.stringify(messageData, null, 2));

    // Save to MongoDB
    try {
      const existingMessage = await Message.findOne({
        mid: messageData.mid,
      });
      if (!existingMessage) {
        const newMessage = new Message(messageData);
        await newMessage.save();
        console.log("Message saved to MongoDB:", messageData.mid);
      } else {
        console.log("Duplicate message skipped:", messageData.mid);
      }
    } catch (dbError) {
      console.error("Error saving message to MongoDB:", dbError);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}