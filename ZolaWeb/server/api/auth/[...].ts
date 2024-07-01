import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import axios from '@/utils/axios'

export default NuxtAuthHandler({
  // secret needed to run nuxt-auth in production mode (used to encrypt data)
  secret: process.env.NUXT_SECRET,
  pages: {
    // Change the default behavior to use `/login` as the path for the sign-in page
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text', placeholder: '(hint: jsmith)' },
        password: { label: 'Password', type: 'password', placeholder: '(hint: hunter2)' },
      },
      authorize: async (credentials: any) => {
        try {
          const runtimeConfig = useRuntimeConfig()
          const { data: res } = await axios.post(runtimeConfig.public.apiBase + '/auth/login', credentials)
          console.log('res', res)
          // If no error and we have user data, return it
          if (res.data?.user) {
            return {
              ...res.data?.user,
              access_token: res.data?.access_token,
            }
          }
        } catch (e) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Credentials not working',
          })
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      const isSignIn = !!user
      if (isSignIn) {
        token.jwt = user ? (user as any).access_token || '' : ''
        token.id = user ? user.id || '' : ''
      }
      return Promise.resolve(token)
    },
    session: ({ session, token }) => {
      ;(session as any).jwt = token.jwt
      ;(session as any).id = token.id
      return Promise.resolve(session)
    },
  },
})
