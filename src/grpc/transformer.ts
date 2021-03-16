import { Session as DbSession } from '@prisma/client'
import { google, Session } from '../../generated'

export function transformSession(dbSession: DbSession): Session {
  return Session.create({
    sessionId: dbSession.id,
    userId: dbSession.user_id,
    expiredAt: google.protobuf.Timestamp.create({
      seconds: dbSession.expired_at.getTime() / 1000,
    }),
  })
}
