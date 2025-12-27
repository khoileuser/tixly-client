export interface AnalyticsData {
    totalUsers: number
    totalEvents: number
    totalTicketsSold: number
    totalRevenue: number
    pendingBookings: number
    recentActivity: {
        type: string
        description: string
        timestamp: string
    }[]
}
