// Minimal CSV utilities using d3-dsv for parsing mock data from /public/mock
import { csvParse, autoType } from 'd3-dsv'

/**
 * Build a URL to the mock CSV under public/mock
 * @param {string} fileName e.g. 'clients.csv'
 */
export function mockUrl(fileName) {
  return `/mock/${fileName}`
}

/**
 * Fetch and parse a CSV into an array of objects with basic type inference.
 * @param {string} url absolute or root-relative URL to CSV
 */
export async function fetchCsv(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV ${url}: ${res.status} ${res.statusText}`)
  }
  const text = await res.text()
  return csvParse(text, autoType)
}

/**
 * Try to fetch and parse a CSV. Returns null if the resource is missing (404).
 * Useful for trying alternative mock files, e.g., *_view.csv before base.
 * @param {string} url absolute or root-relative URL to CSV
 */
export async function fetchCsvOrNull(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  const ct = res.headers.get('content-type') || ''
  // If server returns an HTML page (e.g., SPA fallback), treat as missing
  if (ct.includes('text/html')) return null
  const text = await res.text()
  return csvParse(text, autoType)
}

/**
 * Helper to fetch a CSV from /mock by file name.
 */
export async function fetchMockCsv(fileName) {
  return fetchCsv(mockUrl(fileName))
}

/**
 * Try a list of file names under /mock and return the first that exists.
 * Example: fetchMockCsvFirst(['teams_view.csv', 'teams.csv'])
 * @param {string[]} fileNames
 */
export async function fetchMockCsvFirst(fileNames) {
  for (const name of fileNames) {
    const parsed = await fetchCsvOrNull(mockUrl(name))
    if (parsed) return parsed
  }
  throw new Error(`None of the mock files found: ${fileNames.join(', ')}`)
}
