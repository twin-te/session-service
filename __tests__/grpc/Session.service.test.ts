import { startGrpcServer, stopGrpcServer } from '../../src/grpc'
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

const userId = uuid()
let sessionId = ''

test('セッションを作成する', (done) => {
  client.startSession({ userId }, (err, res) => {
    expect(err).toBeNull()
    expect(res?.session?.userId).toEqual(userId)
    expect(res?.session?.sessionId).not.toBeNull()
    sessionId = res?.session?.sessionId ?? ''
    console.log(res)
    done()
  })
})

test('存在するセッションを返す', (done) => {
  client.getSession({ sessionId }, (err, res) => {
    console.log(err)
    expect(err).toBeNull()
    expect(res?.userId).toEqual(userId)
    expect(res?.sessionId).toEqual(sessionId)
    done()
  })
})

test('存在しないセッションでエラーを返す', (done) => {
  client.getSession({ sessionId: uuid() }, (err, res) => {
    expect(err?.code).toBe(5)
    done()
  })
})

//未実装
// test('セッションを消去する', (done) => {
//   client.deleteSession({ sessionId }, (err, res) => {
//     expect(err).toBeNull()
//     done()
//   })
// })

// test('存在しないセッションを消去するとエラーを返す', (done) => {
//   client.deleteSession({ sessionId: uuid() }, (err, res) => {
//     expect(err?.code).toBe(5)
//     done()
//   })
// })

// test('消去したセッションを得ようとしてもエラーを返す', (done) => {
//   client.getSession({ sessionId }, (err, res) => {
//     expect(err?.code).toBe(5)
//     done()
//   })
// })

afterAll(stopGrpcServer)
