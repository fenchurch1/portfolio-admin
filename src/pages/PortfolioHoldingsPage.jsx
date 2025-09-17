import React, { useMemo, useState, useEffect } from 'react'
import { Stack, Select, Group, Text } from '@mantine/core'
import { AgGridReact } from 'ag-grid-react'
import { autoColumnDefsFromRows } from '@/utils/columns'

function buildPortfolioOptions(headers = []) {
  return (headers || [])
    .filter((h) => h && typeof h === 'object')
    .map((h) => ({ value: String(h.portfolio_id), label: String(h.portfolio_name ?? h.portfolio_id) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export default function PortfolioHoldingsPage({ holdings = [], headers = [], initialPortfolioId = null, onSelect, columnDefs }) {
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId)
  const options = useMemo(() => buildPortfolioOptions(headers), [headers])

  // keep local selection in sync when initial changes
  useEffect(() => {
    setPortfolioId(initialPortfolioId)
  }, [initialPortfolioId,holdings])

  const safeRows = useMemo(() => (Array.isArray(holdings) ? holdings.filter((r) => r && typeof r === 'object') : []), [holdings])
  const filteredRows = useMemo(() => {
    if (!portfolioId) return []
    return safeRows.filter((r) => String(r.portfolio_id) === String(portfolioId))
  }, [safeRows, portfolioId])

  const cols = useMemo(() => (
    columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(filteredRows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  ), [columnDefs, filteredRows])

  const handleChange = (val) => {
    setPortfolioId(val)
    onSelect?.(val)
  }

  return (
    <Stack gap="md">
      <Group wrap="nowrap" gap="sm" align="end">
        <div>
          <Text size="xs" c="dimmed" mb={4}>Portfolio</Text>
          <Select
            placeholder="Select portfolio"
            searchable
            clearable
            data={options}
            value={portfolioId}
            onChange={handleChange}
            withinPortal
            w={300}
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
