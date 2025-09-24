import profile from "./profile";
const APIEndpoints = {
    getAllClients: `${profile.getBaseUrl()}/admin-client-view/`,
    getAllTeams: `${profile.getBaseUrl()}/admin-teams-view/`,
    getAllUserDataView:`${profile.getBaseUrl()}/admin-user-view/`,
    getAllPortfolioHeaderData: `${profile.getBaseUrl()}/admin-portfolio-view/`,
    getAllPortfolioHoldingsById: `${profile.getBaseUrl()}/admin-portfolio-holdings-view/?portfolio_id={portfolio_id}`,
    getAllPortfolioSharingView: `${profile.getBaseUrl()}/admin-portfolio-sharing-view/`,
};
export default APIEndpoints;