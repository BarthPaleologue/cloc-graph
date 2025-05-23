import { smartSampleCommits, CommitInfo } from '../../utils/sampling';

describe('Sampling Utils', () => {
  describe('smartSampleCommits', () => {
    it('should sample commits at regular intervals', () => {
      // Mock array of 100 commits
      const commits = Array.from({ length: 100 }, (_, i) => ({ 
        hash: `hash${i}`, 
        date: new Date(2025, 0, i + 1).toISOString() 
      })) as CommitInfo[];
      
      // Sample 10 commits
      const sampled = smartSampleCommits(commits, 10);
      
      expect(sampled).toHaveLength(10);
      // Should take evenly spaced samples
      expect(sampled[0]).toEqual(commits[0]);
      expect(sampled[9]).toEqual(commits[90]);
    });

    it('should handle when maxSamples is greater than array length', () => {
      const commits = Array.from({ length: 5 }, (_, i) => ({ hash: `hash${i}` })) as CommitInfo[];
      const sampled = smartSampleCommits(commits, 10);
      
      expect(sampled).toHaveLength(5);
      expect(sampled).toEqual(commits);
    });

    it('should handle empty commits array', () => {
      const commits: CommitInfo[] = [];
      const sampled = smartSampleCommits(commits, 10);
      
      expect(sampled).toHaveLength(0);
      expect(sampled).toEqual([]);
    });
  });
});