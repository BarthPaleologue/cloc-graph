/**
 * Chart generation service
 */
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import * as fs from 'fs-extra';
import { Record, ChartDataset } from '../types';

/**
 * Generate a chart visualization of code lines over time
 * 
 * @param records - Data records with lines of code by language
 * @param languages - List of languages to include in the chart
 * @param outputPath - Path where the chart image will be saved
 * @returns Promise that resolves when the chart is generated
 */
export async function generateChart(
  records: Record[], 
  languages: string[],
  outputPath: string = 'loc_chart.png'
): Promise<void> {
  const width = 800;
  const height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
    width, 
    height, 
    backgroundColour: 'white' 
  });
  
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
  fs.writeFileSync(outputPath, buffer);
  console.log(`Chart saved as ${outputPath}`);
}