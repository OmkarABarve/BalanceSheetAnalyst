// backend/src/types/index.ts

export interface User {
    id: string
    email: string
    created_at: string
    updated_at: string
  }
  
  export interface Role {
    id: number
    name: string
  }
  
  export interface Company {
    id: string
    name: string
    created_at: string
  }
  
  export interface UserCompanyRole {
    user_id: string
    company_id: string
    role_id: number
  }
  
  // Updated to match your balance_sheets table
  export interface BalanceSheet {
    id: string
    company_id: string
    year: number
    pdf_storage_path: string
    uploaded_at: string
    // Joined data from related tables
    company?: Company
    balance_sheet_data?: BalanceSheetData[]
  }
  
  // Updated to match your balance_sheet_data table
  export interface BalanceSheetData {
    id: string
    balance_sheet_id: string
    data: Record<string, any> // JSONB field for structured financial data
    extracted_text: string
    // Joined data
    vector_embeddings?: VectorEmbedding[]
  }
  
  // Updated to match your vector_embeddings table
  export interface VectorEmbedding {
    id: string
    balance_sheet_data_id: string
    embedding: number[] // Vector type
    chunk_text: string
  }
  
  // Analysis metrics interface
  export interface AnalysisMetric {
    id: string
    company_id: string
    year: number
    kpi_type: string
    value: number
  }
  export interface SignInRequest {
    email: string
    password: string
  }
  
  export interface SignUpRequest {
    email: string
    password: string
  }
  
  // Input types for creating data
  export interface CreateBalanceSheetData {
    company_id: string
    year: number
    pdf_storage_path: string
  }
  
  export interface CreateBalanceSheetDataEntry {
    balance_sheet_id: string
    data: Record<string, any>
    extracted_text: string
  }
  
  export interface CreateVectorEmbeddingData {
    balance_sheet_data_id: string
    embedding: number[]
    chunk_text: string
  }
  
  export interface CreateAnalysisMetricData {
    company_id: string
    year: number
    kpi_type: string
    value: number
  }
  
  // API Response types
  export interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
  }
  
  // Request/Response types for API endpoints
  export interface ChatRequest {
    query: string
    context?: string
  }
  
  export interface ChatResponse {
    response: string
  }
  
  export interface BalanceSheetListResponse {
    balance_sheets: BalanceSheet[]
    total_count: number
  }
  
  export interface AuthResponse {
    user: User | null
    session: any | null
  }
  
  // Database query result types
  export interface DatabaseResult<T> {
    data: T | null
    error: any
  }
  
  // Service method parameter types
  export interface GetBalanceSheetsParams {
    userId: string
    companyId?: string
    year?: number
    limit?: number
    offset?: number
  }
  
  export interface CreateBalanceSheetParams {
    company_id: string
    year: number
    pdf_storage_path: string
    uploaded_by: string
  }
  
  // Error types
  export interface AppError {
    message: string
    code: string
    details?: any
  }