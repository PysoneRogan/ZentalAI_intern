import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0'

export const dynamic = 'force-dynamic'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: 'openid profile email'
    }
  }),
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL
  })
})