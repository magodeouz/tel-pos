PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "users" ("id","username","password_hash","created_at") VALUES(1,'admin','$2a$10$3Mn3e2C4Z8SMRIF.3IVsQe4SXXcu4UovgmGcQ1fd.QE7A5vZFasWq','2026-06-06 16:03:27');
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(1,'05559999998','Test2','Adres',NULL,'2026-06-06 16:12:00');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(2,'05551112233','Test Müşteri','Adres',NULL,'2026-06-06 16:13:42');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(3,'05440000099','QA Test','Test Cad',NULL,'2026-06-06 16:24:40');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(4,'05345176522','Doğa  Bulut','askjlasdjkasdkjlasdjkl',replace('slşdkfas\n','\n',char(10)),'2026-06-06 17:08:21');
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO "categories" ("id","name","sort_order") VALUES(1,'İçecekler',1);
INSERT INTO "categories" ("id","name","sort_order") VALUES(2,'Yemekler',2);
INSERT INTO "categories" ("id","name","sort_order") VALUES(3,'Tatlılar',3);
INSERT INTO "categories" ("id","name","sort_order") VALUES(4,'Burgerler',1);
INSERT INTO "categories" ("id","name","sort_order") VALUES(6,'Sandviçler',2);
INSERT INTO "categories" ("id","name","sort_order") VALUES(7,'Döner & Dürüm',3);
INSERT INTO "categories" ("id","name","sort_order") VALUES(8,'Lahmacun & Pide',4);
INSERT INTO "categories" ("id","name","sort_order") VALUES(9,'Yan Ürünler',5);
INSERT INTO "categories" ("id","name","sort_order") VALUES(11,'Soğuk İçecekler',7);
INSERT INTO "categories" ("id","name","sort_order") VALUES(12,'Sıcak İçecekler',8);
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  note TEXT,
  active INTEGER DEFAULT 1
);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(1,1,'Çay',10,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(2,1,'Kahve',15,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(3,2,'Döner',50,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(4,2,'Pide',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(5,4,'Cheese',10000,'Cheese',1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(6,4,'Klasik Burger',120,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(7,4,'Çift Köfte Burger',150,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(8,4,'Tavuk Burger',110,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(9,4,'İsveç Burger',135,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(10,4,'Barbekürlü Burger',145,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(11,4,'Vegan Burger',125,'Sebze köfteli',1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(12,6,'Tost',60,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(13,6,'Kariyer Tost',75,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(14,6,'Ekmek Arası Köfte',90,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(15,6,'Ekmek Arası Tavuk',85,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(16,6,'Club Sandviç',100,'Üç katlı',1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(17,7,'Et Döner',130,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(18,7,'Tavuk Döner',110,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(19,7,'Et Dürüm',140,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(20,7,'Tavuk Dürüm',120,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(21,7,'İskender',180,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(22,8,'Lahmacun',45,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(23,8,'Dürümlü Lahmacun',65,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(24,8,'Kıymalı Pide',110,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(25,8,'Kaşarlı Pide',105,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(26,8,'Karışık Pide',130,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(27,8,'Yumurtalı Pide',115,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(28,9,'Patates Kızartması',55,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(29,9,'Büyük Patates',75,'XL porsiyon',1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(30,9,'Onion Ring',60,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(31,9,'Mozzarella Stick',70,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(32,9,'Coleslaw',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(33,9,'Salata',50,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(34,3,'Sütlaç',60,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(35,3,'Waffle',90,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(36,3,'Dondurma (Top)',30,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(37,3,'Cheesecake',85,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(38,3,'Brownie',70,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(39,11,'Kola (33cl)',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(40,11,'Kola (50cl)',55,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(41,11,'Fanta',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(42,11,'Sprite',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(43,11,'Ayran',25,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(44,11,'Meyve Suyu',35,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(45,11,'Su',15,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(46,11,'Milkshake',65,'Çikolata / Çilek / Vanilyalı',1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(47,12,'Çay',20,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(48,12,'Türk Kahvesi',35,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(49,12,'Nescafé',40,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(50,12,'Sıcak Çikolata',55,NULL,1);
INSERT INTO "products" ("id","category_id","name","price","note","active") VALUES(51,12,'Çorba',50,NULL,1);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  status TEXT DEFAULT 'open',
  payment_method TEXT DEFAULT 'pending',
  discount_amount REAL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(1,NULL,'cancelled','pending',0,0,'','2026-06-06 16:05:28');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(2,NULL,'paid','nakit',5,0,'','2026-06-06 16:11:39');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(3,NULL,'cancelled','pending',0,0,'','2026-06-06 16:13:40');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(4,NULL,'paid','nakit',5,10,'Test notu','2026-06-06 16:24:41');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(5,NULL,'cancelled','pending',0,0,'','2026-06-06 16:24:47');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(6,3,'paid','nakit',0,0,'','2026-06-06 16:25:46');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(7,NULL,'cancelled','pending',0,0,'','2026-06-06 16:36:39');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(8,3,'cancelled','pending',0,0,'','2026-06-06 16:37:23');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(9,3,'cancelled','pending',0,0,'','2026-06-06 16:37:28');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(10,3,'paid','kredi_karti',0,0,'','2026-06-06 16:37:28');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(11,3,'paid','nakit',0,0,'','2026-06-06 16:38:40');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(12,NULL,'paid','kredi_karti',0,0,'','2026-06-06 16:40:29');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(13,3,'paid','nakit',0,0,'','2026-06-06 16:41:25');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(14,2,'paid','cari',10,0,'ASDASDA','2026-06-06 16:42:40');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(15,3,'paid','odenmes',0,50,'','2026-06-06 16:43:15');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(16,NULL,'paid','nakit',0,22,replace('SDASDFAS\n','\n',char(10)),'2026-06-06 17:01:53');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(17,4,'paid','kredi_karti',0,0,'','2026-06-06 17:08:21');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(18,4,'paid','cari',0,10,'zile basmayın ','2026-06-06 17:10:55');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(19,NULL,'paid','pending',0,0,'','2026-06-06 17:11:52');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(20,NULL,'paid','pending',0,0,'','2026-06-06 17:11:59');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(21,NULL,'paid','pending',0,0,'','2026-06-06 17:12:04');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(22,NULL,'paid','pending',0,0,'','2026-06-06 17:12:07');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(23,NULL,'paid','pending',0,0,'','2026-06-06 17:12:10');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(24,NULL,'paid','pending',0,0,'','2026-06-06 17:12:10');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(25,NULL,'paid','pending',0,0,'','2026-06-06 17:12:15');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(26,NULL,'cancelled','pending',0,0,'','2026-06-06 17:14:50');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(27,4,'paid','pending',0,0,'','2026-06-06 17:15:00');
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(1,2,1,2,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(2,3,1,2,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(4,4,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(5,5,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(6,6,1,2,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(7,7,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(8,7,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(9,8,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(10,8,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(11,10,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(12,10,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(13,11,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(14,11,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(15,12,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(16,13,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(17,13,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(18,14,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(19,14,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(20,14,3,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(21,14,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(22,14,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(23,15,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(24,16,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(25,16,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(26,16,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(27,17,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(28,17,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(29,17,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(30,18,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(31,18,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(32,18,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(33,18,3,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(34,19,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(35,19,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(36,19,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(37,20,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(38,20,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(39,20,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(40,20,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(41,20,5,1,10000);
CREATE TABLE incoming_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  acknowledged INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(1,'05551234567',0,'2026-06-06 16:02:31');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(2,'05551234567',0,'2026-06-06 16:04:28');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(3,'05559999999',0,'2026-06-06 16:11:45');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(4,'05551112233',0,'2026-06-06 16:13:43');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(5,'05999000001',0,'2026-06-06 16:25:15');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(6,'05999000002',0,'2026-06-06 16:25:25');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(7,'05345176522',0,'2026-06-06 17:01:11');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(8,'05345176522',0,'2026-06-06 17:10:48');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(9,'05551234567',0,'2026-06-06 17:21:06');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(10,'05559999888',0,'2026-06-06 17:21:07');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(11,'05551112222',0,'2026-06-06 17:22:59');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(12,'05551112233',0,'2026-06-06 17:28:20');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(13,'05345176522',1,'2026-06-06 17:39:52');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(14,'Bilinmeyen',1,'2026-06-06 17:39:52');
CREATE TABLE login_attempts (ip TEXT PRIMARY KEY, count INTEGER DEFAULT 1, reset_at INTEGER NOT NULL);
INSERT INTO "login_attempts" ("ip","count","reset_at") VALUES('2a02:4e0:2d4a:9ff:6466:f90e:30c7:b53d',5,1780768826826);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('incoming_calls',14);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',12);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',51);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('orders',27);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('order_items',41);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('customers',4);
