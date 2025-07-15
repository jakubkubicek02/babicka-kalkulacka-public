-- Update pricing for venkovní žaluzie to correct values
UPDATE pricing 
SET 
  grant_amount = 1500,
  price_under_400k = 12668,
  surcharge_under_400k = 11168,
  price_over_400k = 12668,
  surcharge_over_400k = 11168,
  notes = 'Venkovní žaluzie - cena za m² podle velikosti oken'
WHERE item_name = 'Venkovní žaluzie';

-- Update "Velikost oken" to have zero values since it only serves as multiplier
UPDATE pricing 
SET 
  grant_amount = 0,
  price_under_400k = 0,
  surcharge_under_400k = 0,
  price_over_400k = 0,
  surcharge_over_400k = 0,
  notes = 'Velikost oken - pouze multiplikátor pro venkovní žaluzie'
WHERE item_name = 'Velikost oken (m²)';
