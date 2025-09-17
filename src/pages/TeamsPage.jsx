import React, { useMemo, useState } from 'react'
import { Stack, Select, Group, Text } from '@mantine/core'
import { buildClientOptions } from '@/utils/options'
import { AgGridReact } from 'ag-grid-react'
import { autoColumnDefsFromRows } from '@/utils/columns'

export default function TeamsPage({ rows = [], clients = [], columnDefs }) {
  // value is a string client_id or null when cleared
  const [clientFilter, setClientFilter] = useState(null)

  const clientOptions = useMemo(() => buildClientOptions(clients), [clients])

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter((r) => r && typeof r === 'object') : []), [rows])

  const filteredRows = useMemo(() => {
    if (!clientFilter) return safeRows
    return safeRows.filter((r) => String(r.client_id) === clientFilter)
  }, [safeRows, clientFilter])

  const cols = useMemo(() => (
    columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(safeRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  ), [columnDefs, safeRows])

  return (
    <Stack gap="md">
      <Group wrap="nowrap" gap="sm" align="end">
        <div>
          <Text size="xs" c="dimmed" mb={4}>Filter by client</Text>
          <Select
            placeholder="All clients"
            searchable
            clearable
            data={clientOptions}
            value={clientFilter}
            onChange={setClientFilter}
            // Keep the dropdown reasonably sized; can adjust via theme later
            withinPortal
            w={200}
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
