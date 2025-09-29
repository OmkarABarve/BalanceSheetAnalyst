-- Enable Row Level Security (RLS)
-- Create balance_sheets table
-- Updated balance_sheets table
CREATE TABLE IF NOT EXISTS balance_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL, -- Changed from user_id
  year INTEGER NOT NULL,    -- Changed from fiscal_year
  pdf_storage_path TEXT,    -- NEW: For PDF file path
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Financial data (keep existing)
  total_assets DECIMAL(15,2) DEFAULT 0,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  total_equity DECIMAL(15,2) DEFAULT 0,
  assets_breakdown JSONB DEFAULT '{}',
  liabilities_breakdown JSONB DEFAULT '{}',
  equity_breakdown JSONB DEFAULT '{}',
  
  -- Metadata
  notes TEXT,
  currency TEXT DEFAULT 'USD',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(company_id, year) -- One balance sheet per company per year
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_balance_sheets_company_id ON balance_sheets(company_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_year ON balance_sheets(year);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_uploaded_by ON balance_sheets(uploaded_by);

-- Enable RLS
ALTER TABLE balance_sheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view balance sheets from their companies" ON balance_sheets
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    company_id IN (
      SELECT company_id FROM user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert balance sheets for their companies" ON balance_sheets
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    company_id IN (
      SELECT company_id FROM user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update balance sheets they uploaded" ON balance_sheets
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete balance sheets they uploaded" ON balance_sheets
  FOR DELETE USING (uploaded_by = auth.uid());

-- Update trigger
CREATE TRIGGER update_balance_sheets_updated_at
  BEFORE UPDATE ON balance_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
