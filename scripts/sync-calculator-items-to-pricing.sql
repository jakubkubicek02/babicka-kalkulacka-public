-- Synchronize all calculator items to pricing table
-- Insert missing items that exist in calculator but not in pricing

-- Zateplení fasády
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Fasáda polystyren', 'Fasáda polystyren', 1300, 2800, 1500, 2599, 1298, 'Fasáda polystyren', 'Zateplení fasády polystyrenem')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Fasáda Minerální vata', 'Fasáda Minerální vata', 1300, 3001, 1701, 3651, 2351, 'Fasáda Minerální vata', 'Zateplení fasády minerální vatou')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Fasáda difusně otevřené', 'Fasáda difusně otevřené', 1300, 3001, 1701, 3651, 2351, 'Fasáda difusně otevřené', 'Zateplení fasády difusně otevřeným materiálem')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Zateplení stropu
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Strop pod nevytápěnou půdou', 'Strop pod nevytápěnou půdou', 500, 850, 350, 1200, 700, 'Strop pod nevytápěnou půdou', 'Zateplení stropu pod nevytápěnou půdou')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Svislá konstrukce pod nevytápěnou půdou', 'Svislá konstrukce pod nevytápěnou půdou', 500, 850, 350, 1200, 700, 'Svislá konstrukce pod nevytápěnou půdou', 'Zateplení svislé konstrukce pod nevytápěnou půdou')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Zateplení střechy
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Rovná střecha s dutinou', 'Rovná střecha s dutinou', 1300, 1680, 380, 2030, 730, 'Rovná střecha s dutinou', 'Zateplení rovné střechy s dutinou')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Rovná střecha bez dutiny', 'Rovná střecha bez dutiny', 1300, 1680, 380, 2030, 730, 'Rovná střecha bez dutiny', 'Zateplení rovné střechy bez dutiny')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Šikmá střecha s dutinou', 'Šikmá střecha s dutinou', 1300, 1680, 380, 2030, 730, 'Šikmá střecha s dutinou', 'Zateplení šikmé střechy s dutinou')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Zateplení podlahy
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Konstrukce k zemině', 'Konstrukce k zemině', 1700, 2464, 764, 2814, 1114, 'Konstrukce k zemině', 'Zateplení konstrukce k zemině')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Výměna oken a dveří
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Dveře', 'Dveře', 4900, 7504, 2604, 7854, 2954, 'Dveře', 'Výměna dveří')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Okna', 'Okna', 4900, 7504, 2604, 7854, 2954, 'Okna', 'Výměna oken')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Vstupní dveře s mléčným sklem', 'Vstupní dveře s mléčným sklem', 4900, 7500, 2600, 7850, 2950, 'Vstupní dveře s mléčným sklem', 'Vstupní dveře s mléčným sklem')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Venkovní žaluzie
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, is_per_square_meter, webhook_name, notes) VALUES
('Venkovní žaluzie', 'Venkovní žaluzie', 1500, 12668, 11168, 12668, 11168, true, 'Venkovní žaluzie', 'Venkovní žaluzie - základní položka')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes,
  is_per_square_meter = EXCLUDED.is_per_square_meter;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, is_per_square_meter, webhook_name, notes) VALUES
('Velikost oken (m²)', 'Velikost oken (m²)', 0, 0, 0, 0, 0, true, 'Velikost oken (m²)', 'Velikost oken pro výpočet žaluzií')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes,
  is_per_square_meter = EXCLUDED.is_per_square_meter;

