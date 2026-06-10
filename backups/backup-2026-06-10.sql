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
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(4,'05345171111','Doğa  Bulut','askjlasdjkasdkjlasdjkl','slşdkfas','2026-06-06 17:08:21');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(5,'05345176522','Doga A','asda','asda','2026-06-06 19:16:56');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(6,'05551234567','uıuhuı','','','2026-06-06 19:37:15');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(7,'+905077331535','asdsa asdasda','sdaslkd','Kapısını çalma gergin adam','2026-06-07 20:46:38');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(8,'05358238135','Oğuz AKPINAR skdsa','Erzene, 116/8. Sk. No:1, Kat 5 Daire 24 BCMS Konutları 35040 Bornova/İzmir','','2026-06-07 21:19:15');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(9,'05422733669','orhan  TOPAL','aşskdasda','asdasd','2026-06-09 17:06:52');
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO "categories" ("id","name","sort_order") VALUES(1,'İçecekler',3);
INSERT INTO "categories" ("id","name","sort_order") VALUES(2,'Yemekler',1);
INSERT INTO "categories" ("id","name","sort_order") VALUES(3,'Tatlılar',5);
INSERT INTO "categories" ("id","name","sort_order") VALUES(4,'Burgerler',2);
INSERT INTO "categories" ("id","name","sort_order") VALUES(6,'Sandviçler',4);
INSERT INTO "categories" ("id","name","sort_order") VALUES(7,'Döner & Dürüm',6);
INSERT INTO "categories" ("id","name","sort_order") VALUES(8,'Lahmacun & Pide',7);
INSERT INTO "categories" ("id","name","sort_order") VALUES(9,'Yan Ürünler',8);
INSERT INTO "categories" ("id","name","sort_order") VALUES(11,'Soğuk İçecekler',9);
INSERT INTO "categories" ("id","name","sort_order") VALUES(12,'Sıcak İçecekler',10);
INSERT INTO "categories" ("id","name","sort_order") VALUES(24,'sdad',0);
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  note TEXT,
  active INTEGER DEFAULT 1
