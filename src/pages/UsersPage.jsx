import React, { useMemo, useState } from 'react'
import { Stack, Select, Group, Text } from '@mantine/core'
import { AgGridReact } from 'ag-grid-react'
import { buildClientOptions, buildTeamOptions } from '@/utils/options'
import { autoColumnDefsFromRows } from '@/utils/columns'

export default function UsersPage({ rows = [], clients = [], teams = [], columnDefs }) {
  const [clientFilter, setClientFilter] = useState(null) // value: client_id (string) or null
  const [teamFilter, setTeamFilter] = useState(null) // value: team_id (string) or null

  const clientOptions = useMemo(() => buildClientOptions(clients), [clients])
  const teamOptions = useMemo(
    () => buildTeamOptions(teams, clientFilter),
    [teams, clientFilter]
  )

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter((r) => r && typeof r === 'object') : []), [rows])

  const filteredRows = useMemo(() => {
    let out = safeRows
    if (clientFilter) out = out.filter((r) => String(r.client_id) === clientFilter)
    if (teamFilter) out = out.filter((r) => String(r.team_id) === teamFilter)
    return out
  }, [safeRows, clientFilter, teamFilter])

  const cols = useMemo(() => (
    columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(safeRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  ), [columnDefs, safeRows])

  // Reset team filter if it no longer matches the selected client
  React.useEffect(() => {
    if (teamFilter && clientFilter) {
      const teamStillValid = teams.some((t) => String(t.team_id) === teamFilter && String(t.client_id) === clientFilter)
      if (!teamStillValid) setTeamFilter(null)
    }
  }, [clientFilter, teamFilter, teams])

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
