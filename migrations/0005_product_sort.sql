ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Seed an initial order per category from the current alphabetical listing
-- so existing products start with a stable, sensible sequence.
UPDATE products
SET sort_order = (
  SELECT COUNT(*)
  FROM products AS p2
  WHERE p2.category_id = products.category_id
    AND (p2.name < products.name OR (p2.name = products.name AND p2.id < products.id))
);
