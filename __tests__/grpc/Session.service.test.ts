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

const userId = [uuid(), uuid()]
let sessionId = ['', '']
test('セッションAを作成する', (done) => {
  client.startSession({ userId: userId[0] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId[0])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId[0] = res?.session?.sessionId ?? ''
    done()
  })
})
test('セッションBを作成する', (done) => {
  client.startSession({ userId: userId[1] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId[1])
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId[1] = res?.session?.sessionId ?? ''
    done()
  })
})

test('存在するセッションAを返す', (done) => {
  client.getSession({ sessionId: sessionId[0] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.userId).toEqual(userId[0])
    expect(res?.sessionId).toEqual(sessionId[0])
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

test('セッションAを消去する', (done) => {
  client.deleteSession({ sessionId: sessionId[0] }, (err, res) => {
    expect(err).toBeNull()
    done()
  })
})

test('存在しないセッションを消去するとエラーを返す', (done) => {
  client.deleteSession({ sessionId: uuid() }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在しないセッション(空文字列)を消去するとエラーを返す', (done) => {
  client.deleteSession({ sessionId: '' }, (err, res) => {
    expect(err?.code).toBe(3)
    done()
  })
})

test('消去したセッションAを得ようとしてもエラーを返す', (done) => {
  client.getSession({ sessionId: sessionId[0] }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

test('存在するセッションBを返す', (done) => {
  client.getSession({ sessionId: sessionId[1] }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.userId).toEqual(userId[1])
    expect(res?.sessionId).toEqual(sessionId[1])
    done()
  })
})

afterAll(() => {
  stopGrpcServer()
  prismaClient.$disconnect()
})
