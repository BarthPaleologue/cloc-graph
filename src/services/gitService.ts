/**
 * Git repository service
 */
import { simpleGit, SimpleGit } from 'simple-git';
import * as path from 'path';
import { smartSampleCommits } from '../utils/sampling';

/**
 * Initialize Git repository and verify it exists
 * 
 * @param repoPath - Path to the Git repository
 * @returns SimpleGit instance
 * @throws Error if the path is not a Git repository
 */
export async function initializeGitRepo(repoPath: string): Promise<SimpleGit> {
  const git: SimpleGit = simpleGit();
  
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error(`${repoPath} is not a git repository`);
    }
    return git;
  } catch (e) {
    throw new Error(`Error checking repository: ${e}`);
  }
}

/**
 * Get commits from a Git repository with optional sampling
 * 
 * @param git - SimpleGit instance
 * @param options - Sampling options (step, max samples, smart sampling)
 * @returns Array of commits
 */
export async function getCommits(
  git: SimpleGit, 
  options: { 
    maxSamples: number, 
    smartSampling?: boolean 
  }
): Promise<any[]> {
  // Get all commits in chronological order (oldest first)
  const commits = await git.log(['--reverse']);
  const allCommits = [...commits.all];  // Create a copy to avoid readonly issues
  
  // Apply smart sampling if enabled and needed
  if (options.smartSampling && allCommits.length > options.maxSamples) {
    console.log(`Repository has ${allCommits.length} commits. Using smart sampling to select ${options.maxSamples} representative commits...`);
    return smartSampleCommits(allCommits, options.maxSamples);
  }
  
  return allCommits;
}