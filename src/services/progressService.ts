/**
 * Progress bar service for CLI feedback
 */
import * as cliProgress from 'cli-progress';

/**
 * Options for configuring progress bars
 */
export interface ProgressOptions {
  title?: string;
  format?: string;
  etaBuffer?: number;
}

/**
 * Service for showing progress bars in the CLI
 */
export class ProgressService {
  private progressBar: cliProgress.SingleBar | null = null;

  /**
   * Create and start a new progress bar
   * 
   * @param total - Total number of steps
   * @param options - Configuration options
   */
  start(total: number, options: ProgressOptions = {}): void {
    // Don't create a progress bar for very small tasks
    if (total < 3) return;

    const format = options.format || 
      `${options.title || 'Progress'}: [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`;

    // Create a new progress bar
    this.progressBar = new cliProgress.SingleBar({
      format,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      etaBuffer: options.etaBuffer || 100
    });

    // Start the progress bar
    this.progressBar.start(total, 0);
  }

  /**
   * Update the progress bar
   * 
   * @param current - Current progress value
   * @param payload - Optional payload to update progress bar
   */
  update(current: number, payload?: Record<string, unknown>): void {
    if (this.progressBar) {
      this.progressBar.update(current, payload);
    }
  }

  /**
   * Increment the progress bar by a specified amount
   * 
   * @param amount - Amount to increment (default: 1)
   * @param payload - Optional payload to update progress bar
   */
  increment(amount = 1, payload?: Record<string, unknown>): void {
    if (this.progressBar) {
      this.progressBar.increment(amount, payload);
    }
  }

  /**
   * Stop and clear the progress bar
   */
  stop(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }
}