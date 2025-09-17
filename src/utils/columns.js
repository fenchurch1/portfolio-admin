// Utilities to convert backend column metadata into AG Grid column definitions
// and build efficient, locale-aware value formatters.

/**
 * Map unit keyword to numeric scale multiplier.
 * Supported: 'none' | 'thousands' | 'millions'.
 */
export function unitScale(unit = 'none') {
  switch (unit) {
    case 'thousands':
      return 1e-3
    case 'millions':
      return 1e-6
    default:
      return 1
  }
}

/**
 * Create a fast, stable number valueFormatter using Intl.NumberFormat.
 * options: { decimals?: number, unit?: 'none'|'thousands'|'millions', locale?: string, compact?: boolean }
 */
export function makeNumberFormatter({ decimals = 0, unit = 'none', locale, compact = false } = {}) {
  const scale = unitScale(unit)
  const nfOpts = compact
    ? { notation: 'compact', maximumFractionDigits: decimals, minimumFractionDigits: decimals }
    : { maximumFractionDigits: decimals, minimumFractionDigits: decimals }
  const nf = new Intl.NumberFormat(locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US'), nfOpts)
  return (params) => {
    const v = params?.value
    if (v == null) return ''
    const n = typeof v === 'number' ? v : Number(v)
    if (Number.isNaN(n)) return ''
    return nf.format(n * scale)
  }
}

/**
 * Heuristic to identify ID fields by name.
 * Default pattern matches "id" or something ending with "_id" (case-insensitive).
 */
export function isIdField(field, pattern = /(.*_)?id$/i) {
  if (!field || typeof field !== 'string') return false
  return pattern.test(field)
}

/**
 * Build AG Grid columnDefs from backend metadata.
 * metaCols: Array of { field, headerName?, datatype: 'number'|'string', decimals?, unit?, isHidden?, ...rest }
 * options: { locale?, compactNumbers?, hideIdsByPattern?, idPattern?, hideFromToolPanelForHidden?, hideFromToolPanelForIds? }
 * Notes:
 *  - Prefer the meta flag `isHidden: true` to hide fields. Backward-compatible support for `isId: true` remains.
 *  - If `hideIdsByPattern` is true, any field matching idPattern will be hidden unless explicitly overridden.
 */
export function buildColumnDefsFromMeta(
  metaCols = [],
  { locale, compactNumbers = false, hideIdsByPattern = false, idPattern = /(.*_)?id$/i, hideFromToolPanelForHidden = false, hideFromToolPanelForIds = false } = {}
) {
  return metaCols.map((c) => {
    const { field, headerName, datatype, decimals, unit, isHidden, isId, hidden, hide, suppressColumnsToolPanel, ...rest } = c
    if (!field) return null
    const explicitHidden = isHidden === true || hidden === true || hide === true
    const patternHidden = hideIdsByPattern && isIdField(field, idPattern)
    // Keep isId for backward compatibility, but prefer isHidden when provided
    const bcIsIdHidden = isId === true
    const treatAsHidden = Boolean(explicitHidden || patternHidden || bcIsIdHidden)
    const baseVisibility = {}
    if (treatAsHidden) {
      baseVisibility.hide = true
      if (hideFromToolPanelForHidden || hideFromToolPanelForIds) {
        baseVisibility.suppressColumnsToolPanel = true
      }
    }
    // If explicitly provided in meta, respect suppressColumnsToolPanel (overrides computed)
    if (suppressColumnsToolPanel != null) {
      baseVisibility.suppressColumnsToolPanel = suppressColumnsToolPanel
    }
    if (datatype === 'number') {
      const valueFormatter = makeNumberFormatter({ decimals: decimals ?? 0, unit: unit ?? 'none', locale, compact: compactNumbers })
      return {
        field,
        headerName: headerName ?? field,
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter,
        cellClass: 'ag-right-aligned-cell',
        ...baseVisibility,
        // Note: valueParser can be added for editable number columns; omitted by default.
        ...rest,
      }
    }
    // default to text
    return {
      field,
      headerName: headerName ?? field,
      sortable: true,
      filter: 'agTextColumnFilter',
      ...baseVisibility,
      ...rest,
    }
  }).filter(Boolean)
}

/**
 * Generate simple columnDefs from the first row's keys, used as a fallback when backend columnDefs are not provided.
 */
export function autoColumnDefsFromRows(rows = [], { hideIdsByPattern = false, idPattern = /(.*_)?id$/i, hideFromToolPanelForIds = false } = {}) {
  const sample = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  if (!sample || typeof sample !== 'object') return []
  return Object.keys(sample).map((field) => ({
    field,
    sortable: true,
    filter: true,
    resizable: true,
    ...(hideIdsByPattern && isIdField(field, idPattern) ? { hide: true, ...(hideFromToolPanelForIds ? { suppressColumnsToolPanel: true } : {}) } : {}),
  }))
}
