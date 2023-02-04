import type { Booking, User } from "@prisma/client";

import { getEnhancedPrisma, prisma } from "~/db.server";

export type { Booking } from "@prisma/client";

export function getBooking({
  id,
  userId,
}: Pick<Booking, "id"> & {
  userId: User["id"];
}) {
  return getEnhancedPrisma(userId).booking.findFirst({
    where: { id },
    include: { user: true, invitedUsers: { include: { user: true } } },
  });
}

export function getBookingItems({ userId }: { userId: User["id"] }) {
  return getEnhancedPrisma(userId).booking.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export function createBooking({
  userId,
  email,
  notes,
  startAt,
  duration,
}: Pick<Booking, "email" | "notes" | "startAt" | "duration"> & {
  userId: User["id"];
}) {
  return getEnhancedPrisma(userId).booking.create({
    data: {
      email,
      notes,
      startAt,
      duration,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateInvite({
  userId,
  bookingId,
  inviteUserId,
  add,
}: {
  userId: User["id"];
  bookingId: Booking["id"];
  inviteUserId: User["id"];
  add: boolean;
}) {
  return getEnhancedPrisma(userId).booking.update({
    where: { id: bookingId },
    include: { invitedUsers: true },
    data: {
      invitedUsers: add
        ? {
            connectOrCreate: {
              where: {
                bookingId_userId: {
                  bookingId,
                  userId: inviteUserId,
                },
              },
              create: {
                user: {
                  connect: { id: inviteUserId },
                },
              },
            },
          }
        : {
            delete: {
              bookingId_userId: {
                bookingId,
                userId: inviteUserId,
              },
            },
          },
    },
  });
}

export function deleteBooking({
  id,
  userId,
}: Pick<Booking, "id"> & { userId: User["id"] }) {
  return getEnhancedPrisma(userId).booking.delete({
    where: { id },
  });
}
