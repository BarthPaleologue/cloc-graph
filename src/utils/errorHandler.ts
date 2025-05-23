/**
 * Error handling utilities
 */

/**
 * Custom application error class with enhanced properties
 */
export class AppError extends Error {
  code: string;
  exitCode: number;

  constructor(message: string, code = 'GENERAL_ERROR', exitCode = 1) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handles application errors in a consistent way
 * 
 * @param error - The error to handle
 * @returns Exit code to use when terminating the process
 */
export function handleError(error: unknown): number {
  if (error instanceof AppError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    return error.exitCode;
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
    if (error.stack) {
      console.debug(error.stack);
    }
    return 1;
  } else {
    console.error('Unknown error:', error);
    return 1;
  }
}

/**
 * Common error types
 */
export const ErrorTypes = {
  INVALID_ARGUMENTS: 'INVALID_ARGUMENTS',
  REPOSITORY_ERROR: 'REPOSITORY_ERROR',
  CLOC_ERROR: 'CLOC_ERROR',
  CHART_ERROR: 'CHART_ERROR',
  FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR',
};