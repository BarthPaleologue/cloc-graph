/**
 * CLOC service for analyzing code in Git repositories
 */
import { execSync } from "child_process";
import { CLOCData, Record } from "../types";
import { formatDate } from "../utils/dateUtils";

/**
 * Run CLOC on a specific commit
 *
 * @param commitHash - Git commit hash to analyze
 * @returns CLOC data with code statistics by language
 */
export function analyzeCommit(commitHash: string): CLOCData {
  try {
    const output = execSync(`cloc --quiet --json --git ${commitHash}`, {
      encoding: "utf-8",
    });
    return JSON.parse(output);
  } catch (e) {
    console.warn(`Warning: Failed to run cloc on commit ${commitHash}: ${e}`);
    return {};
  }
}

/**
 * Convert CLOC data to a record with language statistics
 *
 * @param data - CLOC data from analysis
 * @param date - Date of the commit
 * @param languages - Set of languages to update with newly found languages
 * @returns Record object with date and language stats
 */
export function createRecord(
  data: CLOCData,
  date: Date,
  languages: Set<string>,
): Record {
  const dateStr = formatDate(date);
  const rec: Record = { date: dateStr };

  for (const [lang, stats] of Object.entries(data)) {
    if (lang === "SUM") continue;
    rec[lang] = stats.code;
    languages.add(lang);
  }

  return rec;
}
