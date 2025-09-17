import React, { useMemo, useState, useEffect } from 'react'
import { Stack, Select, Group, Text, Button } from '@mantine/core'
import { uiStore } from '@/stores/uiStore'
import { AgGridReact } from 'ag-grid-react'
import { buildClientOptions, buildTeamOptions, buildUserOptions } from '@/utils/options'
import { autoColumnDefsFromRows } from '@/utils/columns'

export default function PortfolioHeadersPage({ rows = [], clients = [], teams = [], users = [], columnDefs }) {
  const [clientFilter, setClientFilter] = useState(null)
  const [teamFilter, setTeamFilter] = useState(null)
  const [userFilter, setUserFilter] = useState(null)

  const clientOptions = useMemo(() => buildClientOptions(clients), [clients])
  const teamOptions = useMemo(() => buildTeamOptions(teams, clientFilter), [teams, clientFilter])
  const userOptions = useMemo(() => buildUserOptions(users, clientFilter, teamFilter), [users, clientFilter, teamFilter])

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter((r) => r && typeof r === 'object') : []), [rows])

  const filteredRows = useMemo(() => {
    let out = safeRows
    if (clientFilter) out = out.filter((r) => String(r.client_id) === clientFilter)
    if (teamFilter) out = out.filter((r) => String(r.team_id) === teamFilter)
    if (userFilter) out = out.filter((r) => String(r.user_id) === userFilter)
    return out
  }, [safeRows, clientFilter, teamFilter, userFilter])

  const cols = useMemo(() => {
    const base = columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(filteredRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
    return [
      ...base,
      {
        headerName: 'Actions',
        field: '__actions',
        cellRenderer: (p) => {
          const id = p?.data?.portfolio_id
          return (
            <Button size="xs" variant="light" onClick={() => uiStore.goToPortfolioHoldings(id)}>
              View holdings
            </Button>
          )
        },
        width: 150,
        pinned: 'right',
      },
    ]
  }, [filteredRows, columnDefs])

  // Keep dependent filters valid
  useEffect(() => {
    if (teamFilter && clientFilter) {
      const teamStillValid = teams.some((t) => String(t.team_id) === teamFilter && String(t.client_id) === clientFilter)
      if (!teamStillValid) setTeamFilter(null)
    }
  }, [clientFilter, teamFilter, teams])
  useEffect(() => {
    if (userFilter && (clientFilter || teamFilter)) {
      const userStillValid = users.some((u) =>
        String(u.user_id) === userFilter &&
        (!clientFilter || String(u.client_id) === clientFilter) &&
        (!teamFilter || String(u.team_id) === teamFilter)
      )
      if (!userStillValid) setUserFilter(null)
    }
  }, [clientFilter, teamFilter, userFilter, users])

  return (
    <Stack gap="md">
      <Group wrap="nowrap" gap="sm" align="end">
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
          <Text size="xs" c="dimmed" mb={4}>User</Text>
          <Select
            placeholder="All users"
            searchable
            clearable
            data={userOptions}
            value={userFilter}
            onChange={setUserFilter}
            withinPortal
            w={200}
            disabled={!users.length}
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
