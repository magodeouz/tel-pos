PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "users" ("id","username","password_hash","created_at") VALUES(1,'admin','$2a$10$o.lVlyRA1peqwqE5veaRRumFdaraxl.e5HlH3YEkkldXAjAY04THC','2026-06-06 16:03:27');
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
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(4,'05345171111','Test','askjlasdjkasdkjlasdjkl','slşdkfas','2026-06-06 17:08:21');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(5,'0000','Test','asda','asda','2026-06-06 19:16:56');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(6,'05551234567','uıuhuı','','','2026-06-06 19:37:15');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(7,'+905077331535','asdsa asdasda','sdaslkd','Kapısını çalma gergin adam','2026-06-07 20:46:38');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(8,'05358238135','Oğuz AKPINAR skdsa','Erzene, 116/8. Sk. No:1, Kat 5 Daire 24 BCMS Konutları 35040 Bornova/İzmir','','2026-06-07 21:19:15');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(9,'05422733669','orhan  TOPAL','aşskdasda','asdasd','2026-06-09 17:06:52');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(10,'05319677033','Mersin Branda','Mersin Branda','','2026-07-03 12:44:02');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(11,'+905530024426','Enes Topal','Sarılar','','2026-07-03 12:46:06');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(12,'+905376065442','Halim Tuna Tek','Tuna Tek','','2026-07-03 12:49:05');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(13,'+905069056705','Cüzdancı','Bim Depo yanı Cüzdancı','','2026-07-03 15:49:12');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(14,'+905319640907','Tuncay Su Sporları','Su Sporları','','2026-07-03 18:01:41');
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO "categories" ("id","name","sort_order") VALUES(25,'Yiyecekler',1);
INSERT INTO "categories" ("id","name","sort_order") VALUES(26,'İçecekler',2);
INSERT INTO "categories" ("id","name","sort_order") VALUES(27,'Extralar',3);
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  note TEXT,
  active INTEGER DEFAULT 1
