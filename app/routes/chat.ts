import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { MAX_CHAT_MESSAGE_LENGTH } from "~/constants";
import * as ChatMessage from "~/models/ChatMessage.server";
import {
  parseRequestFormData,
  getSocket,
  requireUser,
  Unpacked,
} from "~/utils";

export const chatActionSchema = z.object({
  message: z.string().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
  roomId: z.string().uuid(),
});

export interface ChatActionData {
  createdMessage: Unpacked<ChatLoaderData["messages"]>;
}

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: chatActionSchema,
  });
  const user = requireUser(context);
  const socket = getSocket(context);

  const messageFromDb = await ChatMessage.create({
    content: data.message,
    roomId: data.roomId,
    userId: user.id,
  });

  const createdMessage = {
    content: messageFromDb.content,
    createdAtTimestamp: messageFromDb.createdAt.getTime(),
    id: messageFromDb.id,
    roomId: messageFromDb.roomId,
    sender: {
      id: user.id,
    },
  };

  socket.emit(`chat-${data.roomId}`, createdMessage);

  return json<ChatActionData>({
    createdMessage,
  });
};

export interface ChatLoaderData {
  messages: {
    id: number;
    content: string;
    sender: {
      id: string;
    };
    createdAtTimestamp: number;
    roomId: string;
  }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const ids = new URL(request.url).searchParams.getAll("id");
  if (ids.length === 0) return new Response(null, { status: 400 });

  const messages = await ChatMessage.findByRoomIds(ids);

  return json<ChatLoaderData>({
    messages: messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      createdAtTimestamp: msg.createdAt.getTime(),
      roomId: msg.roomId,
      sender: {
        id: msg.sender.id,
        discordName: msg.sender.discordName,
      },
    })),
  });
};
