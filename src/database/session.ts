import { Session } from '@prisma/client'
import { prismaClient } from './prisma-client'
import { v4 as uuid } from 'uuid'
import { Dayjs } from 'dayjs'

export async function createSession({
  userId,
  expiredAt,
}: {
  userId: string
  expiredAt: Dayjs
}): Promise<Session> {
  const id = uuid()
  return await prismaClient.session.create({
    data: { id, user_id: userId, expired_at: expiredAt.toDate() },
  })
}

export async function findActiveSessionById({
  id,
}: {
  id: string
}): Promise<Session | null> {
  const now = new Date()
  return await prismaClient.session.findFirst({
    where: {
      id,
      expired_at: { gt: now },
    },
  })
}

export async function deleteSessionBySessionId({
  sessionId,
}: {
  sessionId: string
}): Promise<{ id: string } | null> {
  return await prismaClient.session.delete({
    where: {
      id: sessionId,
    },
  })
}

export async function deleteSessionByUserId({ userId }: { userId: string }) {
  return await prismaClient.session.deleteMany({
    where: {
      user_id: userId,
    },
  })
}
