/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: any
  stack?: string
}

class Logger {
  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, stack } = entry
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (context) {
      log += `\nContext: ${JSON.stringify(context, null, 2)}`
    }
    
    if (stack) {
      log += `\nStack: ${stack}`
    }
    
    return log
  }
  
  info(message: string, context?: any) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context
    }
    
    console.log(this.formatLogEntry(entry))
  }
  
  warn(message: string, context?: any) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context
    }
    
    console.warn(this.formatLogEntry(entry))
  }
  
  error(message: string, error?: Error, context?: any) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: error?.stack
    }
    
    console.error(this.formatLogEntry(entry))
  }
  
  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        context
      }
      
      console.debug(this.formatLogEntry(entry))
    }
  }
}

export const logger = new Logger()