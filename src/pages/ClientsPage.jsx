import React, { useState, useMemo } from 'react'
import { Stack, TextInput } from '@mantine/core'
import { AgGridReact } from 'ag-grid-react'
import { autoColumnDefsFromRows } from '@/utils/columns'

// Note: AG Grid styles are imported in AdminApp; no need to re-import here.

export default function ClientsPage({ rows = [], columnDefs }) {
  const [search, setSearch] = useState('')
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter((r) => r && typeof r === 'object') : []), [rows])
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return safeRows
    return safeRows.filter((r) =>
      Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q))
    )
  }, [safeRows, search])
  const cols = useMemo(() => (
    columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(safeRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  ), [columnDefs, safeRows])

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        style={{ width: 200 }}
      />
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