-- Dešťová voda
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Zpracování dešťové vody', 'Zpracování dešťové vody', 20000, 20000, 0, 20000, 0, 'Zpracování dešťové vody', 'Zpracování dešťové vody')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Velikost nádrže', 'Velikost nádrže', 3000, 12000, 9000, 14000, 11000, 'Velikost nádrže', 'Velikost nádrže na dešťovou vodu')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Tepelná čerpadla
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Pro menší domácnosti', 'Pro menší domácnosti', 75000, 252000, 177000, 302000, 227000, 'Pro menší domácnosti', 'Tepelné čerpadlo pro menší domácnosti')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Do 200 m² užitné plochy', 'Do 200 m² užitné plochy', 75000, 291200, 216200, 341200, 266200, 'Do 200 m² užitné plochy', 'Tepelné čerpadlo do 200 m²')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('300 m² užitné plochy a více', '300 m² užitné plochy a více', 75000, 319200, 244200, 369200, 294200, '300 m² užitné plochy a více', 'Tepelné čerpadlo 300 m² a více')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Pouze vytápění', 'Pouze vytápění', 0, 0, 0, 0, 0, 'Pouze vytápění', 'Tepelné čerpadlo pouze vytápění')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Vytápění + ohřev vody', 'Vytápění + ohřev vody', 15000, 15000, 0, 15000, 0, 'Vytápění + ohřev vody', 'Tepelné čerpadlo s ohřevem vody')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Fotovoltaický ohřev vody
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Mám rovnou střechu', 'Mám rovnou střechu', 35000, 87584, 52584, 102584, 67584, 'Mám rovnou střechu', 'FV ohřev vody - rovná střecha')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Mám šikmou střechu', 'Mám šikmou střechu', 35000, 80976, 45976, 95976, 60976, 'Mám šikmou střechu', 'FV ohřev vody - šikmá střecha')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Mám elektrický bojler', 'Mám elektrický bojler', 0, 0, 0, 0, 0, 'Mám elektrický bojler', 'Mám elektrický bojler')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Nemám elektrický bojler', 'Nemám elektrický bojler', 13552, 13552, 0, 13552, 0, 'Nemám elektrický bojler', 'Nemám elektrický bojler')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Fotovoltaika
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('5 kWp - nejlevnější sestava', '5 kWp - nejlevnější sestava', 100000, 251200, 151200, 301200, 201200, '5 kWp - nejlevnější sestava', 'FVE 5 kWp')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('7 kWp - zlatá střední cesta', '7 kWp - zlatá střední cesta', 100000, 296000, 196000, 346000, 246000, '7 kWp - zlatá střední cesta', 'FVE 7 kWp')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('10 kWp - doporučeno', '10 kWp - doporučeno', 100000, 318400, 218400, 368400, 268400, '10 kWp - doporučeno', 'FVE 10 kWp')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('14 kWp - pro velké domy', '14 kWp - pro velké domy', 100000, 419200, 319200, 469200, 369200, '14 kWp - pro velké domy', 'FVE 14 kWp')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Zapojení do sítě', 'Zapojení do sítě', 40000, 40000, 0, 40000, 0, 'Zapojení do sítě', 'Zapojení FVE do sítě')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Dobíjecí stanice pro elektromobil', 'Dobíjecí stanice pro elektromobil', 15000, 15000, 0, 15000, 0, 'Dobíjecí stanice pro elektromobil', 'Dobíjecí stanice')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Řízené větrání
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Rekuperace', 'Rekuperace', 90000, 130000, 40000, 130000, 40000, 'Rekuperace', 'Rekuperace - dotace 90 000 Kč fixní, doplatek 40 000 Kč za jednotku')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

-- Bonusy
INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Bonus na projektovou dokumentaci 50 000 Kč', 'Bonus na projektovou dokumentaci 50 000 Kč', 50000, 50000, 0, 50000, 0, 'Bonus na projektovou dokumentaci 50 000 Kč', 'Automatický bonus na projektovou dokumentaci')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Zateplení + FVE (jakákoliv)', 'Zateplení + FVE (jakákoliv)', 50000, 50000, 0, 50000, 0, 'Zateplení + FVE (jakákoliv)', 'Automatický bonus za kombinaci zateplení a FVE')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Zateplení + zdroj tepla', 'Zateplení + zdroj tepla', 50000, 50000, 0, 50000, 0, 'Zateplení + zdroj tepla', 'Automatický bonus za kombinaci zateplení a zdroje tepla')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Bonus pro vybrané regiony a obce (5 % z celkové výše podpory)', 'Bonus pro vybrané regiony a obce (5 % z celkové výše podpory)', 0, 0, 0, 0, 0, 'Bonus pro vybrané regiony a obce (5 % z celkové výše podpory)', 'Regionální bonus 5%')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Rodinný bonus za neopatřené dítě', 'Rodinný bonus za neopatřené dítě', 50000, 50000, 0, 50000, 0, 'Rodinný bonus za neopatřené dítě', 'Rodinný bonus za neopatřené dítě')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;

INSERT INTO pricing (item_name, display_name, grant_amount, price_under_400k, surcharge_under_400k, price_over_400k, surcharge_over_400k, webhook_name, notes) VALUES
('Rodinný bonus za dítě ve střídavé péči', 'Rodinný bonus za dítě ve střídavé péči', 25000, 25000, 0, 25000, 0, 'Rodinný bonus za dítě ve střídavé péči', 'Rodinný bonus za dítě ve střídavé péči')
ON CONFLICT (item_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  webhook_name = EXCLUDED.webhook_name,
  notes = EXCLUDED.notes;
