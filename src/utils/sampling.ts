/**
 * Sampling utilities for optimizing analysis of large repositories
 */

// Define a minimal type for commit objects
export interface CommitInfo {
  hash: string;
  date?: string;
  [key: string]: unknown;
}

/**
 * Smart sampling algorithm to select representative commits
 *
 * @param commits - Array of all commits
 * @param maxSamples - Maximum number of samples to take
 * @returns Array of selected commits
 */
export function smartSampleCommits(commits: CommitInfo[], maxSamples: number): CommitInfo[] {
  const sample: CommitInfo[] = [];
  const interval = Math.ceil(commits.length / maxSamples);

  for (let i = 0; i < commits.length; i += interval) {
    sample.push(commits[i]);
  }

  // Ensure we have exactly maxSamples, adjust the last sample if necessary
  while (sample.length > maxSamples) {
    sample.pop();
  }

  return sample;
}
