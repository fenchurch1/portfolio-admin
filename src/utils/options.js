// Helpers to build UI options from domain data. Keeps UI decoupled from source (mock/API).

/**
 * Build Mantine Select options from client rows. Uses client_id as value and client_name as label.
 * @param {Array<{client_id:any, client_name?:string}>} clients
 * @returns {Array<{value:string,label:string}>}
 */
export function buildClientOptions(clients = []) {
  const seen = new Set()
  const out = []
  for (const c of (clients || [])) {
    if (!c || typeof c !== 'object') continue
    const value = String(c.client_id)
    if (seen.has(value)) continue
    seen.add(value)
    out.push({ value, label: String(c.client_name ?? c.client_id) })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Build Mantine Select options from team rows. Uses team_id as value and team_name as label.
 * Optionally filter by client_id to support dependent dropdowns.
 * @param {Array<{team_id:any, team_name?:string, client_id?:any}>} teams
 * @param {string|null} clientIdFilter
 * @returns {Array<{value:string,label:string}>}
 */
export function buildTeamOptions(teams = [], clientIdFilter = null) {
  let rows = (teams || []).filter((t) => t && typeof t === 'object')
  if (clientIdFilter) {
    rows = rows.filter((t) => String(t.client_id) === String(clientIdFilter))
  }
  const seen = new Set()
  const out = []
  for (const t of rows) {
    const value = String(t.team_id)
    if (seen.has(value)) continue
    seen.add(value)
    out.push({ value, label: String(t.team_name ?? t.team_id) })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Build Mantine Select options from user rows. Uses user_id as value and a human label.
 * Optionally filter by client_id and/or team_id to support dependent dropdowns.
 * @param {Array<{user_id:any, username?:string, full_name?:string, client_id?:any, team_id?:any}>} users
 * @param {string|null} clientIdFilter
 * @param {string|null} teamIdFilter
 * @returns {Array<{value:string,label:string}>}
 */
export function buildUserOptions(users = [], clientIdFilter = null, teamIdFilter = null) {
  let rows = (users || []).filter((u) => u && typeof u === 'object')
  if (clientIdFilter) rows = rows.filter((u) => String(u.client_id) === String(clientIdFilter))
  if (teamIdFilter) rows = rows.filter((u) => String(u.team_id) === String(teamIdFilter))
  const seen = new Set()
  const out = []
  for (const u of rows) {
    const value = String(u.user_id)
    if (seen.has(value)) continue
    seen.add(value)
    out.push({ value, label: String(u.full_name ?? u.username ?? u.user_id) })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Build Mantine Select options from portfolio header rows.
 * Uses portfolio_id as value and portfolio_name as label.
 * Optionally filter by client_id, team_id, and/or user_id.
 * Expecting headers to be denormalized (portfolio_headers_view.csv) when available.
 */
export function buildPortfolioOptions(headers = [], clientIdFilter = null, teamIdFilter = null, userIdFilter = null) {
  let rows = (headers || []).filter((h) => h && typeof h === 'object')
  if (clientIdFilter) rows = rows.filter((h) => String(h.client_id) === String(clientIdFilter))
  if (teamIdFilter) rows = rows.filter((h) => String(h.team_id) === String(teamIdFilter))
  if (userIdFilter) rows = rows.filter((h) => String(h.user_id) === String(userIdFilter))
  // de-duplicate by portfolio_id in case multiple rows exist
  const seen = new Set()
  const out = []
  for (const h of rows) {
    const value = String(h.portfolio_id)
    if (seen.has(value)) continue
    seen.add(value)
    out.push({ value, label: String(h.portfolio_name ?? h.portfolio_id) })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}
