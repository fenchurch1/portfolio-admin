import React, { useMemo, useState, useEffect } from 'react'
import { Stack, Select, Group, Text, Loader, Center } from '@mantine/core'
import { AgGridReact } from 'ag-grid-react'
import { autoColumnDefsFromRows } from '@/utils/columns'
import { apiClient } from '@/API/apiservises'
import APIEndpoints from '@/API/profile/APIEndpoints'

function buildPortfolioOptions(headers = []) {
  return (headers || [])
    .filter((h) => h && typeof h === 'object')
    .map((h) => ({
      value: String(h.portfolio_id),
      label: String(h.portfolio_name ?? h.portfolio_id),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export default function PortfolioHoldingsPage({
  headers = [],
  initialPortfolioId = null,
  onSelect,
  columnDefs,
}) {
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId)
  const [rows, setRows] = useState([])         // ⬅️ Now store fetched holdings here
  const [loading, setLoading] = useState(false)
console.log("columnDefs",columnDefs);
  const options = useMemo(() => buildPortfolioOptions(headers), [headers])
  // useEffect(() => {
  //   setPortfolioId(initialPortfolioId)
  // }, [initialPortfolioId])

  useEffect(() => {
    if (!portfolioId) return
    setLoading(true)
    apiClient
      .get(APIEndpoints.getAllPortfolioHoldingsById.replace('{portfolio_id}', portfolioId))
      .then((response) => {
        const holdingsData = response?.portfolio_data || []
        setRows(holdingsData)
      })
      .catch((err) => {
        console.error('Error fetching holdings:', err)
        setRows([])
      })
      .finally(() => setLoading(false))
  }, [portfolioId])

  const cols = useMemo(() => {
    return columnDefs && columnDefs.length
      ? columnDefs
      : autoColumnDefsFromRows(rows, { hideIdsByPattern: true, hideFromToolPanelForIds: true })
  }, [columnDefs, rows])
  console.log("cols",cols);
  
  const handleChange = (val) => {
    setPortfolioId(val)
    onSelect?.(val)
  }

  return (
    <Stack gap="md">
      <Group wrap="nowrap" gap="sm" align="end">
        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Portfolio
          </Text>
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
        {loading ? (
          <Center style={{ height: '100%' }}>
            <Loader size="lg" />
          </Center>
        ) : (
          <AgGridReact
            rowData={rows}
            columnDefs={cols}
            pagination
            paginationPageSize={25}
          />
        )}
      </div>
    </Stack>
  )
}
