/**
 * Sampling utilities for optimizing analysis of large repositories
 */

/**
 * Smart sampling algorithm to select representative commits
 * 
 * @param commits - Array of all commits
 * @param maxSamples - Maximum number of samples to take
 * @returns Array of selected commits
 */
export function smartSampleCommits(commits: any[], maxSamples: number): any[] {
  const sample: any[] = [];
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