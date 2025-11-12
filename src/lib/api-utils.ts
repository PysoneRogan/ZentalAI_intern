/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ErrorResponse } from './validations'

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Invalid request body',
        details: result.error.issues
      }
      return {
        success: false,
        error: Response.json(errorResponse, { status: 422 })
      }
    }
  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid JSON',
      message: 'Request body must be valid JSON'
    }
    return {
      success: false,
      error: Response.json(errorResponse, { status: 400 })
    }
  }
}

/**
 * Validates URL search parameters against a Zod schema
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: Response } {
  try {
    // Convert URLSearchParams to plain object
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errorResponse: ErrorResponse = {
        error: 'Invalid Query Parameters',
        message: 'One or more query parameters are invalid',
        details: result.error.issues
      }
      return {
        success: false,
        error: Response.json(errorResponse, { status: 422 })
      }
    }
  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'Query Parameter Error',
      message: 'Failed to parse query parameters'
    }
    return {
      success: false,
      error: Response.json(errorResponse, { status: 400 })
    }
  }
}

/**
 * Validates route parameters against a Zod schema
 */
export function validateParams<T>(
  params: any,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: Response } {
  const result = schema.safeParse(params)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Route Parameters',
      message: 'Route parameters are invalid',
      details: result.error.issues
    }
    return {
      success: false,
      error: Response.json(errorResponse, { status: 422 })
    }
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  message?: string,
  status: number = 500,
  details?: any
): Response {
  const errorResponse: ErrorResponse = {
    error,
    message,
    details
  }
  return Response.json(errorResponse, { status })
}

/**
 * Handles Prisma errors and converts them to appropriate HTTP responses
 */
export function handlePrismaError(error: any): Response {
  console.error('Prisma error:', error)
  
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    case 'P2025':
      // Record not found
      return createErrorResponse(
        'Not Found',
        'The requested resource was not found',
        404
      )
    case 'P2002':
      // Unique constraint violation
      return createErrorResponse(
        'Conflict',
        'A resource with this data already exists',
        409,
        { constraint: error.meta?.target }
      )
    case 'P2003':
      // Foreign key constraint violation
      return createErrorResponse(
        'Bad Request',
        'Referenced resource does not exist',
        400,
        { field: error.meta?.field_name }
      )
    case 'P2021':
      // Table does not exist
      return createErrorResponse(
        'Configuration Error',
        'Database table not found. Please run migrations.',
        500
      )
    default:
      // Generic database error
      return createErrorResponse(
        'Database Error',
        'An error occurred while processing your request',
        500
      )
  }
}

/**
 * Calculates pagination metadata
 */
export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Converts Prisma date objects to ISO strings for JSON serialization
 */
export function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  if (obj instanceof Date) {
    return obj.toISOString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeDates)
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDates(value)
    }
    return serialized
  }
  
  return obj
}