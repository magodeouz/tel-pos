INSERT OR IGNORE INTO users (username, password_hash) VALUES ('admin', '$2a$10$7BIpuA//RNxb5Rt8A8PTG.aUpHQYKdBTZCBK28i42w33yd05CcTty');

INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('İçecekler', 1);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Yemekler', 2);
INSERT OR IGNORE INTO categories (name, sort_order) VALUES ('Tatlılar', 3);

INSERT OR IGNORE INTO products (category_id, name, price) VALUES (1, 'Çay', 10);
INSERT OR IGNORE INTO products (category_id, name, price) VALUES (1, 'Kahve', 15);
INSERT OR IGNORE INTO products (category_id, name, price) VALUES (2, 'Döner', 50);
INSERT OR IGNORE INTO products (category_id, name, price) VALUES (2, 'Pide', 40);
