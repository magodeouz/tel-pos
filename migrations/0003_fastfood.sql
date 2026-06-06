-- Fast food categories
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Burgerler', 1);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Sandviçler', 2);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Döner & Dürüm', 3);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Lahmacun & Pide', 4);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Yan Ürünler', 5);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Tatlılar', 6);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Soğuk İçecekler', 7);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Sıcak İçecekler', 8);

-- Burgerler
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Klasik Burger', 120 FROM categories WHERE name='Burgerler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Çift Köfte Burger', 150 FROM categories WHERE name='Burgerler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Tavuk Burger', 110 FROM categories WHERE name='Burgerler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'İsveç Burger', 135 FROM categories WHERE name='Burgerler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Barbekürlü Burger', 145 FROM categories WHERE name='Burgerler';
INSERT OR IGNORE INTO products (category_id, name, price, note) SELECT id, 'Vegan Burger', 125, 'Sebze köfteli' FROM categories WHERE name='Burgerler';

-- Sandviçler
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Tost', 60 FROM categories WHERE name='Sandviçler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Kariyer Tost', 75 FROM categories WHERE name='Sandviçler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Ekmek Arası Köfte', 90 FROM categories WHERE name='Sandviçler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Ekmek Arası Tavuk', 85 FROM categories WHERE name='Sandviçler';
INSERT OR IGNORE INTO products (category_id, name, price, note) SELECT id, 'Club Sandviç', 100, 'Üç katlı' FROM categories WHERE name='Sandviçler';

-- Döner & Dürüm
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Et Döner', 130 FROM categories WHERE name='Döner & Dürüm';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Tavuk Döner', 110 FROM categories WHERE name='Döner & Dürüm';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Et Dürüm', 140 FROM categories WHERE name='Döner & Dürüm';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Tavuk Dürüm', 120 FROM categories WHERE name='Döner & Dürüm';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'İskender', 180 FROM categories WHERE name='Döner & Dürüm';

-- Lahmacun & Pide
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Lahmacun', 45 FROM categories WHERE name='Lahmacun & Pide';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Dürümlü Lahmacun', 65 FROM categories WHERE name='Lahmacun & Pide';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Kıymalı Pide', 110 FROM categories WHERE name='Lahmacun & Pide';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Kaşarlı Pide', 105 FROM categories WHERE name='Lahmacun & Pide';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Karışık Pide', 130 FROM categories WHERE name='Lahmacun & Pide';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Yumurtalı Pide', 115 FROM categories WHERE name='Lahmacun & Pide';

-- Yan Ürünler
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Patates Kızartması', 55 FROM categories WHERE name='Yan Ürünler';
INSERT OR IGNORE INTO products (category_id, name, price, note) SELECT id, 'Büyük Patates', 75, 'XL porsiyon' FROM categories WHERE name='Yan Ürünler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Onion Ring', 60 FROM categories WHERE name='Yan Ürünler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Mozzarella Stick', 70 FROM categories WHERE name='Yan Ürünler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Coleslaw', 40 FROM categories WHERE name='Yan Ürünler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Salata', 50 FROM categories WHERE name='Yan Ürünler';

-- Tatlılar
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Sütlaç', 60 FROM categories WHERE name='Tatlılar';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Waffle', 90 FROM categories WHERE name='Tatlılar';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Dondurma (Top)', 30 FROM categories WHERE name='Tatlılar';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Cheesecake', 85 FROM categories WHERE name='Tatlılar';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Brownie', 70 FROM categories WHERE name='Tatlılar';

-- Soğuk İçecekler
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Kola (33cl)', 40 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Kola (50cl)', 55 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Fanta', 40 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Sprite', 40 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Ayran', 25 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Meyve Suyu', 35 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Su', 15 FROM categories WHERE name='Soğuk İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price, note) SELECT id, 'Milkshake', 65, 'Çikolata / Çilek / Vanilyalı' FROM categories WHERE name='Soğuk İçecekler';

-- Sıcak İçecekler
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Çay', 20 FROM categories WHERE name='Sıcak İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Türk Kahvesi', 35 FROM categories WHERE name='Sıcak İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Nescafé', 40 FROM categories WHERE name='Sıcak İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Sıcak Çikolata', 55 FROM categories WHERE name='Sıcak İçecekler';
INSERT OR IGNORE INTO products (category_id, name, price) SELECT id, 'Çorba', 50 FROM categories WHERE name='Sıcak İçecekler';
