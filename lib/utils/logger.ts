/**
 * Production-safe logger utility
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, error?: any, data?: any): void {
    console.error(`[ERROR] ${message}`, error, data || '');
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export const logger = new Logger();