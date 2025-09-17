import React, { useMemo, useState, useEffect } from 'react'
import { Stack, Select, Group, Text } from '@mantine/core'
import { AgGridReact } from 'ag-grid-react'
import { buildClientOptions, buildTeamOptions, buildUserOptions, buildPortfolioOptions } from '@/utils/options'
import { autoColumnDefsFromRows } from '@/utils/columns'

// rows expected from portfolio_share_view.csv
export default function PortfolioSharingPage({ rows = [], clients = [], teams = [], users = [], headers = [], columnDefs }) {
  const [clientFilter, setClientFilter] = useState(null)
  const [teamFilter, setTeamFilter] = useState(null)
  const [ownerFilter, setOwnerFilter] = useState(null)
  const [sharedWithFilter, setSharedWithFilter] = useState(null)
  const [portfolioFilter, setPortfolioFilter] = useState(null)

  const clientOptions = useMemo(() => buildClientOptions(clients), [clients])
  const teamOptions = useMemo(() => buildTeamOptions(teams, clientFilter), [teams, clientFilter])
  const ownerUserOptions = useMemo(() => buildUserOptions(users, clientFilter, teamFilter), [users, clientFilter, teamFilter])
  const sharedWithUserOptions = useMemo(() => buildUserOptions(users, clientFilter, teamFilter), [users,clientFilter,teamFilter])
  const portfolioOptions = useMemo(
    () => buildPortfolioOptions(headers, clientFilter, teamFilter, ownerFilter),
    [headers, clientFilter, teamFilter, ownerFilter]
  )

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter((r) => r && typeof r === 'object') : []), [rows])

  const filteredRows = useMemo(() => {
    let out = safeRows
    if (clientFilter) out = out.filter((r) => String(r.client_id) === clientFilter)
    if (teamFilter) out = out.filter((r) => String(r.team_id) === teamFilter)
    if (ownerFilter) out = out.filter((r) => String(r.owner_user_id) === ownerFilter)
    if (sharedWithFilter) out = out.filter((r) => String(r.shared_with_user_id) === sharedWithFilter)
    if (portfolioFilter) out = out.filter((r) => String(r.portfolio_id) === portfolioFilter)
    return out
  }, [safeRows, clientFilter, teamFilter, ownerFilter, sharedWithFilter, portfolioFilter])

  const cols = useMemo(() => (
    columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(filteredRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  ), [columnDefs, filteredRows])

  // Maintain dependent validity
  useEffect(() => {
    if (teamFilter && clientFilter) {
      const teamStillValid = teams.some((t) => String(t.team_id) === teamFilter && String(t.client_id) === clientFilter)
      if (!teamStillValid) setTeamFilter(null)
    }
  }, [clientFilter, teamFilter, teams])
  useEffect(() => {
    if (ownerFilter && (clientFilter || teamFilter)) {
      const userStillValid = users.some((u) =>
        String(u.user_id) === ownerFilter &&
        (!clientFilter || String(u.client_id) === clientFilter) &&
        (!teamFilter || String(u.team_id) === teamFilter)
      )
      if (!userStillValid) setOwnerFilter(null)
    }
  }, [clientFilter, teamFilter, ownerFilter, users])
  useEffect(() => {
    if (portfolioFilter && (clientFilter || teamFilter || ownerFilter)) {
      const hdrStillValid = headers.some((h) =>
        String(h.portfolio_id) === portfolioFilter &&
        (!clientFilter || String(h.client_id) === clientFilter) &&
        (!teamFilter || String(h.team_id) === teamFilter) &&
        (!ownerFilter || String(h.user_id) === ownerFilter)
      )
      if (!hdrStillValid) setPortfolioFilter(null)
    }
  }, [clientFilter, teamFilter, ownerFilter, portfolioFilter, headers])

  return (
    <Stack gap="md">
      <Group wrap="wrap" gap="sm" align="end">
        <div>
          <Text size="xs" c="dimmed" mb={4}>Client</Text>
          <Select
            placeholder="All clients"
            searchable
            clearable
            data={clientOptions}
            value={clientFilter}
            onChange={setClientFilter}
            withinPortal
            w={200}
          />
        </div>
        <div>
          <Text size="xs" c="dimmed" mb={4}>Team</Text>
          <Select
            placeholder="All teams"
            searchable
            clearable
            data={teamOptions}
            value={teamFilter}
            onChange={setTeamFilter}
            withinPortal
            w={200}
            disabled={!teams.length}
          />
        </div>
        <div>
          <Text size="xs" c="dimmed" mb={4}>Owner user</Text>
          <Select
            placeholder="All owners"
            searchable
            clearable
            data={ownerUserOptions}
            value={ownerFilter}
            onChange={setOwnerFilter}
            withinPortal
            w={200}
            disabled={!users.length}
          />
        </div>
        <div>
          <Text size="xs" c="dimmed" mb={4}>Shared with user</Text>
          <Select
            placeholder="All users"
            searchable
            clearable
            data={sharedWithUserOptions}
            value={sharedWithFilter}
            onChange={setSharedWithFilter}
            withinPortal
            w={200}
            disabled={!users.length}
          />
        </div>
        <div>
          <Text size="xs" c="dimmed" mb={4}>Portfolio</Text>
          <Select
            placeholder="All portfolios"
            searchable
            clearable
            data={portfolioOptions}
            value={portfolioFilter}
            onChange={setPortfolioFilter}
            withinPortal
            w={200}
            disabled={!headers.length}
          />
        </div>
      </Group>
      <div className="ag-theme-quartz-dark" style={{ height: 500, width: '100%' }}>
        <AgGridReact
          rowData={filteredRows}
          columnDefs={cols}
          pagination
          paginationPageSize={25}
        />
      </div>
    </Stack>
  )
}
