import { describe } from 'mocha'
import { RowanTreeAuthServiceClient, Token } from '../../src'

import { config } from 'dotenv'
config({ path: 'env/.env.offline' })

describe('Auth Service Client Tests', function (): void {
  const client: RowanTreeAuthServiceClient = new RowanTreeAuthServiceClient({ sleepTime: 2, retryCount: 5 })

  before(async function (): Promise<void> {})
  after(async function (): Promise<void> {})

  describe('Authenticate User Command Tests', function () {
    describe('authUser', function () {
      it('should authenticate a user', async function (): Promise<void> {
        const token: Token = await client.authUser('joshburt', 'ed407fad')
        console.log(token)
      })
    })
  })
})
