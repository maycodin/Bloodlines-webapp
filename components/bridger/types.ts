export interface BridgerDashboardData {
  activeRequests: number;
  donorsNearby: number;
  inventorySummary: any[];
  donationActivity?: { totalUnitsFulfilled: number; totalFulfilledRequests: number };
  requestOverview?: { totalRequests: number; fulfilledRequests: number; overallFulfillmentRate: number };
  donorResponseMetrics?: { accepted: number; rejected: number; noResponse: number };
  monthlyActiveRequests?: { month: string; monthIndex: number; activeRequests: number; totalRequests: number }[];
  monthlyAverageResponseTime?: { month: string; monthIndex: number; averageMinutes: number; formattedDuration: string; totalFulfilled: number }[];
}