, sort_order INTEGER DEFAULT 0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(1,1,'Çay',10,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(2,1,'Kahve',15,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(3,2,'Döner',50,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(4,2,'Pide',40,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(5,4,'Cheese',10000,'Cheese',1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(6,4,'Klasik Burger',120,NULL,1,3);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(7,4,'Çift Köfte Burger',150,NULL,1,9);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(8,4,'Tavuk Burger',110,NULL,1,5);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(9,4,'İsveç Burger',135,NULL,1,11);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(10,4,'Barbekürlü Burger',145,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(11,4,'Vegan Burger',125,'Sebze köfteli',1,7);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(12,6,'Tost',60,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(13,6,'Kariyer Tost',75,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(14,6,'Ekmek Arası Köfte',90,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(15,6,'Ekmek Arası Tavuk',85,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(16,6,'Club Sandviç',100,'Üç katlı',1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(17,7,'Et Döner',130,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(18,7,'Tavuk Döner',110,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(19,7,'Et Dürüm',140,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(20,7,'Tavuk Dürüm',120,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(21,7,'İskender',180,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(22,8,'Lahmacun',45,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(23,8,'Dürümlü Lahmacun',65,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(24,8,'Kıymalı Pide',110,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(25,8,'Kaşarlı Pide',105,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(26,8,'Karışık Pide',130,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(27,8,'Yumurtalı Pide',115,NULL,1,10);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(28,9,'Patates Kızartması',55,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(29,9,'Büyük Patates',75,'XL porsiyon',1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(30,9,'Onion Ring',60,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(31,9,'Mozzarella Stick',70,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(32,9,'Coleslaw',40,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(33,9,'Salata',50,NULL,1,10);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(34,3,'Sütlaç',60,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(35,3,'Waffle',90,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(36,3,'Dondurma (Top)',30,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(37,3,'Cheesecake',85,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(38,3,'Brownie',70,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(39,11,'Kola (33cl)',40,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(40,11,'Kola (50cl)',55,NULL,1,6);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(41,11,'Fanta',40,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(42,11,'Sprite',40,NULL,1,12);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(43,11,'Ayran',25,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(44,11,'Meyve Suyu',35,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(45,11,'Su',15,NULL,1,14);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(46,11,'Milkshake',65,'Çikolata / Çilek / Vanilyalı',1,10);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(48,12,'Türk Kahvesi',35,NULL,1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(49,12,'Nescafé',40,NULL,1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(50,12,'Sıcak Çikolata',55,NULL,1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(51,12,'Çorba',50,NULL,1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(102,24,'sadlşaskd',100,'edklasd',0,0);
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
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(28,NULL,'paid','kredi_karti',0,0,'','2026-06-06 18:00:48');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(29,4,'cancelled','pending',0,0,'','2026-06-06 18:03:16');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(30,4,'paid','cari',0,0,'','2026-06-06 18:15:48');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(31,4,'paid','pending',0,0,'','2026-06-06 18:17:08');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(32,4,'paid','cari',0,10,'','2026-06-06 18:17:59');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(33,4,'paid','pending',0,0,'','2026-06-06 18:25:02');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(34,4,'paid','pending',0,0,'','2026-06-06 18:32:09');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(35,4,'cancelled','pending',0,0,'','2026-06-06 18:51:51');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(36,4,'cancelled','pending',0,0,'','2026-06-06 19:00:54');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(37,4,'cancelled','pending',0,0,'','2026-06-06 19:00:56');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(38,4,'cancelled','pending',0,0,'','2026-06-06 19:01:00');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(39,4,'cancelled','pending',0,0,'','2026-06-06 19:02:17');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(40,4,'cancelled','pending',0,0,'','2026-06-06 19:02:25');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(41,4,'cancelled','pending',0,0,'','2026-06-06 19:02:38');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(42,5,'cancelled','pending',0,0,'','2026-06-06 19:16:57');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(43,5,'cancelled','pending',0,0,'','2026-06-06 19:18:18');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(44,NULL,'cancelled','pending',0,0,'','2026-06-06 19:27:10');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(45,NULL,'cancelled','pending',0,0,'','2026-06-06 19:27:16');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(46,NULL,'cancelled','pending',0,0,'','2026-06-06 19:27:19');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(47,NULL,'cancelled','pending',0,0,'','2026-06-06 19:27:51');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(48,6,'cancelled','pending',0,0,'','2026-06-06 19:37:16');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(49,NULL,'cancelled','pending',0,0,'','2026-06-06 19:37:33');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(50,NULL,'cancelled','pending',0,0,'','2026-06-06 19:37:39');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(51,NULL,'cancelled','pending',0,0,'','2026-06-06 19:37:55');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(52,NULL,'cancelled','pending',0,0,'','2026-06-06 19:38:37');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(53,NULL,'cancelled','pending',0,0,'','2026-06-06 19:41:11');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(54,NULL,'paid','nakit',0,0,'','2026-06-06 19:41:27');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(55,NULL,'cancelled','pending',0,0,'','2026-06-06 19:54:37');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(56,NULL,'cancelled','pending',0,0,'','2026-06-06 19:56:16');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(57,NULL,'cancelled','pending',0,0,'','2026-06-06 20:02:48');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(58,NULL,'cancelled','pending',0,0,'','2026-06-06 20:02:52');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(59,NULL,'cancelled','pending',0,0,'','2026-06-06 20:17:52');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(60,NULL,'cancelled','pending',0,0,'','2026-06-06 20:28:05');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(61,NULL,'cancelled','pending',0,0,'','2026-06-06 20:28:27');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(62,NULL,'cancelled','pending',0,0,'','2026-06-06 20:29:37');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(63,NULL,'cancelled','pending',0,0,'','2026-06-06 20:30:07');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(64,NULL,'cancelled','pending',0,0,'','2026-06-06 20:30:15');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(65,NULL,'cancelled','pending',0,0,'','2026-06-06 20:31:45');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(66,NULL,'cancelled','pending',0,0,'','2026-06-06 20:43:24');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(67,NULL,'paid','kredi_karti',0,0,'','2026-06-06 20:45:09');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(68,5,'paid','cari',0,0,'','2026-06-06 20:46:48');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(69,NULL,'cancelled','pending',0,0,'','2026-06-06 21:01:24');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(70,NULL,'paid','nakit',0,0,'','2026-06-06 21:06:17');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(71,NULL,'cancelled','pending',0,0,'','2026-06-06 21:11:52');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(72,4,'paid','cari',0,0,'','2026-06-07 20:46:39');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(73,4,'cancelled','pending',0,0,'','2026-06-07 20:48:24');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(74,NULL,'cancelled','pending',100,20,'','2026-06-07 20:49:09');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(75,NULL,'paid','odenmes',0,0,'','2026-06-07 20:49:10');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(76,7,'cancelled','pending',0,0,'','2026-06-07 20:49:33');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(77,NULL,'open','pending',0,0,'','2026-06-07 21:19:58');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(78,NULL,'open','pending',0,0,'','2026-06-07 21:20:09');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(79,NULL,'open','pending',0,0,'','2026-06-07 21:20:35');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(80,5,'open','pending',0,0,'','2026-06-09 17:05:10');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(81,9,'paid','nakit',0,0,'','2026-06-09 17:06:52');
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at") VALUES(82,NULL,'paid','nakit',0,0,'','2026-06-09 17:07:46');
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
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(42,28,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(43,28,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(44,30,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(45,30,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(46,30,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(47,30,8,1,110);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(48,32,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(49,32,6,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(50,32,8,1,110);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(51,32,49,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(52,32,50,1,55);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(53,32,51,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(54,32,1,1,20);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(55,35,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(56,35,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(57,35,4,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(58,35,26,1,130);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(59,35,25,1,105);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(61,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(62,52,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(63,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(64,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(65,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(66,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(67,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(68,52,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(69,54,1,3,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(70,54,2,3,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(71,54,14,1,90);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(72,54,16,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(73,67,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(74,67,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(75,68,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(76,68,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(77,70,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(78,72,3,2,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(79,72,4,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(80,72,1,1,10);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(81,72,2,1,15);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(82,72,40,1,55);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(83,72,39,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(84,75,3,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(85,75,4,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(86,73,3,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(87,73,4,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(88,73,14,1,90);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(89,73,16,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(94,82,5,1,10000);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(95,81,3,2,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(96,81,4,2,40);
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
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(15,'Bilinmeyen',1,'2026-06-06 18:34:34');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(16,'05345176522',1,'2026-06-06 18:34:34');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(17,'05551112233',1,'2026-06-06 18:44:16');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(18,'05559998877',1,'2026-06-06 18:46:21');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(19,'05345176522',1,'2026-06-06 18:50:29');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(20,'05345176522',1,'2026-06-06 18:50:54');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(21,'05559990001',1,'2026-06-06 18:55:46');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(22,'+905345171111',1,'2026-06-06 19:00:44');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(23,'05345176522',1,'2026-06-06 19:16:33');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(24,'05345176522',1,'2026-06-06 19:17:09');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(25,'05551234567',1,'2026-06-06 19:34:52');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(26,'05388931925',0,'2026-06-07 12:21:05');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(27,'05334143572',1,'2026-06-07 12:52:10');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(28,'02162030858',0,'2026-06-07 13:55:09');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(29,'+905077331535',1,'2026-06-07 20:46:08');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(30,'05324111057',0,'2026-06-08 15:32:22');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(31,'05423399743',0,'2026-06-08 16:51:33');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(32,'+905428234468',0,'2026-06-08 19:46:39');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(33,'+905345176522',0,'2026-06-08 20:48:43');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(34,'05345176522',0,'2026-06-08 22:05:15');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(35,'+905345176522',0,'2026-06-09 06:31:48');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(36,'4448875',0,'2026-06-09 10:29:59');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(37,'05345280309',0,'2026-06-09 13:04:06');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(38,'+905345176522',0,'2026-06-09 15:47:00');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(39,'+905345176522',0,'2026-06-09 16:20:34');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(40,'05422733669',1,'2026-06-09 17:06:16');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(41,'05422733669',1,'2026-06-09 17:09:05');
CREATE TABLE login_attempts (ip TEXT PRIMARY KEY, count INTEGER DEFAULT 1, reset_at INTEGER NOT NULL);
CREATE TABLE cari_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount REAL NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "cari_payments" ("id","customer_id","amount","note","created_at") VALUES(1,4,100,'','2026-06-06 18:25:11');
INSERT INTO "cari_payments" ("id","customer_id","amount","note","created_at") VALUES(2,4,110,'','2026-06-06 18:25:20');
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_initial.sql','2026-06-06 21:43:16');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_seed.sql','2026-06-06 21:43:18');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0003_fastfood.sql','2026-06-06 21:43:23');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(4,'0004_cari_payments.sql','2026-06-06 21:43:23');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(5,'0005_product_sort.sql','2026-06-06 21:43:25');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('incoming_calls',41);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',24);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',102);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('orders',82);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('order_items',96);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('customers',9);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('cari_payments',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',5);
