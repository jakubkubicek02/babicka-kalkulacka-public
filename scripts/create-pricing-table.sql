-- Create pricing table
CREATE TABLE IF NOT EXISTS pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name VARCHAR(255) UNIQUE NOT NULL,
  grant_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_under_400k DECIMAL(10,2) NOT NULL DEFAULT 0,
  surcharge_under_400k DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_over_400k DECIMAL(10,2) NOT NULL DEFAULT 0,
  surcharge_over_400k DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_per_square_meter BOOLEAN DEFAULT FALSE,
  webhook_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on item_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_pricing_item_name ON pricing(item_name);

-- Enable Row Level Security
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive)
CREATE POLICY "Allow all operations on pricing" ON pricing
  FOR ALL USING (true);

-- Insert pricing data
INSERT INTO pricing (item_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, is_per_square_meter, notes) VALUES
('Fasáda polystyren', 1300, 2800, 1500, 2599, 1298, false, 'Zateplení fasády polystyrenem'),
('Fasáda Minerální vata', 1300, 3001, 1701, 3651, 2351, false, 'Zateplení fasády minerální vatou'),
('Fasáda difusně otevřené', 1300, 3001, 1701, 3651, 2351, false, 'Zateplení fasády difusně otevřeným materiálem'),
('Střecha bez záklopu', 1300, 1680, 380, 2030, 730, false, 'Zateplení střechy bez záklopu'),
('Střecha se záklopem', 1300, 2576, 1276, 2926, 1626, false, 'Zateplení střechy se záklopem'),
('Strop pod nevytápěnou půdou', 500, 850, 350, 1200, 700, false, 'Zateplení stropu pod nevytápěnou půdou'),
('Strop sklepa', 500, 850, 350, 1200, 700, false, 'Zateplení stropu sklepa'),
('Konstrukce k zemině', 1700, 2464, 764, 2814, 1114, false, 'Zateplení konstrukce k zemině'),
('Výměna oken a dveří', 4900, 7504, 2604, 7854, 2954, false, 'Výměna oken a dveří'),
('Okna', 4900, 7504, 2604, 7854, 2954, false, 'Výměna oken'),
('Venkovní žaluzie', 1500, 12668, 11168, 12668, 11168, true, 'Venkovní žaluzie - základní položka'),
('Velikost oken (m²)', 0, 12668, 11168, 12668, 11168, true, 'Velikost oken pro výpočet žaluzií'),
('Pro menší domácnosti', 75000, 252000, 177000, 302000, 227000, false, 'Tepelné čerpadlo pro menší domácnosti'),
('Do 200 m² užitné plochy', 75000, 291200, 216200, 341200, 266200, false, 'Tepelné čerpadlo do 200 m²'),
('300 m² užitné plochy a více', 75000, 319200, 244200, 369200, 294200, false, 'Tepelné čerpadlo 300 m² a více'),
('Pouze vytápění', 0, 0, 0, 0, 0, false, 'Tepelné čerpadlo pouze vytápění'),
('Vytápění + ohřev vody', 15000, 15000, 0, 15000, 0, false, 'Tepelné čerpadlo s ohřevem vody'),
('Mám rovnou střechu', 35000, 87584, 52584, 102584, 67584, false, 'FV ohřev vody - rovná střecha'),
('Mám šikmou střechu', 35000, 80976, 45976, 95976, 60976, false, 'FV ohřev vody - šikmá střecha'),
('Mám elektrický bojler', 0, 0, 0, 0, 0, false, 'Mám elektrický bojler'),
('Nemám elektrický bojler', 13552, 13552, 0, 13552, 0, false, 'Nemám elektrický bojler'),
('5 kWp - nejlevnější sestava', 100000, 251200, 151200, 301200, 201200, false, 'FVE 5 kWp'),
('7 kWp - zlatá střední cesta', 100000, 296000, 196000, 346000, 246000, false, 'FVE 7 kWp'),
('10 kWp - doporučeno', 100000, 318400, 218400, 368400, 268400, false, 'FVE 10 kWp'),
('14 kWp - pro velké domy', 100000, 419200, 319200, 469200, 369200, false, 'FVE 14 kWp'),
('Zapojení do sítě', 40000, 40000, 0, 40000, 0, false, 'Zapojení FVE do sítě'),
('Dobíjecí stanice pro elektromobil', 15000, 15000, 0, 15000, 0, false, 'Dobíjecí stanice'),
('Rekuperace', 90000, 235200, 145200, 285200, 195200, false, 'Rekuperační jednotka'),
('Zpracování dešťové vody', 20000, 20000, 0, 20000, 0, false, 'Zpracování dešťové vody'),
('Velikost nádrže', 3000, 12000, 9000, 14000, 11000, false, 'Velikost nádrže na dešťovou vodu');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pricing_updated_at 
    BEFORE UPDATE ON pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
