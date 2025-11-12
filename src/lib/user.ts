import { prisma } from '@/lib/prisma'
import type { Claims } from '@auth0/nextjs-auth0'
import type { User as DbUser } from '@prisma/client'

export type AppUser = DbUser
type Auth0User = Pick<Claims, 'sub' | 'email' | 'name' | 'picture'>

export async function getOrCreateUser(auth0User: Auth0User): Promise<AppUser> {
  if (!auth0User?.sub || !auth0User?.email) throw new Error('Invalid Auth0 user data')

  let user = await prisma.user.findUnique({ where: { auth0Id: auth0User.sub } })

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: auth0User.email } })
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { auth0Id: auth0User.sub },
      })
    } else {
      user = await prisma.user.create({
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          name:
            (auth0User.name && auth0User.name.trim().slice(0, 100)) ||
            auth0User.email.split('@')[0],
          picture: auth0User.picture ?? null,
        },
      })
    }
  } else {
    const updates: Record<string, unknown> = {}
    if (user.email !== auth0User.email) updates.email = auth0User.email
    if (auth0User.name && user.name !== auth0User.name) {
      updates.name = auth0User.name.trim().slice(0, 100)
    }
    if (auth0User.picture && user.picture !== auth0User.picture) {
      updates.picture = auth0User.picture
    }
    if (Object.keys(updates).length) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates })
    }
  }

  return user
}