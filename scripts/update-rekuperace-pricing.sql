-- Update rekuperace pricing to match the new requirements
UPDATE pricing 
SET 
  grant_amount = 90000,
  price_under_400k = 130000,
  surcharge_under_400k = 40000,
  price_over_400k = 130000,
  surcharge_over_400k = 40000,
  notes = 'Rekuperace - dotace 90 000 Kč fixní, doplatek 40 000 Kč za jednotku'
WHERE item_name = 'Rekuperace';
