export interface SearchResult {
  id: string
  platform: string
  title: string
  url: string
  snippet: string
  displayedLink: string
  // Engagement metrics
  upvotes?: number
  comments?: number
  shares?: number
  views?: number
  awards?: number
  date?: string
  // Generic score for sorting
  engagementScore?: number
}

export interface SearchResponse {
  results: SearchResult[]
  cached: boolean
  searchId?: string
}

export interface ReportContent {
  markdown: string
}

export interface Report {
  id: string
  user_id: string
  search_result_id: string | null
  report_type: 'summary' | 'mvp_builder'
  selected_results: SearchResult[]
  report_content: ReportContent
  created_at: string
  updated_at: string
}

export interface GenerateReportRequest {
  reportType: 'summary' | 'mvp_builder'
  selectedResults: SearchResult[]
  searchResultId?: string
}

export interface GenerateReportResponse {
  report: Report
  content: string
}

export interface UserCredits {
  user_id: string
  credits_remaining: number
  total_credits_purchased: number
  created_at: string
  updated_at: string
}

export const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  reddit: '#FF4500',
  youtube: '#FF0000',
  discord: '#5865F2',
  tiktok: '#000000',
  nextdoor: '#00B246',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  quora: '#B92B27',
  forums: '#666666',
  local: '#4CAF50',
}

export const PLATFORM_NAMES: Record<string, string> = {
  facebook: 'Facebook',
  reddit: 'Reddit',
  youtube: 'YouTube',
  discord: 'Discord',
  tiktok: 'TikTok',
  nextdoor: 'Nextdoor',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  quora: 'Quora',
  forums: 'Forums',
  local: 'Local Sites',
}
