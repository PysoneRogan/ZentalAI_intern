import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create workout types
  console.log('Creating workout types...')
  
  const workoutTypes = await Promise.all([
    prisma.workoutType.upsert({
      where: { name: 'Cardio' },
      update: {},
      create: {
        name: 'Cardio',
        description: 'Cardiovascular exercises to improve heart health and endurance',
        color: '#10b981',
      },
    }),
    prisma.workoutType.upsert({
      where: { name: 'Strength' },
      update: {},
      create: {
        name: 'Strength',
        description: 'Resistance training to build muscle strength and mass',
        color: '#3b82f6',
      },
    }),
    prisma.workoutType.upsert({
      where: { name: 'Yoga' },
      update: {},
      create: {
        name: 'Yoga',
        description: 'Mind-body practice combining physical poses, breathing, and meditation',
        color: '#f59e0b',
      },
    }),
    prisma.workoutType.upsert({
      where: { name: 'Swimming' },
      update: {},
      create: {
        name: 'Swimming',
        description: 'Full-body workout in water, excellent for joints and cardiovascular health',
        color: '#06b6d4',
      },
    }),
    prisma.workoutType.upsert({
      where: { name: 'Cycling' },
      update: {},
      create: {
        name: 'Cycling',
        description: 'Low-impact cardio exercise, great for leg strength and endurance',
        color: '#8b5cf6',
      },
    }),
    prisma.workoutType.upsert({
      where: { name: 'Running' },
      update: {},
      create: {
        name: 'Running',
        description: 'High-impact cardio exercise, builds endurance and burns calories',
        color: '#ef4444',
      },
    }),
  ])

  console.log(`Created/updated ${workoutTypes.length} workout types`)
  
  console.log('Seed data created successfully! 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })