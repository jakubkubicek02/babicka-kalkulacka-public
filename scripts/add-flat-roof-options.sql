-- Add new flat roof options to pricing table
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
) VALUES 
(
  'Rovná střecha s dutinou',
  1300,
  1680,
  380,
  2030,
  730,
  false,
  'Rovná střecha s dutinou',
  'Zateplení rovné střechy s dutinou'
),
(
  'Rovná střecha bez dutiny',
  1300,
  1680,
  380,
  2030,
  730,
  false,
  'Rovná střecha bez dutiny',
  'Zateplení rovné střechy bez dutiny'
) ON CONFLICT (item_name) DO NOTHING;
