-- Add webhook_name column to pricing table
ALTER TABLE pricing 
ADD COLUMN IF NOT EXISTS webhook_name VARCHAR(255);

-- Update existing records to have webhook_name same as item_name if null
UPDATE pricing 
SET webhook_name = item_name 
WHERE webhook_name IS NULL;

-- Update specific items to have better webhook names
UPDATE pricing SET webhook_name = 'Šikmá střecha s dutinou' WHERE item_name = 'Střecha bez záklopu';
UPDATE pricing SET webhook_name = 'Šikmá střecha s dutinou' WHERE item_name = 'Střecha se záklopem';
