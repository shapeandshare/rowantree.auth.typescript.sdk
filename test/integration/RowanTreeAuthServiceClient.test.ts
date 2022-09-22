import { describe } from 'mocha'
import { RowanTreeAuthServiceClient, Token } from '../../src'

import { config } from 'dotenv'
import { User } from '../../src/types/User'
config({ path: 'env/.env.offline' })

describe('Auth Service Client Tests', function (): void {
  const client: RowanTreeAuthServiceClient = new RowanTreeAuthServiceClient({ sleepTime: 2, retryCount: 5, timeout: 5, tld: '<<>>' })

  before(async function (): Promise<void> {})
  after(async function (): Promise<void> {})

  describe('Authenticate User Command Tests', function () {
    describe('userAuth', function () {
      it('should authenticate a user', async function (): Promise<void> {
        const username: string = 'mockuser'
        const password: string = 'mockpassword'
        const token: Token = await client.authUser(username, password)
        console.log(token)
      })
    })
  })

  describe.only('Register User Command Tests', function () {
    describe('userRegister', function () {
      it('should register a user', async function (): Promise<void> {
        const username: string = 'test'
        const password: string = 'test'
        const email: string = 'test@localhost.local'
        const user: User = await client.registerUser(username, password, email)
        console.log(user)
      })
    })
  })
})
