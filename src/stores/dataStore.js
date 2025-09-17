import { makeAutoObservable, runInAction } from 'mobx'
import { fetchMockCsvFirst } from '../utils/csv'
import { apiClient } from '../API/apiservises'
import APIEndpoints from '../API/profile/APIEndpoints'

export class DataStore {
  clients = []
  portfolioHeaders = []
  portfolios = []
  shares = []
  teams = []
  users = []

  loading = false
  error = null

  constructor() {
    makeAutoObservable(this)
  }
  UpdateHoldingData(holdings){
    this.portfolios=holdings
    
  }
  async loadAll() {
    this.loading = true
    this.error = null
    try {
      // Prefer denormalized "views" when available; fall back to normalized CSVs
      // const [clients, portfolioHeaders, portfolios, shares, teams, users] = await Promise.all([
      //   fetchMockCsvFirst(['clients_view.csv', 'clients.csv']),
      //   fetchMockCsvFirst(['portfolio_headers_view.csv', 'portfolio_headers.csv']),
      //   fetchMockCsvFirst(['portfolio_view.csv', 'portfolio.csv']),
      //   fetchMockCsvFirst(['portfolio_share_view.csv', 'portfolio_share.csv']),
      //   fetchMockCsvFirst(['teams_view.csv', 'teams.csv']),
      //   fetchMockCsvFirst(['users_view.csv', 'users.csv']),
      // ])
      const [clients, portfolioHeaders, shares, teams, users] = await Promise.all([
        apiClient.get(APIEndpoints.getAllClients),
        apiClient.get(APIEndpoints.getAllPortfolioHeaderData),
        apiClient.get(APIEndpoints.getAllPortfolioSharingView),
        apiClient.get(APIEndpoints.getAllTeams),
        apiClient.get(APIEndpoints.getAllUserDataView),
      ])
      runInAction(() => {
        this.clients = clients.data
        this.portfolioHeaders = portfolioHeaders.data
        this.portfolios = portfolioHeaders.data
        this.shares = shares.data
        this.teams = teams.data
        this.users = users.data
        this.loading = false
      })
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : String(err)
        this.loading = false
      })
    }
  }
}

export const dataStore = new DataStore()
