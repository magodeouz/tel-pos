-- Salon (dining areas) + masa (tables) support, and order typing.
-- Existing orders are all phone/takeaway, so they default to 'paket'.

CREATE TABLE areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE dining_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE orders ADD COLUMN order_type TEXT DEFAULT 'paket';  -- 'salon' | 'paket'
ALTER TABLE orders ADD COLUMN table_id INTEGER;                 -- salon: masa id, paket: NULL

-- Seed two areas with a few tables so the floor plan isn't empty on first run.
INSERT INTO areas (name, sort_order) VALUES ('İç Salon', 0), ('Bahçe', 1);

INSERT INTO dining_tables (area_id, name, sort_order)
  SELECT a.id, 'Masa ' || n, n - 1
  FROM areas a, (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t
  WHERE a.name = 'İç Salon';

INSERT INTO dining_tables (area_id, name, sort_order)
  SELECT a.id, 'Bahçe ' || n, n - 1
  FROM areas a, (SELECT 1 n UNION SELECT 2 UNION SELECT 3) t
  WHERE a.name = 'Bahçe';
