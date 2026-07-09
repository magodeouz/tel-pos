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
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(8,'05358238135','Oğuz AKPINAR skdsa','Erzene, 116/8. Sk. No:1, Kat 5 Daire 24 BCMS Konutları 35040 Bornova/İzmir','','2026-06-07 21:19:15');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(9,'05422733669','orhan  TOPAL','aşskdasda','asdasd','2026-06-09 17:06:52');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(10,'05319677033','Mersin Branda','Mersin Branda','','2026-07-03 12:44:02');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(11,'+905530024426','Enes Topal','Sarılar','','2026-07-03 12:46:06');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(12,'+905376065442','Halim Tuna Tek','Tuna Tek','','2026-07-03 12:49:05');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(13,'+905069056705','Cüzdancı','Bim Depo yanı Cüzdancı','','2026-07-03 15:49:12');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(14,'+905319640907','Tuncay Su Sporları','Su Sporları','','2026-07-03 18:01:41');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(15,'+905426747381','Eymen Erkek Kuaför','Kasap Karşısı Kuaför','','2026-07-04 08:58:00');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(16,'+905456817503','Emre Koca Av Bayi','Şurası','','2026-07-05 14:00:46');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(17,'+905379796299','Orhan Topal','Burası','','2026-07-05 16:59:37');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(18,'+905462778640','Wastam Wastam Motor','Sanayi içi','','2026-07-06 08:47:43');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(19,'+905322921638','Demir','Han Wood','','2026-07-06 09:02:45');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(20,'+905060676153','İbo','Zirve Rot Balans','','2026-07-06 09:17:21');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(21,'05515109006','trabzon ekmek üstü 1. kat','','','2026-07-06 16:18:26');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(22,'05350760707','uzman oto yıkama Eyüp','','','2026-07-06 19:03:04');
INSERT INTO "customers" ("id","phone","name","address","note","created_at") VALUES(23,'05073566060','Su Sporları','Orası','','2026-07-08 09:29:01');
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
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(116,25,'Çeyrek Köfte',120,'',1,7);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(117,25,'Çeyrek Sucuk',120,'',1,8);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(118,25,'3 Çeyrek Köfte',350,'',1,9);
INSERT INTO "products" ("id","category_id","name","price","note","active","sort_order") VALUES(119,25,'3 Çeyrek Sucuk',350,'',1,10);
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
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(86,NULL,'paid','odenmes',0,0,'','2026-06-27 12:27:30','salon',4);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(87,NULL,'paid','nakit',0,0,'','2026-06-27 12:27:40','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(88,NULL,'paid','odenmes',0,0,'','2026-06-27 12:31:04','salon',3);
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
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(106,NULL,'paid','nakit',0,0,'','2026-07-04 08:36:45','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(107,15,'cancelled','pending',0,0,'','2026-07-04 08:58:00','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(108,NULL,'paid','odenmes',0,0,'','2026-07-05 13:41:08','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(109,NULL,'cancelled','pending',0,0,'','2026-07-05 13:41:35','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(110,13,'cancelled','pending',0,0,'','2026-07-05 13:41:42','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(111,NULL,'cancelled','pending',0,0,'','2026-07-05 13:43:31','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(112,NULL,'cancelled','pending',0,0,'','2026-07-05 13:44:24','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(113,NULL,'cancelled','pending',0,0,'','2026-07-05 13:44:44','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(114,NULL,'cancelled','pending',0,0,'','2026-07-05 13:55:43','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(115,16,'cancelled','pending',0,0,'','2026-07-05 14:00:47','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(116,NULL,'cancelled','pending',0,0,'','2026-07-05 15:30:47','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(117,17,'cancelled','pending',0,0,'','2026-07-05 16:59:37','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(118,18,'paid','kredi_karti',0,0,'','2026-07-06 08:47:43','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(119,19,'paid','kredi_karti',0,0,'','2026-07-06 09:02:45','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(120,18,'paid','nakit',0,0,'','2026-07-06 09:14:50','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(121,20,'cancelled','pending',0,0,'','2026-07-06 09:17:21','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(122,20,'paid','nakit',20,0,'','2026-07-06 09:18:35','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(123,NULL,'cancelled','pending',0,0,'','2026-07-06 09:31:34','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(124,NULL,'paid','nakit',0,0,'','2026-07-06 09:31:51','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(125,NULL,'paid','nakit',0,0,'','2026-07-06 09:52:27','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(126,NULL,'paid','nakit',0,0,'','2026-07-06 09:52:47','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(127,NULL,'cancelled','pending',0,0,'','2026-07-06 09:53:03','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(128,NULL,'paid','nakit',0,0,'','2026-07-06 10:02:00','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(129,NULL,'paid','kredi_karti',0,0,'','2026-07-06 10:03:14','salon',2);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(130,NULL,'paid','nakit',0,0,'','2026-07-06 10:09:55','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(131,NULL,'paid','nakit',0,0,'','2026-07-06 10:10:16','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(132,NULL,'paid','nakit',0,0,'','2026-07-06 10:12:11','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(133,NULL,'cancelled','pending',0,0,'','2026-07-06 12:52:38','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(134,NULL,'paid','kredi_karti',0,0,'','2026-07-06 13:28:15','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(135,NULL,'paid','kredi_karti',0,0,'','2026-07-06 14:20:37','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(136,NULL,'cancelled','pending',0,0,'','2026-07-06 14:49:45','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(137,NULL,'paid','kredi_karti',0,0,'','2026-07-06 14:53:13','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(138,NULL,'paid','nakit',0,0,'','2026-07-06 14:53:52','salon',9);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(139,NULL,'paid','nakit',0,0,'','2026-07-06 15:04:24','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(140,NULL,'cancelled','pending',0,0,'','2026-07-06 15:05:33','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(141,NULL,'paid','kredi_karti',0,0,'','2026-07-06 15:06:43','salon',12);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(142,NULL,'paid','nakit',100,0,'','2026-07-06 15:42:17','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(143,NULL,'paid','kredi_karti',0,0,'','2026-07-06 15:55:42','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(144,NULL,'paid','nakit',0,0,'','2026-07-06 16:16:33','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(145,NULL,'paid','nakit',0,0,'','2026-07-06 16:28:43','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(146,NULL,'paid','nakit',0,0,'','2026-07-06 16:42:16','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(147,NULL,'paid','nakit',10,0,'','2026-07-06 17:09:15','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(148,NULL,'cancelled','pending',0,0,'','2026-07-06 18:48:55','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(149,NULL,'cancelled','pending',0,0,'','2026-07-06 18:49:27','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(150,NULL,'paid','kredi_karti',0,0,'','2026-07-06 18:51:38','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(151,NULL,'paid','kredi_karti',0,0,'','2026-07-07 06:54:16','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(152,NULL,'cancelled','pending',0,0,'','2026-07-07 08:08:32','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(153,NULL,'paid','kredi_karti',0,0,'','2026-07-07 08:09:36','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(154,NULL,'paid','kredi_karti',0,0,'','2026-07-07 08:11:13','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(155,NULL,'paid','kredi_karti',0,0,'','2026-07-07 08:44:15','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(156,NULL,'paid','kredi_karti',0,0,'','2026-07-07 09:28:56','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(157,NULL,'paid','nakit',0,0,'','2026-07-07 10:42:07','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(158,NULL,'paid','nakit',0,0,'','2026-07-07 10:43:20','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(159,NULL,'paid','nakit',0,0,'','2026-07-07 11:35:50','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(160,NULL,'paid','nakit',0,0,'','2026-07-07 11:36:14','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(161,NULL,'paid','nakit',0,0,'','2026-07-07 11:46:11','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(162,NULL,'paid','kredi_karti',0,0,'','2026-07-07 12:07:33','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(163,NULL,'paid','kredi_karti',0,0,'','2026-07-07 12:28:58','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(164,NULL,'paid','nakit',0,0,'','2026-07-07 12:34:53','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(165,NULL,'cancelled','pending',0,0,'','2026-07-07 12:35:56','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(166,NULL,'cancelled','pending',0,0,'','2026-07-07 12:36:03','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(167,NULL,'paid','nakit',40,0,'','2026-07-07 13:07:54','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(168,NULL,'paid','nakit',0,0,'','2026-07-07 13:08:22','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(169,NULL,'paid','kredi_karti',0,0,'','2026-07-07 13:08:50','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(170,NULL,'paid','kredi_karti',0,0,'','2026-07-07 13:09:24','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(171,NULL,'paid','nakit',30,0,'','2026-07-07 13:51:55','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(172,NULL,'paid','nakit',0,0,'','2026-07-07 14:14:36','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(173,NULL,'paid','nakit',0,0,'','2026-07-07 14:27:35','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(174,NULL,'paid','nakit',0,0,'','2026-07-07 15:09:46','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(175,NULL,'paid','nakit',0,0,'','2026-07-07 16:00:47','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(176,NULL,'paid','nakit',0,0,'','2026-07-07 16:01:07','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(177,NULL,'paid','nakit',0,0,'','2026-07-07 16:20:29','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(178,NULL,'paid','kredi_karti',0,0,'','2026-07-07 16:33:39','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(179,NULL,'paid','kredi_karti',0,0,'','2026-07-07 16:33:48','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(180,NULL,'paid','nakit',20,0,'','2026-07-07 16:34:21','salon',8);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(181,NULL,'paid','kredi_karti',0,0,'','2026-07-07 16:46:19','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(182,NULL,'paid','nakit',0,0,'','2026-07-07 16:50:06','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(183,NULL,'cancelled','pending',0,0,'','2026-07-07 17:13:40','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(184,NULL,'paid','kredi_karti',0,0,'','2026-07-07 17:13:55','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(185,NULL,'paid','kredi_karti',0,0,'','2026-07-07 17:15:48','salon',9);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(186,NULL,'paid','odenmes',0,0,'','2026-07-07 17:23:21','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(187,NULL,'cancelled','pending',0,0,'','2026-07-08 09:24:54','salon',1);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(188,NULL,'paid','nakit',0,0,'','2026-07-08 09:26:57','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(189,NULL,'paid','nakit',0,0,'','2026-07-08 09:27:20','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(190,23,'paid','kredi_karti',20,0,'','2026-07-08 09:29:07','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(191,NULL,'paid','nakit',0,0,'','2026-07-08 09:32:11','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(192,NULL,'paid','nakit',0,0,'','2026-07-08 09:32:52','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(193,NULL,'paid','nakit',0,0,'','2026-07-08 09:33:08','gelal',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(194,NULL,'paid','nakit',0,0,'','2026-07-08 09:50:27','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(195,NULL,'cancelled','pending',0,0,'','2026-07-08 09:53:38','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(196,NULL,'paid','nakit',50,0,'','2026-07-08 09:53:42','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(197,NULL,'paid','nakit',0,0,'','2026-07-08 11:01:56','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(198,NULL,'paid','kredi_karti',0,0,'','2026-07-08 11:03:31','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(199,12,'paid','kredi_karti',0,0,'1''i soğansız!!!','2026-07-08 11:14:34','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(200,NULL,'paid','kredi_karti',0,0,'','2026-07-08 12:33:04','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(201,NULL,'paid','nakit',0,0,'','2026-07-08 13:34:52','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(202,NULL,'paid','kredi_karti',0,0,'','2026-07-08 14:29:13','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(203,NULL,'paid','nakit',0,0,'','2026-07-08 14:55:22','salon',7);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(204,NULL,'paid','kredi_karti',0,0,'','2026-07-08 14:55:45','salon',6);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(205,NULL,'paid','nakit',0,0,'','2026-07-08 14:56:24','salon',8);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(206,NULL,'cancelled','pending',0,0,'','2026-07-08 15:27:28','salon',10);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(207,NULL,'paid','kredi_karti',0,0,'','2026-07-08 15:31:57','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(208,NULL,'paid','nakit',0,0,'','2026-07-08 15:57:38','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(209,NULL,'paid','nakit',0,0,'','2026-07-08 15:59:14','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(210,NULL,'paid','nakit',0,0,'','2026-07-08 16:25:36','salon',5);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(211,NULL,'paid','nakit',0,0,'','2026-07-08 16:26:03','salon',8);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(212,NULL,'paid','kredi_karti',0,0,'','2026-07-08 18:21:59','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(213,16,'paid','cari',0,0,'','2026-07-08 19:07:13','paket',NULL);
INSERT INTO "orders" ("id","customer_id","status","payment_method","discount_amount","discount_percent","note","created_at","order_type","table_id") VALUES(214,NULL,'paid','nakit',0,0,'','2026-07-08 19:37:17','paket',NULL);
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
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(122,106,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(123,107,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(124,108,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(125,108,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(126,115,106,3,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(128,115,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(130,115,112,3,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(131,88,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(132,117,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(133,118,107,3,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(134,119,106,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(135,119,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(136,120,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(138,122,118,1,350);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(140,122,104,3,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(141,122,117,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(142,124,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(143,124,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(144,125,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(145,126,104,2,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(146,126,109,2,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(147,128,106,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(148,128,109,2,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(149,129,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(150,129,109,2,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(151,130,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(152,131,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(153,131,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(154,132,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(155,133,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(156,133,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(157,134,107,4,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(159,135,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(160,135,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(161,137,104,2,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(162,137,112,2,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(163,137,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(164,137,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(165,138,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(166,138,106,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(167,138,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(168,138,116,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(169,138,117,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(170,138,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(171,139,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(172,139,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(173,140,106,3,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(174,141,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(175,138,111,1,20);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(176,142,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(177,141,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(178,143,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(179,143,108,3,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(180,144,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(181,144,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(182,145,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(183,146,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(184,146,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(185,147,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(186,147,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(187,147,108,3,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(189,150,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(190,151,106,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(191,152,105,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(192,153,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(193,154,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(194,153,111,1,20);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(195,155,104,4,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(196,155,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(197,156,106,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(199,157,103,5,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(201,157,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(202,158,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(203,159,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(204,160,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(205,161,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(206,162,119,2,350);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(207,163,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(208,163,113,1,150);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(209,163,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(210,164,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(211,167,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(212,168,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(213,169,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(214,170,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(215,167,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(216,171,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(217,171,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(218,172,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(219,167,111,1,20);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(220,173,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(221,171,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(222,174,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(223,174,116,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(224,175,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(225,175,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(226,176,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(227,176,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(228,176,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(229,177,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(230,177,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(231,177,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(232,178,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(233,179,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(234,179,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(235,179,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(236,179,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(238,180,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(240,178,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(241,180,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(242,181,106,3,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(243,181,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(244,181,112,2,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(245,182,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(246,182,113,2,150);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(247,184,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(248,184,113,1,150);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(249,184,112,2,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(250,184,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(251,185,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(252,186,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(253,186,114,1,40);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(255,185,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(256,186,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(257,188,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(258,188,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(259,189,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(260,190,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(261,190,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(262,190,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(263,191,103,4,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(264,191,110,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(265,192,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(266,193,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(267,193,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(268,194,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(269,196,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(270,196,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(271,196,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(272,189,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(273,189,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(274,196,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(275,197,116,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(276,198,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(277,198,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(278,199,104,2,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(279,200,104,1,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(280,200,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(281,201,103,3,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(282,201,108,3,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(283,202,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(284,202,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(285,203,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(286,203,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(287,204,103,2,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(288,204,107,2,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(289,205,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(290,205,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(291,204,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(292,205,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(293,204,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(294,204,111,3,20);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(297,207,107,1,100);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(298,207,105,2,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(299,207,108,2,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(300,207,117,1,120);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(301,208,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(302,209,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(303,210,105,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(304,210,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(305,211,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(306,211,109,1,50);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(307,212,104,2,250);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(308,212,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(309,213,103,1,300);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(310,213,106,1,200);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(311,213,112,1,60);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(312,213,108,1,70);
INSERT INTO "order_items" ("id","order_id","product_id","quantity","unit_price") VALUES(313,214,103,1,300);
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
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(71,'+905417173177',0,'2026-07-04 08:05:26');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(72,'+905426747381',1,'2026-07-04 08:57:13');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(73,'+905352563281',1,'2026-07-04 10:52:01');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(74,'+905314081416',1,'2026-07-04 11:15:21');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(75,'+905314081416',1,'2026-07-04 11:16:24');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(76,'+905314081416',1,'2026-07-04 11:25:27');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(77,'+905511593169',1,'2026-07-04 11:55:36');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(78,'+905446776171',1,'2026-07-04 12:46:36');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(79,'+905319640907',1,'2026-07-04 14:13:45');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(80,'+905319677033',1,'2026-07-04 14:52:53');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(81,'+905466564574',1,'2026-07-04 15:22:33');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(82,'+905331525471',1,'2026-07-04 18:50:27');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(83,'+905376065442',1,'2026-07-04 19:29:16');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(84,'+905347836135',0,'2026-07-05 11:34:36');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(85,'+905415563065',0,'2026-07-05 11:35:55');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(86,'+905421688107',0,'2026-07-05 12:27:57');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(87,'+905424770734',0,'2026-07-05 13:08:00');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(88,'+905424770734',0,'2026-07-05 13:10:30');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(89,'+905456817503',1,'2026-07-05 13:59:14');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(90,'+905456817503',1,'2026-07-05 14:38:24');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(91,'+905456817503',1,'2026-07-05 14:41:29');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(92,'+905350760707',1,'2026-07-05 16:03:15');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(93,'+905422733669',1,'2026-07-05 16:40:17');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(94,'+905379796299',1,'2026-07-05 16:54:29');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(95,'+905422733669',1,'2026-07-05 16:58:56');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(96,'+905417173177',1,'2026-07-06 07:22:52');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(97,'+905462778640',1,'2026-07-06 08:45:51');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(98,'+905322921638',1,'2026-07-06 09:01:40');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(99,'+905060676153',1,'2026-07-06 09:16:42');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(100,'+905060676153',1,'2026-07-06 09:17:48');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(101,'+905060676153',1,'2026-07-06 09:18:24');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(102,'+905453011611',1,'2026-07-06 10:00:15');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(103,'+905453011611',1,'2026-07-06 10:06:07');
INSERT INTO "incoming_calls" ("id","phone","acknowledged","created_at") VALUES(104,'+905494224050',1,'2026-07-06 10:14:32');
CREATE TABLE login_attempts (ip TEXT PRIMARY KEY, count INTEGER DEFAULT 1, reset_at INTEGER NOT NULL);
CREATE TABLE cari_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount REAL NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
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
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('incoming_calls',104);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',27);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',119);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('orders',214);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('order_items',313);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('customers',23);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('cari_payments',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',6);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('areas',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('dining_tables',12);
