#!/usr/bin/env node

import { Command } from 'commander';
import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs-extra';
import { execSync } from 'child_process';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Chart, ChartConfiguration } from 'chart.js';

// Register Chart.js components
import 'chart.js/auto';

// Define types
interface CLOCStats {
  blank?: number;
  comment?: number;
  code: number;
  nFiles?: number;
}

interface CLOCData {
  [language: string]: CLOCStats;
}

interface Record {
  date: string;
  [language: string]: number | string;
}

// Define dataset type to properly handle chart properties
interface ChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderWidth: number;
  tension: number;
  borderColor?: string;
  backgroundColor?: string;
}

// Parse command line arguments
const program = new Command();

program
  .description('Track lines of code over time by language with granularity, top-N, and repo path.')
  .option('-p, --path <path>', 'Path to the Git repository', '.')
  .option('-s, --step <number>', 'Sample every Nth commit', '1')
  .option('-g, --granularity <type>', 'Granularity: commits | daily | weekly', 'commits')
  .option('-t, --top <number>', 'Limit to top N languages by total lines', '0')
  .parse();

const options = program.opts();

async function main() {
  // Validate options
  if (!['commits', 'daily', 'weekly'].includes(options.granularity)) {
    console.error('Error: --granularity must be one of: commits, daily, weekly');
    process.exit(1);
  }
  
  const step = parseInt(options.step, 10);
  const top = parseInt(options.top, 10);
  const repoPath = path.resolve(options.path);
  
  // Change to the target directory
  try {
    process.chdir(repoPath);
  } catch (e) {
    console.error(`Error: Could not change to directory ${repoPath}`);
    process.exit(1);
  }
  
  // Initialize git
  const git: SimpleGit = simpleGit();
  
  // Check if this is a git repository
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(`Error: ${repoPath} is not a git repository`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`Error checking repository: ${e}`);
    process.exit(1);
  }
  
  const seen = new Set<string>();
  const records: Record[] = [];
  const langs = new Set<string>();
  
  try {
    // Get all commits in chronological order (oldest first)
    const commits = await git.log(['--reverse']);
    
    // Iterate through commits
    for (let idx = 0; idx < commits.all.length; idx++) {
      const commit = commits.all[idx];
      
      // Apply step filtering for commit granularity
      if (options.granularity === 'commits' && (idx + 1) % step !== 0) {
        continue;
      }
      
      const commitDate = new Date(commit.date);
      const dateStr = commitDate.toISOString().split('T')[0];  // YYYY-MM-DD
      
      let key: string;
      if (options.granularity === 'daily') {
        key = dateStr;
      } else if (options.granularity === 'weekly') {
        // Get ISO week
        const d = new Date(commitDate);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
        const week = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
        key = `${commitDate.getFullYear()}-${week.toString().padStart(2, '0')}`;
      } else {
        key = `commit_${idx + 1}`;
      }
      
      // Skip if we've already processed this key (date/week/commit)
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      
      // Run cloc on this commit
      let data: CLOCData = {};
      try {
        const output = execSync(`cloc --quiet --json --git ${commit.hash}`, { encoding: 'utf-8' });
        data = JSON.parse(output);
      } catch (e) {
        console.warn(`Warning: Failed to run cloc on commit ${commit.hash}: ${e}`);
      }
      
      // Process cloc data
      const rec: Record = { date: dateStr };
      for (const [lang, stats] of Object.entries(data)) {
        if (lang === 'SUM') continue;
        rec[lang] = stats.code;
        langs.add(lang);
      }
      records.push(rec);
    }
    
    // Calculate language totals for top-N filtering
    const langTotals: { [lang: string]: number } = {};
    for (const lang of langs) {
      langTotals[lang] = records.reduce((sum, rec) => sum + (rec[lang] as number || 0), 0);
    }
    
    // Sort languages by total LOC
    const sortedLangs = [...langs].sort((a, b) => langTotals[b] - langTotals[a]);
    
    // Filter languages if top-N is specified
    const filteredLangs = top > 0 ? sortedLangs.slice(0, top) : [...sortedLangs].sort();
    
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

async function generateChart(records: Record[], languages: string[]) {
  const width = 800;
  const height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
  // Prepare data for chart
  const dates = records.map(r => r.date);
  const datasets: ChartDataset[] = languages.map(lang => ({
    label: lang,
    data: records.map(r => r[lang] as number || 0),
    fill: false,
    borderWidth: 2,
    tension: 0.1
  }));
  
  // Generate different colors for each language
  datasets.forEach((dataset, i) => {
    const hue = (i * 360) / datasets.length;
    dataset.borderColor = `hsl(${hue}, 70%, 60%)`;
    dataset.backgroundColor = `hsla(${hue}, 70%, 60%, 0.2)`;
  });
  
  // Configuration for the chart
  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: dates,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Lines of Code Over Time by Language'
        },
        legend: {
          position: 'right'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Lines of Code'
          },
          beginAtZero: true
        }
      }
    }
  };
  
  // Generate image
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync('loc_chart.png', buffer);
  console.log('Chart saved as loc_chart.png');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});