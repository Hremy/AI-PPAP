-- Update KEQs table schema: rename 'text' to 'category' and 'category' to 'description'
-- Step 1: Add new columns
ALTER TABLE keqs ADD COLUMN IF NOT EXISTS category VARCHAR(200);
ALTER TABLE keqs ADD COLUMN IF NOT EXISTS description VARCHAR(2000);

-- Step 2: Migrate existing data
UPDATE keqs SET category = text WHERE category IS NULL;
UPDATE keqs SET description = category WHERE description IS NULL AND category IS NOT NULL;

-- Step 3: Make category NOT NULL and drop old text column
ALTER TABLE keqs ALTER COLUMN category SET NOT NULL;
ALTER TABLE keqs DROP COLUMN IF EXISTS text;

-- Step 4: Update column constraints
ALTER TABLE keqs ALTER COLUMN description DROP NOT NULL;
