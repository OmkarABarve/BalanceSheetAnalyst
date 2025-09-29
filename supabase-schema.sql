-- Enable Row Level Security (RLS)
-- Create balance_sheets table
CREATE TABLE IF NOT EXISTS balance_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  total_assets DECIMAL(15,2) DEFAULT 0,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  total_equity DECIMAL(15,2) DEFAULT 0,
  
  -- Optional detailed breakdowns (stored as JSONB)
  assets_breakdown JSONB DEFAULT '{}',
  liabilities_breakdown JSONB DEFAULT '{}',
  equity_breakdown JSONB DEFAULT '{}',
  
  -- Additional metadata
  notes TEXT,
  currency TEXT DEFAULT 'USD',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only have one balance sheet per company per fiscal year
  UNIQUE(user_id, company_name, fiscal_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_balance_sheets_user_id ON balance_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_company_name ON balance_sheets(company_name);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_fiscal_year ON balance_sheets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_created_at ON balance_sheets(created_at);

-- Enable Row Level Security
ALTER TABLE balance_sheets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own balance sheets
CREATE POLICY "Users can view own balance sheets" ON balance_sheets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own balance sheets
CREATE POLICY "Users can insert own balance sheets" ON balance_sheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own balance sheets
CREATE POLICY "Users can update own balance sheets" ON balance_sheets
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own balance sheets
CREATE POLICY "Users can delete own balance sheets" ON balance_sheets
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_balance_sheets_updated_at
  BEFORE UPDATE ON balance_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
