/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '../../app/api/workouts/route'
import { prisma } from '../../lib/prisma'

// Mock Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    workout: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    workoutType: {
      findUnique: vi.fn(),
    },
  },
}))

describe('/api/workouts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('GET /api/workouts', () => {
    it('should return paginated workouts', async () => {
      // Mock data
      const mockWorkouts = [
        {
          id: 1,
          userId: 1,
          workoutTypeId: 1,
          durationMin: 45,
          calories: 300,
          performedAt: new Date('2024-01-20'),
          notes: 'Great workout',
          createdAt: new Date('2024-01-20'),
          workoutType: {
            id: 1,
            name: 'Cardio',
            description: 'Cardio workout',
            color: '#10b981'
          }
        }
      ]
      
      // Mock Prisma calls
      vi.mocked(prisma.workout.findMany).mockResolvedValue(mockWorkouts)
      vi.mocked(prisma.workout.count).mockResolvedValue(1)
      
      // Create mock request
      const request = new Request('http://localhost:3000/api/workouts?page=1&limit=10')
      
      // Call the API route
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await GET(request as any)
      
      // Assertions
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.workouts).toHaveLength(1)
      expect(data.pagination.total).toBe(1)
      expect(data.pagination.page).toBe(1)
    })
    
    it('should handle invalid query parameters', async () => {
      const request = new Request('http://localhost:3000/api/workouts?page=0&limit=101')
      
      const response = await GET(request as any)
      
      expect(response.status).toBe(422)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid Query Parameters')
    })
  })
  
  describe('POST /api/workouts', () => {
    it('should create a new workout', async () => {
      const mockWorkout = {
        id: 1,
        userId: 1,
        workoutTypeId: 1,
        durationMin: 45,
        calories: 300,
        performedAt: new Date('2024-01-20'),
        notes: 'Great workout',
        createdAt: new Date('2024-01-20'),
        workoutType: {
          id: 1,
          name: 'Cardio',
          description: 'Cardio workout',
          color: '#10b981'
        }
      }
      
      // Mock Prisma calls
      vi.mocked(prisma.workoutType.findUnique).mockResolvedValue({
        id: 1,
        name: 'Cardio',
        description: 'Cardio workout',
        color: '#10b981'
      })
      vi.mocked(prisma.workout.create).mockResolvedValue(mockWorkout)
      
      // Create mock request
      const request = new Request('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutTypeId: 1,
          durationMin: 45,
          calories: 300,
          performedAt: '2024-01-20T10:00:00Z',
          notes: 'Great workout'
        })
      })
      
      // Call the API route
      const response = await POST(request as any)
      
      // Assertions
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.id).toBe(1)
      expect(data.durationMin).toBe(45)
      expect(data.workoutType.name).toBe('Cardio')
    })
    
    it('should return 400 for invalid workout type', async () => {
      // Mock Prisma calls
      vi.mocked(prisma.workoutType.findUnique).mockResolvedValue(null)
      
      const request = new Request('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutTypeId: 999,
          durationMin: 45,
          performedAt: '2024-01-20T10:00:00Z'
        })
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Bad Request')
      expect(data.message).toContain('Workout type with ID 999 does not exist')
    })
    
    it('should return 422 for invalid request body', async () => {
      const request = new Request('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutTypeId: 'invalid',
          durationMin: -10
        })
      })
      
      const response = await POST(request as any)
      
      expect(response.status).toBe(422)
      
      const data = await response.json()
      expect(data.error).toBe('Validation Error')
    })
  })
})