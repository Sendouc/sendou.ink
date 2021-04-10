import { Prisma } from "@prisma/client";
import { httpError } from "@trpc/server";
import prisma from "prisma/client";
import { freeAgentPostSchema } from "utils/validators/fapost";
import * as z from "zod";

export type PostsData = Prisma.PromiseReturnType<typeof posts>;

const posts = async () => {
  const dateMonthAgo = new Date();
  dateMonthAgo.setMonth(dateMonthAgo.getMonth() - 1);

  return prisma.freeAgentPost.findMany({
    select: {
      id: true,
      canVC: true,
      playstyles: true,
      content: true,
      updatedAt: true,
      user: {
        select: {
          username: true,
          discordId: true,
          discriminator: true,
          discordAvatar: true,
          profile: {
            select: {
              weaponPool: true,
              country: true,
              bio: true,
            },
          },
          plusStatus: {
            select: {
              membershipTier: true,
            },
          },
          player: {
            select: {
              placements: {
                orderBy: {
                  xPower: "desc",
                },
                take: 1,
                select: {
                  xPower: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    where: {
      updatedAt: { gte: dateMonthAgo },
    },
  });
};

const upsertPost = async ({
  input,
  userId,
}: {
  input: z.infer<typeof freeAgentPostSchema>;
  userId: number;
}) => {
  return prisma.freeAgentPost.upsert({
    create: { ...input, user: { connect: { id: userId } } },
    update: { ...input },
    where: { userId },
  });
};

const deletePost = async (userId: number) => {
  return prisma.freeAgentPost.delete({ where: { userId } });
};

const likes = async (userId: number) => {
  const post = await prisma.freeAgentPost.findUnique({
    where: { userId },
    include: {
      likedPosts: { select: { id: true } },
      likersPosts: { select: { id: true, updatedAt: true } },
    },
  });

  const dateMonthAgo = new Date();
  dateMonthAgo.setMonth(dateMonthAgo.getMonth() - 1);

  if (!post || post.updatedAt.getTime() < dateMonthAgo.getTime()) {
    throw httpError.badRequest("no post");
  }

  const likerPostIds = new Set(
    post.likersPosts
      .filter((post) => post.updatedAt.getTime() >= dateMonthAgo.getTime())
      .map((post) => post.id)
  );

  return {
    likedPostIds: post.likedPosts.map((post) => post.id),
    matchedPostIds: post.likedPosts
      .filter((post) => likerPostIds.has(post.id))
      .map((post) => post.id),
  };
};

const addLike = ({ userId, postId }: { userId: number; postId: number }) => {
  return prisma.freeAgentPost.update({
    where: { userId },
    data: { likedPosts: { connect: { id: postId } } },
  });
};

const deleteLike = ({ userId, postId }: { userId: number; postId: number }) => {
  return prisma.freeAgentPost.update({
    where: { userId },
    data: { likedPosts: { disconnect: { id: postId } } },
  });
};

export default {
  posts,
  upsertPost,
  deletePost,
  likes,
  addLike,
  deleteLike,
};
