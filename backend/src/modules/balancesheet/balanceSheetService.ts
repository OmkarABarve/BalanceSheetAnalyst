import { supabase } from '../../database/supabaseClient'
import { 
  BalanceSheet, 
  BalanceSheetData, 
  VectorEmbedding, 
  AnalysisMetric,
  CreateBalanceSheetData,
  CreateBalanceSheetDataEntry,
  CreateVectorEmbeddingData,
  CreateAnalysisMetricData,
  Company,
  User
} from '../../../../frontend/src/types'

export const BalanceSheetService = {
  // Get all balance sheets for a user's companies
  async getBalanceSheets(userId: string): Promise<BalanceSheet[]> {
    // First get user's company roles to know which companies they have access to
    const { data: userCompanies } = await supabase
      .from('user_company_roles')
      .select('company_id')
      .eq('user_id', userId)

    if (!userCompanies || userCompanies.length === 0) {
      return []
    }

    const companyIds = userCompanies.map(uc => uc.company_id)

    const { data, error } = await supabase
      .from('balance_sheets')
      .select(`
        *,
        companies (
          id,
          name,
          created_at
        )
      `)
      .in('company_id', companyIds)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching balance sheets:', error)
      throw new Error(`Failed to fetch balance sheets: ${error.message}`)
    }

    return data || []
  },

  // Get a single balance sheet with its data
  async getBalanceSheet(id: string, userId: string): Promise<BalanceSheet | null> {
    // First check if user has access to this balance sheet
    const { data: balanceSheet, error: bsError } = await supabase
      .from('balance_sheets')
      .select(`
        *,
        companies (
          id,
          name,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (bsError) {
      if (bsError.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch balance sheet: ${bsError.message}`)
    }

    // Check if user has access to this company
    const { data: userCompany } = await supabase
      .from('user_company_roles')
      .select('company_id')
      .eq('user_id', userId)
      .eq('company_id', balanceSheet.company_id)
      .single()

    if (!userCompany) {
      throw new Error('Access denied to this balance sheet')
    }

    // Get the balance sheet data entries
    const balanceSheetData = await this.getBalanceSheetData(id)

    return {
      ...balanceSheet,
      balance_sheet_data: balanceSheetData
    }
  },

  // Get balance sheet data entries for a balance sheet
  async getBalanceSheetData(balanceSheetId: string): Promise<BalanceSheetData[]> {
    const { data, error } = await supabase
      .from('balance_sheet_data')
      .select(`
        *,
        vector_embeddings (
          id,
          embedding,
          chunk_text
        )
      `)
      .eq('balance_sheet_id', balanceSheetId)

    if (error) {
      console.error('Error fetching balance sheet data:', error)
      throw new Error(`Failed to fetch balance sheet data: ${error.message}`)
    }

    return data || []
  },

  // Create a new balance sheet
  async createBalanceSheet(
    balanceSheetData: CreateBalanceSheetData,
    userId: string
  ): Promise<BalanceSheet> {
    // Verify user has access to the company
    const { data: userCompany } = await supabase
      .from('user_company_roles')
      .select('company_id')
      .eq('user_id', userId)
      .eq('company_id', balanceSheetData.company_id)
      .single()

    if (!userCompany) {
      throw new Error('Access denied to create balance sheets for this company')
    }

    const { data, error } = await supabase
      .from('balance_sheets')
      .insert({
        ...balanceSheetData,
        uploaded_at: new Date().toISOString(),
      })
      .select(`
        *,
        companies (
          id,
          name,
          created_at
        )
      `)
      .single()

    if (error) {
      console.error('Error creating balance sheet:', error)
      throw new Error(`Failed to create balance sheet: ${error.message}`)
    }

    return data
  },

  // Create balance sheet data entry
  async createBalanceSheetData(
    dataEntry: CreateBalanceSheetDataEntry
  ): Promise<BalanceSheetData> {
    const { data, error } = await supabase
      .from('balance_sheet_data')
      .insert(dataEntry)
      .select(`
        *,
        vector_embeddings (
          id,
          embedding,
          chunk_text
        )
      `)
      .single()

    if (error) {
      console.error('Error creating balance sheet data:', error)
      throw new Error(`Failed to create balance sheet data: ${error.message}`)
    }

    return data
  },

  // Create vector embedding
  async createVectorEmbedding(
    embeddingData: CreateVectorEmbeddingData
  ): Promise<VectorEmbedding> {
    const { data, error } = await supabase
      .from('vector_embeddings')
      .insert(embeddingData)
      .select()
      .single()

    if (error) {
      console.error('Error creating vector embedding:', error)
      throw new Error(`Failed to create vector embedding: ${error.message}`)
    }

    return data
  },

  // Get vector embeddings for a balance sheet data entry
  async getVectorEmbeddings(balanceSheetDataId: string): Promise<VectorEmbedding[]> {
    const { data, error } = await supabase
      .from('vector_embeddings')
      .select()
      .eq('balance_sheet_data_id', balanceSheetDataId)

    if (error) {
      console.error('Error fetching vector embeddings:', error)
      throw new Error(`Failed to fetch vector embeddings: ${error.message}`)
    }

    return data || []
  },

  // Search similar content using vector similarity
  async searchSimilarContent(
    queryEmbedding: number[],
    companyId: string,
    limit: number = 5
  ): Promise<{ embedding: VectorEmbedding; similarity: number }[]> {
    // This would typically use pgvector for similarity search
    // For now, returning a placeholder implementation
    const { data, error } = await supabase
      .from('vector_embeddings')
      .select(`
        *,
        balance_sheet_data (
          balance_sheet_id,
          balance_sheets (
            company_id
          )
        )
      `)
      .eq('balance_sheet_data.balance_sheets.company_id', companyId)
      .limit(limit)

    if (error) {
      console.error('Error searching similar content:', error)
      throw new Error(`Failed to search similar content: ${error.message}`)
    }

    // Note: Real implementation would use vector similarity functions
    // This is a placeholder that returns embeddings for the company
    return (data || []).map(embedding => ({
      embedding,
      similarity: 0.8 // Placeholder similarity score
    }))
  },

  // Get analysis metrics for a company
  async getAnalysisMetrics(companyId: string, year?: number): Promise<AnalysisMetric[]> {
    let query = supabase
      .from('analysis_metrics')
      .select()
      .eq('company_id', companyId)

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching analysis metrics:', error)
      throw new Error(`Failed to fetch analysis metrics: ${error.message}`)
    }

    return data || []
  },

  // Create analysis metric
  async createAnalysisMetric(
    metricData: CreateAnalysisMetricData
  ): Promise<AnalysisMetric> {
    const { data, error } = await supabase
      .from('analysis_metrics')
      .insert(metricData)
      .select()
      .single()

    if (error) {
      console.error('Error creating analysis metric:', error)
      throw new Error(`Failed to create analysis metric: ${error.message}`)
    }

    return data
  },

  // Get companies accessible to a user
  async getUserCompanies(userId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('user_company_roles')
      .select(`
        companies (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user companies:', error)
      throw new Error(`Failed to fetch user companies: ${error.message}`)
    }

    // Extract unique companies
    const companies = data?.map(item => item.companies).filter(Boolean) || []
    return Array.from(new Map(companies.map(c => [c.id, c])).values())
  },

  // Get balance sheets by company
  async getBalanceSheetsByCompany(
    companyId: string,
    userId: string
  ): Promise<BalanceSheet[]> {
    // Verify user has access to this company
    const { data: userCompany } = await supabase
      .from('user_company_roles')
      .select('company_id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single()

    if (!userCompany) {
      throw new Error('Access denied to balance sheets for this company')
    }

    const { data, error } = await supabase
      .from('balance_sheets')
      .select(`
        *,
        companies (
          id,
          name,
          created_at
        )
      `)
      .eq('company_id', companyId)
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching balance sheets by company:', error)
      throw new Error(`Failed to fetch balance sheets: ${error.message}`)
    }

    return data || []
  },

  // Get balance sheets by year
  async getBalanceSheetsByYear(
    year: number,
    userId: string
  ): Promise<BalanceSheet[]> {
    // Get user's companies first
    const userCompanies = await this.getUserCompanies(userId)
    const companyIds = userCompanies.map(c => c.id)

    if (companyIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('balance_sheets')
      .select(`
        *,
        companies (
          id,
          name,
          created_at
        )
      `)
      .in('company_id', companyIds)
      .eq('year', year)

    if (error) {
      console.error('Error fetching balance sheets by year:', error)
      throw new Error(`Failed to fetch balance sheets: ${error.message}`)
    }

    return data || []
  },

  // Extract financial data from balance sheet data entries
  extractFinancialData(balanceSheetData: BalanceSheetData[]): {
    totalAssets?: number
    totalLiabilities?: number
    totalEquity?: number
    [key: string]: any
  } {
    const result: any = {}

    for (const entry of balanceSheetData) {
      const data = entry.data

      // Extract common financial metrics
      if (data.total_assets !== undefined) result.totalAssets = data.total_assets
      if (data.total_liabilities !== undefined) result.totalLiabilities = data.total_liabilities
      if (data.total_equity !== undefined) result.totalEquity = data.total_equity

      // Extract other financial data
      Object.assign(result, data)
    }

    return result
  },

  // Calculate financial ratios from extracted data
  calculateRatios(financialData: any) {
    const { totalAssets, totalLiabilities, totalEquity } = financialData

    if (!totalAssets || !totalLiabilities || !totalEquity) {
      return null
    }

    return {
      debt_to_equity_ratio: totalEquity !== 0 ? totalLiabilities / totalEquity : 0,
      current_ratio: totalAssets !== 0 ? totalAssets / totalLiabilities : 0,
      equity_ratio: totalAssets !== 0 ? totalEquity / totalAssets : 0,
      debt_ratio: totalAssets !== 0 ? totalLiabilities / totalAssets : 0,
    }
  },

  // Get dashboard statistics for a user
  async getDashboardStats(userId: string) {
    const balanceSheets = await this.getBalanceSheets(userId)

    if (balanceSheets.length === 0) {
      return {
        totalBalanceSheets: 0,
        companiesCount: 0,
        latestYear: null,
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
      }
    }

    const companies = await this.getUserCompanies(userId)
    const latest = balanceSheets[0]

    // Get financial data from the latest balance sheet
    const latestBalanceSheetData = await this.getBalanceSheetData(latest.id)
    const financialData = this.extractFinancialData(latestBalanceSheetData)

    return {
      totalBalanceSheets: balanceSheets.length,
      companiesCount: companies.length,
      latestYear: latest.year,
      totalAssets: financialData.totalAssets || 0,
      totalLiabilities: financialData.totalLiabilities || 0,
      totalEquity: financialData.totalEquity || 0,
    }
  },
}