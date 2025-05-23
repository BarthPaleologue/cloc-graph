import { Logger } from '../../utils/logger';

describe('Logger', () => {
  // Save original console methods
  const originalConsoleDebug = console.debug;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsoleDebug;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('Logging methods', () => {
    it('should log debug messages with the correct format', () => {
      // Set log level to DEBUG (0) to ensure debug messages are logged
      const logger = new Logger({ colorize: false, timestamp: false, level: 0 });
      logger.debug('Debug message');
      
      expect(console.debug).toHaveBeenCalledWith('DEBUG: Debug message');
    });
    
    it('should log info messages with the correct format', () => {
      const logger = new Logger({ colorize: false, timestamp: false });
      logger.info('Info message');
      
      expect(console.info).toHaveBeenCalledWith('INFO : Info message');
    });
    
    it('should log warning messages with the correct format', () => {
      const logger = new Logger({ colorize: false, timestamp: false });
      logger.warn('Warning message');
      
      expect(console.warn).toHaveBeenCalledWith('WARN : Warning message');
    });
    
    it('should log error messages with the correct format', () => {
      const logger = new Logger({ colorize: false, timestamp: false });
      logger.error('Error message');
      
      expect(console.error).toHaveBeenCalledWith('ERROR: Error message');
    });
  });
  
  describe('Log context data', () => {
    it('should include context data in the log message', () => {
      const logger = new Logger({ colorize: false, timestamp: false });
      logger.info('Message with context', { user: 'test', action: 'login' });
      
      expect(console.info).toHaveBeenCalledWith(
        'INFO : Message with context {"user":"test","action":"login"}'
      );
    });
  });
  
  describe('Log levels', () => {
    it('should respect log level threshold', () => {
      // Create a logger with INFO level (should not log DEBUG)
      const logger = new Logger({ colorize: false, timestamp: false, level: 1 });
      
      logger.debug('Debug message');
      logger.info('Info message');
      
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
    });
  });
});