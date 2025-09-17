import { makeAutoObservable, runInAction } from 'mobx'
import { apiClient } from '../API/apiservises'
import APIEndpoints from '../API/profile/APIEndpoints'
import { dataStore } from '../stores/dataStore' // ✅ Make sure this is the correct path

class UiStore {
  activeTab = 'clients'
  selectedPortfolioId = null // string | null

  constructor() {
    makeAutoObservable(this)
  }

  setActiveTab = (tab) => {
    this.activeTab = tab
  }

  setSelectedPortfolioId = async (id) => {
    runInAction(() => {
      this.selectedPortfolioId = id
    })

    if (id) {
      try {
        const response = await apiClient.get(
          APIEndpoints.getAllPortfolioHoldingsById.replace('{portfolio_id}', id)
        )
        runInAction(() => {
          dataStore.UpdateHoldingData(response.portfolio_details)
        })
      } catch (error) {
        console.error('Error fetching portfolio holdings:', error)
        runInAction(() => {
          dataStore.UpdateHoldingData([])
        })
      }
    } else {
      dataStore.UpdateHoldingData([])
    }
  }

  goToPortfolioHoldings = (id) => {
    runInAction(() => {
      this.selectedPortfolioId = id ? String(id) : null
      this.setSelectedPortfolioId(id)
      this.activeTab = 'portfolios'
    })
  }
}

export const uiStore = new UiStore()
