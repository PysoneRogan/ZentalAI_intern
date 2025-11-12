import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedWorkouts() {
  // First, create a user if none exists
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      auth0Id: 'test-auth0-id-123',
      email: 'test@example.com',
      name: 'Test User'
    }
  })

  console.log(`Using user: ${user.name} (ID: ${user.id})`)
  
  // Create some workout types if they don't exist
  const workoutTypes = await Promise.all([
    prisma.workoutType.upsert({
      where: { name: 'Cardio' },
      update: {},
      create: { name: 'Cardio', description: 'Cardiovascular exercise', color: '#FF6B6B' }
    }),
    prisma.workoutType.upsert({
      where: { name: 'Strength' },
      update: {},
      create: { name: 'Strength', description: 'Weight training', color: '#4ECDC4' }
    }),
    prisma.workoutType.upsert({
      where: { name: 'Yoga' },
      update: {},
      create: { name: 'Yoga', description: 'Flexibility and mindfulness', color: '#FFE66D' }
    })
  ])

  console.log(`Created/found ${workoutTypes.length} workout types`)

  // Generate sample workouts for the last 30 days
  const workouts = []
  const now = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    
    // Random chance of having a workout each day
    if (Math.random() > 0.3) {
      const workoutType = workoutTypes[Math.floor(Math.random() * workoutTypes.length)]
      
      workouts.push({
        userId: user.id,  // Use the actual user ID
        workoutTypeId: workoutType.id,
        durationMin: Math.floor(Math.random() * 60) + 20, // 20-80 minutes
        calories: Math.floor(Math.random() * 400) + 100,  // 100-500 calories
        performedAt: date,
        notes: Math.random() > 0.7 ? 'Great workout!' : null
      })
    }
  }

  // Insert all workouts
  if (workouts.length > 0) {
    await prisma.workout.createMany({
      data: workouts
    })
    console.log(`Created ${workouts.length} sample workouts`)
  } else {
    console.log('No workouts to create')
  }
}

seedWorkouts()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })