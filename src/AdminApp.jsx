import React, { useEffect, Suspense, lazy, useState } from 'react';
import {
  MantineProvider,
  AppShell,
  Group,
  Button,
  Title,
  ScrollArea,
  NavLink,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { dataStore } from '@/stores/dataStore';
import { uiStore } from '@/stores/uiStore';
import {
  IconUser,
  IconUsersGroup,
  IconUserCog,
  IconDatabase,
  IconListDetails,
  IconShare2,
  IconChevronLeft,
  IconChevronRight,
} from '@/utils/Icons.jsx';

const ClientsPage = lazy(() => import('@/pages/ClientsPage.jsx'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage.jsx'));
const UsersPage = lazy(() => import('@/pages/UsersPage.jsx'));
const PortfolioHeadersPage = lazy(() => import('@/pages/PortfolioHeadersPage.jsx'));
const PortfolioHoldingsPage = lazy(() => import('@/pages/PortfolioHoldingsPage.jsx'));
const PortfolioSharingPage = lazy(() => import('@/pages/PortfolioSharingPage.jsx'));

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '@/styles/ag-grid-dark.css';
import '@/styles/ag-grid-force-dark.css';
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";

// Register all community modules once
ModuleRegistry.registerModules([AllCommunityModule]);
function AdminAppImpl() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    dataStore.loadAll();
  }, []);

  const navItems = [
    { value: 'clients', label: 'Clients', icon: <IconUser size={24} /> },
    { value: 'teams', label: 'Teams', icon: <IconUsersGroup size={24} /> },
    { value: 'users', label: 'Users', icon: <IconUserCog size={24} /> },
    { value: 'portfolioHeaders', label: 'Portfolio Headers', icon: <IconDatabase size={24} /> },
    { value: 'portfolios', label: 'Holdings', icon: <IconListDetails size={24} /> },
    { value: 'shares', label: 'Sharing', icon: <IconShare2 size={24} /> },
  ];

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS defaultColorScheme="dark" forceColorScheme="dark">
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: collapsed ? 70 : 220,
          breakpoint: 'sm',
        }}
        padding="md"
      >
        {/* HEADER */}
        <AppShell.Header>
          <Group justify="space-between" px="md" h="100%">
            <Title order={3}>Portfolio Admin</Title>
            <Button size="xs" onClick={() => dataStore.loadAll()}>
              Reload Data
            </Button>
          </Group>
        </AppShell.Header>

        {/* SIDEBAR */}
        <AppShell.Navbar p="xs">
          <Group justify={collapsed ? 'center' : 'flex-end'} mb="sm">
            <ActionIcon
              size="sm"
              variant="light"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            </ActionIcon>
          </Group>

          <ScrollArea>
            {navItems.map((item) => (
              <Tooltip
                label={collapsed ? item.label : ''}
                position="right"
                withArrow
                key={item.value}
              >
                <NavLink
                  active={uiStore.activeTab === item.value}
                  onClick={() => uiStore.setActiveTab(item.value)}
                  label={collapsed ? null : item.label}
                  leftSection={item.icon}
                  variant="light"
                  style={{ marginBottom: 4 }}
                />
              </Tooltip>
            ))}
          </ScrollArea>
        </AppShell.Navbar>

        {/* MAIN CONTENT */}
        <AppShell.Main>
          <Suspense fallback={<div style={{ padding: 12 }}>Loading…</div>}>
            {uiStore.activeTab === 'clients' && <ClientsPage rows={dataStore.clients} />}
            {uiStore.activeTab === 'teams' && (
              <TeamsPage rows={dataStore.teams} clients={dataStore.clients} />
            )}
            {uiStore.activeTab === 'users' && (
              <UsersPage
                rows={dataStore.users}
                clients={dataStore.clients}
                teams={dataStore.teams}
              />
            )}
            {uiStore.activeTab === 'portfolioHeaders' && (
              <PortfolioHeadersPage
                rows={dataStore.portfolioHeaders}
                clients={dataStore.clients}
                teams={dataStore.teams}
                users={dataStore.users}
              />
            )}
            {uiStore.activeTab === 'portfolios' && (
              <PortfolioHoldingsPage
                holdings={dataStore.portfolios}
                headers={dataStore.portfolioHeaders}
                initialPortfolioId={uiStore.selectedPortfolioId}
                onSelect={uiStore.setSelectedPortfolioId}
              />
            )}
            {uiStore.activeTab === 'shares' && (
              <PortfolioSharingPage
                rows={dataStore.shares}
                clients={dataStore.clients}
                teams={dataStore.teams}
                users={dataStore.users}
                headers={dataStore.portfolioHeaders}
              />
            )}
          </Suspense>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

const AdminApp = observer(AdminAppImpl);
export default AdminApp;
