import dotenv from 'dotenv'
dotenv.config()

import { startGrpcServer } from './grpc'
import { logger } from './logger'

async function main() {
  logger.info('starting...')
  await startGrpcServer()
}

main()
