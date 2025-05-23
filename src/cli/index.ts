/**
 * Command Line Interface for cloc-graph
 */
import { Command } from 'commander';
import { CLIOptions } from '../types';

/**
 * Configure and parse command line arguments
 * 
 * @returns Command line options
 */
export function parseCommandLineArgs(): CLIOptions {
  const program = new Command();

  program
    .description('Track lines of code over time by language with granularity, top-N, and repo path.')
    .option('-p, --path <path>', 'Path to the Git repository', '.')
    .option('-s, --step <number>', 'Sample every Nth commit', '1')
    .option('-g, --granularity <type>', 'Granularity: commits | daily | weekly | monthly', 'commits')
    .option('-t, --top <number>', 'Limit to top N languages by total lines', '0')
    .option('-e, --exclude <languages>', 'Comma-separated list of languages to exclude (e.g., "HTML,CSS")')
    .option('-i, --include <languages>', 'Comma-separated list of languages to include (e.g., "JavaScript,TypeScript")')
    .option('-f, --from <date>', 'Start date for time range in YYYY-MM-DD format')
    .option('-u, --to <date>', 'End date for time range in YYYY-MM-DD format')
    .option('-m, --max-samples <number>', 'Maximum number of commits to analyze', '100')
    .option('--smart-sampling', 'Use smart sampling algorithm for large repositories')
    .parse();
  
  return program.opts() as CLIOptions;
}

/**
 * Validate the command line options
 * 
 * @param options Command line options
 * @throws Error if options are invalid
 */
export function validateOptions(options: CLIOptions): void {
  // Validate granularity
  const validGranularities = ['commits', 'daily', 'weekly', 'monthly'];
  if (!validGranularities.includes(options.granularity)) {
    throw new Error(`Error: --granularity must be one of: ${validGranularities.join(', ')}`);
  }
}