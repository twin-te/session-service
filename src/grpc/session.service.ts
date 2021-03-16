import { Status } from '@grpc/grpc-js/build/src/constants'
import dayjs from 'dayjs'
import { google, SessionService, StartSessionResponse } from '../../generated'
import { sessionLifeTimeHours } from '../constant'
import { createSession, findActiveSessionById } from '../database/session'
import { GrpcServer } from './type'
import { transformSession } from './transformer'

export const sessionService: GrpcServer<SessionService> = {
  async startSession({ request }, callback) {
    const session = await createSession({
      userId: request.userId,
      expiredAt: dayjs().add(sessionLifeTimeHours, 'hour'),
    })

    callback(
      null,
      StartSessionResponse.create({
        session: transformSession(session),
      })
    )
  },
  async getSession({ request }, callback) {
    const session = await findActiveSessionById({
      id: request.sessionId,
    })

    if (!session) {
      return callback({ code: Status.NOT_FOUND })
    }

    callback(null, transformSession(session))
  },
}
