/**
 * Structured logging utility
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

type LogContextData = Record<string, unknown>;

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  colorize: boolean;
  timestamp: boolean;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  colorize: true,
  timestamp: true,
};

/**
 * Terminal colors for colorized logging
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

/**
 * A structured logger for the application
 */
export class Logger {
  private config: LoggerConfig;

  /**
   * Creates a new Logger instance
   * 
   * @param config - Logger configuration
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Format a log message with optional colorization and timestamp
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context data
   * @returns Formatted log message
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContextData): string {
    const levelNames = ['DEBUG', 'INFO ', 'WARN ', 'ERROR'];
    let levelName = levelNames[level];
    
    if (this.config.colorize) {
      const colorKey = LogLevel[level].toLowerCase() as keyof typeof colors;
      levelName = `${colors[colorKey]}${colors.bright}${levelName}${colors.reset}`;
    }
    
    let timestamp = '';
    if (this.config.timestamp) {
      timestamp = new Date().toISOString() + ' ';
    }
    
    let formattedContext = '';
    if (context && Object.keys(context).length > 0) {
      formattedContext = ' ' + JSON.stringify(context);
    }
    
    return `${timestamp}${levelName}: ${message}${formattedContext}`;
  }

  /**
   * Log a debug message
   * 
   * @param message - Debug message
   * @param context - Optional context data
   */
  debug(message: string, context?: LogContextData): void {
    if (this.config.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  /**
   * Log an info message
   * 
   * @param message - Info message
   * @param context - Optional context data
   */
  info(message: string, context?: LogContextData): void {
    if (this.config.level <= LogLevel.INFO) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  /**
   * Log a warning message
   * 
   * @param message - Warning message
   * @param context - Optional context data
   */
  warn(message: string, context?: LogContextData): void {
    if (this.config.level <= LogLevel.WARN) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  /**
   * Log an error message
   * 
   * @param message - Error message
   * @param context - Optional context data
   */
  error(message: string, context?: LogContextData): void {
    if (this.config.level <= LogLevel.ERROR) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
    }
  }
}

/**
 * Default application logger instance
 */
export const logger = new Logger();