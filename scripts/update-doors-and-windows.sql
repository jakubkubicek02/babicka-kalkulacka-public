-- Update existing "Výměna oken a dveří" to "Dveře"
UPDATE pricing 
SET item_name = 'Dveře', 
    webhook_name = 'Dveře',
    notes = 'Výměna dveří'
WHERE item_name = 'Výměna oken a dveří';

-- Add new item "Vstupní dveře s mléčným sklem"
INSERT INTO pricing (
  item_name, 
  grant_amount, 
  price_under_400k, 
  surcharge_under_400k, 
  price_over_400k, 
  surcharge_over_400k, 
  is_per_square_meter, 
  webhook_name,
  notes
) VALUES (
  'Vstupní dveře s mléčným sklem',
  4900,
  7500,
  2600,
  7850,
  2950,
  false,
  'Vstupní dveře s mléčným sklem',
  'Vstupní dveře s mléčným sklem'
) ON CONFLICT (item_name) DO NOTHING;
