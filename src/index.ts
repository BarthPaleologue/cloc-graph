#!/usr/bin/env node
/**
 * cloc-graph
 * 
 * MIT License
 * Copyright (c) 2025 Barthélemy Paléologue
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { createObjectCsvWriter } from 'csv-writer';
import { parseCommandLineArgs, validateOptions } from './cli';
import { initializeGitRepo, getCommits } from './services/gitService';
import { analyzeCommit, createRecord } from './services/clocService';
import { generateChart } from './services/chartService';
import { formatDate, getISOWeek, getYearMonth } from './utils/dateUtils';
import { Record } from './types';

// Register Chart.js components
import 'chart.js/auto';

async function main() {
  try {
    // Parse and validate command line options
    const options = parseCommandLineArgs();
    validateOptions(options);
    
    const step = parseInt(options.step, 10);
    const top = parseInt(options.top, 10);
    const maxSamples = parseInt(options.maxSamples, 10);
    const repoPath = path.resolve(options.path);
    
    // Change to the target directory
    try {
      process.chdir(repoPath);
    } catch (e) {
      console.error(`Error: Could not change to directory ${repoPath}`);
      process.exit(1);
    }
    
    // Initialize git repository
    const git = await initializeGitRepo(repoPath);
    
    const seen = new Set<string>();
    const records: Record[] = [];
    const langs = new Set<string>();
    
    // Get commits with optional smart sampling
    const targetCommits = await getCommits(git, {
      maxSamples,
      smartSampling: options.smartSampling
    });
    
    // Iterate through commits
    for (let idx = 0; idx < targetCommits.length; idx++) {
      const commit = targetCommits[idx];
      
      // Apply step filtering for commit granularity
      if (options.granularity === 'commits' && !options.smartSampling && (idx + 1) % step !== 0) {
        continue;
      }
      
      const commitDate = new Date(commit.date);
      const dateStr = formatDate(commitDate);
      
      // Filter by date range if specified
      if (options.from && dateStr < options.from) {
        continue;
      }
      if (options.to && dateStr > options.to) {
        continue;
      }
      
      // Determine grouping key based on granularity
      let key: string;
      if (options.granularity === 'daily') {
        key = dateStr;
      } else if (options.granularity === 'weekly') {
        key = getISOWeek(commitDate);
      } else if (options.granularity === 'monthly') {
        key = getYearMonth(commitDate);
      } else {
        key = `commit_${idx + 1}`;
      }
      
      // Skip if we've already processed this key (date/week/month/commit)
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      
      // Run cloc on this commit and create a record
      const data = analyzeCommit(commit.hash);
      const record = createRecord(data, commitDate, langs);
      records.push(record);
      
      // Stop if we've reached the maximum number of samples
      if (records.length >= maxSamples) {
        break;
      }
    }
    
    // Calculate language totals for top-N filtering
    const langTotals: { [lang: string]: number } = {};
    for (const lang of langs) {
      langTotals[lang] = records.reduce((sum, rec) => sum + (rec[lang] as number || 0), 0);
    }
    
    // Sort languages by total LOC
    const sortedLangs = [...langs].sort((a, b) => langTotals[b] - langTotals[a]);
    
    // Filter languages if top-N is specified
    let filteredLangs = top > 0 ? sortedLangs.slice(0, top) : [...sortedLangs].sort();
    
    // Exclude specified languages
    if (options.exclude) {
      const excludeLangs = new Set(options.exclude.split(',').map((lang: string) => lang.trim()));
      filteredLangs = filteredLangs.filter(lang => !excludeLangs.has(lang));
    }
    
    // Include only specified languages if --include option is used
    if (options.include) {
      const includeLangs = new Set(options.include.split(',').map((lang: string) => lang.trim()));
      filteredLangs = filteredLangs.filter(lang => includeLangs.has(lang));
    }
    
    // Write CSV
    const csvFilePath = 'loc_over_time_by_lang.csv';
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'date', title: 'date' },
        ...filteredLangs.map(lang => ({ id: lang, title: lang }))
      ]
    });
    
    await csvWriter.writeRecords(records);
    console.log(`Wrote ${csvFilePath} (${records.length} rows, top ${filteredLangs.length} langs) from '${repoPath}'`);
    
    // Generate chart
    await generateChart(records, filteredLangs);
    
  } catch (e) {
    console.error(`Error: ${e}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});