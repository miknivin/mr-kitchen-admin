import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MessagesTable from "@/components/Tables/MessagesTable";
import dbConnect from "@/lib/db/connection";
import Message from "@/models/Message";

async function getMessages(page = 1, limit = 10) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const messages = await Message.find()
      .sort({ timestamp: -1 }) // Sort by timestamp, newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects

    // Transform messages to ensure all fields are serializable
    const serializedMessages = messages.map((message) => ({
      ...message,
      _id: message._id.toString(), // Convert ObjectId to string
      timestamp: message.timestamp.toISOString(), // Convert Date to ISO string
      createdAt: message.createdAt.toISOString(), // Convert Date to ISO string
      updatedAt: message.updatedAt.toISOString(), // Convert Date to ISO string
    }));

    const totalMessages = await Message.countDocuments();
    return { allMessages: serializedMessages, totalMessages, error: null };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      allMessages: [],
      totalMessages: 0,
      error: "Failed to fetch messages",
    };
  }
}

export default async function page({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const limit = parseInt(searchParams.limit) || 10;

  const data = await getMessages(page, limit);
  return (
    <>
      <DefaultLayout>
        <MessagesTable data={data} page={page} limit={limit} />
      </DefaultLayout>
    </>
  );
}
