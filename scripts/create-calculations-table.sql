-- Create calculations table
CREATE TABLE IF NOT EXISTS calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  selections JSONB NOT NULL DEFAULT '{}',
  totals JSONB NOT NULL DEFAULT '{}',
  contact_form JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_calculations_email ON calculations(email);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_calculations_updated_at ON calculations(updated_at);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive)
CREATE POLICY "Allow all operations on calculations" ON calculations
  FOR ALL USING (true);
