import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'user'
      organizationId: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'admin' | 'user'
    organizationId: string
  }
} 