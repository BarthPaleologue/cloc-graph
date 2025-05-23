import { AppError, handleError, ErrorTypes } from '../../utils/errorHandler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an error with the correct properties', () => {
      const error = new AppError('Test error message', 'TEST_CODE', 42);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('AppError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.exitCode).toBe(42);
    });
    
    it('should use default values when not specified', () => {
      const error = new AppError('Default error');
      
      expect(error.code).toBe('GENERAL_ERROR');
      expect(error.exitCode).toBe(1);
    });
  });
  
  describe('handleError', () => {
    // Save original console methods
    const originalConsoleError = console.error;
    const originalConsoleDebug = console.debug;
    
    beforeEach(() => {
      // Mock console methods
      console.error = jest.fn();
      console.debug = jest.fn();
    });
    
    afterEach(() => {
      // Restore original console methods
      console.error = originalConsoleError;
      console.debug = originalConsoleDebug;
    });
    
    it('should handle AppError correctly', () => {
      const error = new AppError('Application error', 'TEST_CODE', 42);
      const exitCode = handleError(error);
      
      expect(console.error).toHaveBeenCalledWith('Error [TEST_CODE]: Application error');
      expect(exitCode).toBe(42);
    });
    
    it('should handle standard Error correctly', () => {
      const error = new Error('Standard error');
      const exitCode = handleError(error);
      
      expect(console.error).toHaveBeenCalledWith('Unexpected error: Standard error');
      expect(exitCode).toBe(1);
    });
    
    it('should handle unknown error types', () => {
      const exitCode = handleError('String error');
      
      expect(console.error).toHaveBeenCalledWith('Unknown error:', 'String error');
      expect(exitCode).toBe(1);
    });
  });
  
  describe('ErrorTypes', () => {
    it('should define common error types', () => {
      expect(ErrorTypes.INVALID_ARGUMENTS).toBeDefined();
      expect(ErrorTypes.REPOSITORY_ERROR).toBeDefined();
      expect(ErrorTypes.CLOC_ERROR).toBeDefined();
      expect(ErrorTypes.CHART_ERROR).toBeDefined();
      expect(ErrorTypes.FILE_SYSTEM_ERROR).toBeDefined();
    });
  });
});