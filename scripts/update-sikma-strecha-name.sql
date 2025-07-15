-- Update the old "Střecha bez záklopu" to new name "Šikmá střecha s dutinou"
UPDATE pricing 
SET 
  item_name = 'Šikmá střecha s dutinou',
  webhook_name = 'Šikmá střecha s dutinou',
  notes = 'Zateplení šikmé střechy s dutinou'
WHERE item_name = 'Střecha bez záklopu';