, sort_order INTEGER DEFAULT 0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(103,25,'Hamburger ,',300,'130gr Köfte - Cheddar - Turşu - Soğan - Ketçap - Hardal - Patates Kızartması',1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(104,25,'Köfte Ekmek',250,replace('Köfte - Domates - Soğan \n','\n',char(10)),1,1);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(105,25,'Sucuk Ekmek',200,'Sucuk - Domates',1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(106,25,'Karışık',200,'Sosis - Salam - Sucuk - Ketçap - Mayonez - Turşu - Peynir',1,3);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(107,25,'Sosisli',100,'Füme Sosis - Hardal - Ketçap - Turşu',1,4);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(108,26,'Kutu İçecek',70,'',1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(109,26,'Ayran',50,'',1,1);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(110,26,'Şalgam',50,'',1,2);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(111,26,'Su',20,'',1,3);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(112,25,'Patates Kızartması ',60,'',1,5);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(113,27,'Extra Köfte',150,'',1,0);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(114,27,'Extra Cheddar',40,NULL,1,1);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(115,25,'Sınırsız Patates (Öğrenci)',60,'Kişi başı',1,6);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  status TEXT DEFAULT 'open',
  payment_method TEXT DEFAULT 'pending',
  discount_amount REAL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
, order_type TEXT DEFAULT 'paket', table_id INTEGER);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(84,NULL,'paid','odenmes',0,0,'','2026-06-27 12:27:06','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(85,NULL,'paid','odenmes',0,0,'','2026-06-27 12:27:23','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(86,NULL,'open','pending',0,0,'','2026-06-27 12:27:30','salon',4);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(87,NULL,'paid','nakit',0,0,'','2026-06-27 12:27:40','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(88,NULL,'open','pending',0,0,'','2026-06-27 12:31:04','salon',3);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(89,NULL,'paid','odenmes',0,0,'','2026-06-27 12:40:02','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(90,NULL,'cancelled','pending',0,0,'','2026-06-27 12:54:48','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(91,NULL,'cancelled','pending',0,0,'','2026-06-27 12:56:09','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(92,NULL,'cancelled','pending',0,0,'','2026-06-27 13:30:34','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(93,NULL,'cancelled','pending',0,0,'','2026-06-27 13:31:50','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(94,NULL,'paid','odenmes',0,0,'','2026-06-27 13:36:08','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(95,NULL,'cancelled','pending',0,0,'','2026-06-27 14:45:08','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(96,NULL,'paid','nakit',25,0,'','2026-06-27 16:33:13','salon',9);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(97,1,'cancelled','pending',0,0,'','2026-06-27 17:06:18','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(98,NULL,'paid','nakit',0,0,'','2026-07-01 07:13:01','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(99,NULL,'cancelled','pending',0,0,'','2026-07-03 06:53:40','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(100,10,'paid','nakit',0,0,'','2026-07-03 12:44:09','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(101,11,'cancelled','pending',0,0,'','2026-07-03 12:46:07','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(102,12,'paid','kredi_karti',0,0,'','2026-07-03 12:49:05','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(103,8,'cancelled','pending',0,0,'','2026-07-03 14:12:48','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(104,13,'cancelled','pending',0,0,'','2026-07-03 15:49:12','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(105,14,'cancelled','pending',0,0,'','2026-07-03 18:01:41','paket',NULL);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(97,84,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(98,84,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(99,85,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(100,85,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(101,86,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(102,86,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(103,87,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(104,87,104,2,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(105,87,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(106,87,110,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(107,89,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(108,89,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(109,91,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(110,91,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(113,94,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(114,95,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(115,96,104,3,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(117,98,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(118,99,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(119,100,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(120,101,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(121,102,104,3,250);
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
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(42,'05396046002',0,'2026-06-10 08:00:02');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(43,'05335255052',0,'2026-06-10 09:48:50');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(44,'05396046002',0,'2026-06-10 10:06:19');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(45,'05336954698',0,'2026-06-10 10:48:43');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(46,'05423399743',0,'2026-06-10 11:23:25');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(47,'05322324437',0,'2026-06-10 17:31:30');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(48,'+905345176522',0,'2026-06-10 23:33:18');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(49,'+905345176522',0,'2026-06-11 06:45:05');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(50,'05348214399',0,'2026-06-11 12:22:03');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(51,'05322324437',0,'2026-06-11 19:05:06');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(52,'05355951943',0,'2026-06-13 07:49:57');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(53,'+905417173177',1,'2026-07-03 11:48:00');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(54,'+905530024426',1,'2026-07-03 11:49:06');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(55,'+905530024426',1,'2026-07-03 11:49:59');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(56,'+905530024426',1,'2026-07-03 11:50:22');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(57,'+905468604777',1,'2026-07-03 12:26:22');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(58,'+905530024426',1,'2026-07-03 12:38:28');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(59,'+905319677033',1,'2026-07-03 12:39:08');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(60,'+905530024426',1,'2026-07-03 12:45:46');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(61,'+905530024426',1,'2026-07-03 12:46:40');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(62,'+905376065442',1,'2026-07-03 12:47:24');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(63,'+905511593169',1,'2026-07-03 13:40:16');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(64,'+905432733669',1,'2026-07-03 14:29:01');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(65,'+905319677033',1,'2026-07-03 14:41:38');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(66,'+905069056705',1,'2026-07-03 15:43:45');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(67,'+905417173177',1,'2026-07-03 16:25:58');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(68,'+905319640907',1,'2026-07-03 17:57:40');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(69,'+905444645715',1,'2026-07-03 19:47:21');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(70,'+905444645715',1,'2026-07-03 20:01:23');
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
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(6,'0006_salon_masa.sql','2026-06-27 12:25:34');
CREATE TABLE areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO "areas" ("id","name","sort_order") VALUES(1,'İç Salon',0);
INSERT INTO "areas" ("id","name","sort_order") VALUES(2,'Bahçe',1);
CREATE TABLE dining_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(1,1,'Masa 1',0);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(2,1,'Masa 2',1);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(5,2,'B1',0);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(6,2,'B3',2);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(7,2,'B2',1);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(8,2,'B4',3);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(9,2,'B5',4);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(10,2,'B6',5);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(11,2,'B7',6);
INSERT INTO "dining_tables" ("id","area_id","name","sort_order") VALUES(12,2,'B8',7);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('incoming_calls',70);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',27);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',115);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('orders',105);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('order_items',121);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('customers',14);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('cari_payments',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',6);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('areas',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('dining_tables',12);
