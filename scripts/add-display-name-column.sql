-- Add display_name column to pricing table
ALTER TABLE pricing 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Update existing records to have display_name same as item_name initially
UPDATE pricing 
SET display_name = item_name 
WHERE display_name IS NULL;

-- Update some specific items to have better display names
UPDATE pricing SET display_name = '10 kWp - doporučeno' WHERE item_name = '10 kWp - doporučeno';
UPDATE pricing SET display_name = '14 kWp - pro velké domy' WHERE item_name = '14 kWp - pro velké domy';
UPDATE pricing SET display_name = '5 kWp - nejlevnější sestava' WHERE item_name = '5 kWp - nejlevnější sestava';
UPDATE pricing SET display_name = '7 kWp - zlatá střední cesta' WHERE item_name = '7 kWp - zlatá střední cesta';
