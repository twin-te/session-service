import dayjs from 'dayjs'
import { google, SessionService, StartSessionResponse } from '../../generated'
import { sessionLifeTimeHours } from '../constant'
import { createSession } from '../database/session'
import { GrpcServer } from './type'

export const sessionService: GrpcServer<SessionService> = {
  async startSession({ request }, callback) {
    const session = await createSession({
      userId: request.userId,
      expiredAt: dayjs().add(sessionLifeTimeHours, 'hour'),
    })

    callback(
      null,
      StartSessionResponse.create({
        session: {
          sessionId: session.id,
          userId: session.user_id,
          expiredAt: google.protobuf.Timestamp.create({
            seconds: session.expired_at.getTime() / 1000,
          }),
        },
      })
    )
  },
  getSession({ request }, callback) {
    // not implemented yet
  },
}
