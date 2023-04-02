import { startGrpcServer, stopGrpcServer } from '../../src/grpc'
import { prismaClient } from '../../src/database/prisma-client'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import * as grpc from '@grpc/grpc-js'
import { SessionService } from '../../generated'
import { ServiceClientConstructor } from '@grpc/grpc-js/build/src/make-client'
import { GrpcClient } from '../../src/grpc/type'
import { v4 as uuid } from 'uuid'

const def = protoLoader.loadSync(
  path.resolve(__dirname, `../../protos/SessionService.proto`)
)
const pkg = grpc.loadPackageDefinition(def)
const ClientConstructor = pkg.SessionService as ServiceClientConstructor
let client: GrpcClient<SessionService>

beforeAll(async () => {
  await startGrpcServer()
  client = (new ClientConstructor(
    'localhost:50051',
    grpc.ChannelCredentials.createInsecure()
  ) as unknown) as GrpcClient<SessionService>
})

const userId = {
  userA: uuid(),
  userB: uuid(),
  userC: uuid(),
}
let sessionId = {
  'userA-1': '',
  'userB-1': '',
  'userC-1': '',
  'userC-2': '',
}
test('セッションA-1を作成する', (done) => {
  client.startSession({ userId: userId['userA'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId['userA'])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId['userA-1'] = res?.session?.sessionId ?? ''
    done()
  })
})
test('セッションB-1を作成する', (done) => {
  client.startSession({ userId: userId['userB'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId['userB'])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId['userB-1'] = res?.session?.sessionId ?? ''
    done()
  })
})
test('セッションC-1を作成する', (done) => {
  client.startSession({ userId: userId['userC'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId['userC'])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId['userC-1'] = res?.session?.sessionId ?? ''
    done()
  })
})
test('セッションC-2(同じユーザの別セッション)を作成する', (done) => {
  client.startSession({ userId: userId['userC'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId['userC'])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId['userC-2'] = res?.session?.sessionId ?? ''
    done()
  })
})

test('存在するセッションAを返す', (done) => {
  client.getSession({ sessionId: sessionId['userA-1'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.userId).toEqual(userId['userA'])
    expect(res?.sessionId).toEqual(sessionId['userA-1'])
    done()
  })
})

test('存在しないセッションでエラーを返す', (done) => {
  client.getSession({ sessionId: uuid() }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在しないセッション(空文字列)でエラーを返す', (done) => {
  client.getSession({ sessionId: '' }, (err, res) => {
    expect(err?.code).toBe(3)
    done()
  })
})

test('セッションAをセッションIdで消去する', (done) => {
  client.deleteSessionBySessionId(
    { sessionId: sessionId['userA-1'] },
    (err, res) => {
      expect(err).toBeNull()
      done()
    }
  )
})

test('存在しないセッションをセッションIdで消去するとエラーを返す', (done) => {
  client.deleteSessionBySessionId({ sessionId: uuid() }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在しないセッション(セッションIdが空文字列)を消去するとエラーを返す', (done) => {
  client.deleteSessionBySessionId({ sessionId: '' }, (err, res) => {
    expect(err?.code).toBe(3)
    done()
  })
})

test('消去したセッションAを得ようとしてもエラーを返す', (done) => {
  client.getSession({ sessionId: sessionId['userA-1'] }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('セッションBをuserIdで消去する', (done) => {
  client.deleteSessionByUserId({ userId: userId['userB'] }, (err, res) => {
    expect(err).toBeNull()
    done()
  })
})

test('存在しないセッションをuserIdで消去するとエラーを返す', (done) => {
  client.deleteSessionByUserId({ userId: uuid() }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在しないセッション(userIdが空文字列)を消去するとエラーを返す', (done) => {
  client.deleteSessionByUserId({ userId: '' }, (err, res) => {
    expect(err?.code).toBe(3)
    done()
  })
})

test('消去したセッションBを得ようとしてもエラーを返す', (done) => {
  client.getSession({ sessionId: sessionId['userB-1'] }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在するセッションC-1を返す', (done) => {
  client.getSession({ sessionId: sessionId['userC-1'] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.userId).toEqual(userId['userC'])
    expect(res?.sessionId).toEqual(sessionId['userC-1'])
    done()
  })
})

test('セッションC-1とC-2をuserIdで消去する', (done) => {
  client.deleteSessionByUserId({ userId: userId['userC'] }, (err, res) => {
    expect(err).toBeNull()
    done()
  })
})

test('セッションC-1が消えている', (done) => {
  client.getSession({ sessionId: sessionId['userC-2'] }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('セッションC-2も消えている', (done) => {
  client.getSession({ sessionId: sessionId['userC-2'] }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

afterAll(() => {
  stopGrpcServer()
  prismaClient.$disconnect()
})
