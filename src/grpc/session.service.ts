import { Status } from '@grpc/grpc-js/build/src/constants'
import dayjs from 'dayjs'
import {
  SessionService,
  StartSessionResponse,
  DeleteSessionResponse,
} from '../../generated'
import { sessionLifeTimeHours } from '../constant'
import {
  createSession,
  findActiveSessionById,
  deleteSessionById,
} from '../database/session'
import { GrpcServer } from './type'
import { transformSession } from './transformer'

export const sessionService: GrpcServer<SessionService> = {
  async startSession({ request }, callback) {
    if (!request.userId) {
      return callback({ code: Status.INVALID_ARGUMENT })
    }
    const session = await createSession({
      userId: request.userId,
      expiredAt: dayjs().add(sessionLifeTimeHours, 'hour'),
    })

    callback(
      null,
      StartSessionResponse.create({
        session: transformSession(session),
        cookieOptions: {
          secure: true,
          expires: session.expired_at.toUTCString(),
        },
      })
    )
  },
  async getSession({ request }, callback) {
    if (!request.sessionId) {
      return callback({ code: Status.INVALID_ARGUMENT })
    }
    const session = await findActiveSessionById({
      id: request.sessionId,
    })

    if (!session) {
      return callback({ code: Status.NOT_FOUND })
    }

    callback(null, transformSession(session))
  },
  async deleteSession({ request }, callback) {
    if (!request.sessionId) {
      return callback({ code: Status.INVALID_ARGUMENT })
    }

    try {
      await deleteSessionById({
        id: request.sessionId,
      })
    } catch {
      return callback({ code: Status.NOT_FOUND })
    }

    callback(null, DeleteSessionResponse.create())
  },
}
