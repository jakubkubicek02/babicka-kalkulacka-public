-- Update existing "Strop sklepa" to "Svislá konstrukce pod nevytápěnou půdou"
UPDATE pricing 
SET item_name = 'Svislá konstrukce pod nevytápěnou půdou', 
    webhook_name = 'Svislá konstrukce pod nevytápěnou půdou',
    notes = 'Zateplení svislé konstrukce pod nevytápěnou půdou'
WHERE item_name = 'Strop sklepa';
