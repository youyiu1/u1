-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: neighborhood_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `t_admin_blacklist`
--

DROP TABLE IF EXISTS `t_admin_blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admin_blacklist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target_type` varchar(20) NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT '',
  `creator` varchar(64) DEFAULT '',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_type`,`target_value`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_admin_blacklist`
--

LOCK TABLES `t_admin_blacklist` WRITE;
/*!40000 ALTER TABLE `t_admin_blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_admin_blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_admin_image_status`
--

DROP TABLE IF EXISTS `t_admin_image_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admin_image_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `status` varchar(20) DEFAULT 'approved',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_image_url` (`image_url`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_admin_image_status`
--

LOCK TABLES `t_admin_image_status` WRITE;
/*!40000 ALTER TABLE `t_admin_image_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_admin_image_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_admin_login_log`
--

DROP TABLE IF EXISTS `t_admin_login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admin_login_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) DEFAULT '',
  `username` varchar(64) DEFAULT '',
  `ip` varchar(64) DEFAULT '',
  `device` varchar(255) DEFAULT '',
  `location` varchar(100) DEFAULT '',
  `status` varchar(20) DEFAULT 'success',
  `fail_reason` varchar(255) DEFAULT '',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_admin_login_log`
--

LOCK TABLES `t_admin_login_log` WRITE;
/*!40000 ALTER TABLE `t_admin_login_log` DISABLE KEYS */;
INSERT INTO `t_admin_login_log` VALUES (1,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 17:00:26'),(2,'','','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','failed','账号或密码错误','2026-05-30 17:13:24'),(3,'','admin','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Codex/26.519.31651 Chrome/148.0.7778.97 Electron/42.1.0 Safari/537.36','本地网络','failed','账号或密码错误','2026-05-30 17:14:02'),(4,'','admin','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Codex/26.519.31651 Chrome/148.0.7778.97 Electron/42.1.0 Safari/537.36','本地网络','failed','账号或密码错误','2026-05-30 17:14:19'),(5,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 17:30:12'),(6,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Codex/26.519.31651 Chrome/148.0.7778.97 Electron/42.1.0 Safari/537.36','本地网络','success','','2026-05-30 17:43:51'),(7,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','本地网络','success','','2026-05-30 20:14:09'),(8,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Codex/26.519.31651 Chrome/148.0.7778.97 Electron/42.1.0 Safari/537.36','本地网络','success','','2026-05-30 21:37:29'),(9,'normal_user','normal','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','failed','普通用户不能访问管理端','2026-05-30 22:21:23'),(10,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 22:21:24'),(11,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 22:21:24'),(12,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 22:34:33'),(13,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 22:34:34'),(14,'normal_user','normal','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','failed','普通用户不能访问管理端','2026-05-30 22:34:34'),(15,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Codex/26.519.31651 Chrome/148.0.7778.97 Electron/42.1.0 Safari/537.36','本地网络','success','','2026-05-30 22:36:54'),(16,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:09:21'),(17,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36','本地网络','success','','2026-05-30 23:11:53'),(18,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:13:29'),(19,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:13:29'),(20,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:26:12'),(21,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:26:12'),(22,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:26:41'),(23,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:26:41'),(24,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36','本地网络','success','','2026-05-30 23:33:49'),(25,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-30 23:35:19'),(26,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36','本地网络','success','','2026-05-30 23:36:11'),(27,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:46:41'),(28,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:47:05'),(29,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:48:28'),(30,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:48:46'),(31,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:49:44'),(32,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:50:15'),(33,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:50:39'),(34,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:51:09'),(35,'2056555272571645954','元','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 13:51:31'),(36,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:38:15'),(37,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:41:40'),(38,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:47:37'),(39,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:48:19'),(40,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:48:50'),(41,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:49:48'),(42,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:51:01'),(43,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','success','','2026-05-31 23:51:30'),(44,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','本地网络','success','','2026-06-01 14:53:36'),(45,'','admin','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36','本地网络','failed','账号或密码错误','2026-06-02 18:03:43'),(46,'','admin','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','failed','账号或密码错误','2026-06-02 18:04:53'),(47,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36','本地网络','success','','2026-06-02 18:10:14'),(48,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36 Edg/148.0.0.0','本地网络','success','','2026-06-02 18:16:45'),(49,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36 Edg/148.0.0.0','本地网络','success','','2026-06-02 18:18:42'),(50,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','本地网络','success','','2026-06-02 20:45:05'),(51,'','manager','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地网络','failed','账号或密码错误','2026-06-02 21:01:27'),(52,'','x','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','failed','Invalid username or password','2026-06-02 21:07:28'),(53,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:07:41'),(54,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:08:00'),(55,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:08:00'),(56,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:08:00'),(57,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:08:29'),(58,'','x','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','failed','Invalid username or password','2026-06-02 21:10:29'),(59,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:10:45'),(60,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:10:45'),(61,'','x','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','failed','账号或密码错误','2026-06-02 21:18:56'),(62,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:19:08'),(63,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:19:08'),(64,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','鏈湴缃戠粶','success','','2026-06-02 21:34:27'),(65,'','readonly@example.com','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','failed','账号或密码错误','2026-06-02 21:41:37'),(66,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:41:37'),(67,'admin_readonly','readonly','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 21:41:37'),(68,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','鏈湴缃戠粶','success','','2026-06-02 21:50:38'),(69,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','鏈湴缃戠粶','success','','2026-06-02 21:55:56'),(70,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 22:01:05'),(71,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','鏈湴缃戠粶','success','','2026-06-02 22:01:05'),(72,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','鏈湴缃戠粶','success','','2026-06-02 22:32:32'),(73,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 20:40:13'),(74,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 21:20:50'),(75,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 21:21:40'),(76,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 21:22:49'),(77,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 21:48:12'),(78,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 22:46:47'),(79,'','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','failed','账号或密码错误','2026-06-04 22:46:47'),(80,'','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','failed','账号或密码错误','2026-06-04 22:48:14'),(81,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 22:49:00'),(82,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 22:56:56'),(83,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 22:56:56'),(84,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:00:55'),(85,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:00:56'),(86,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:00:56'),(87,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:00:56'),(88,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:00:56'),(89,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:04:12'),(90,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:16:52'),(91,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:18:00'),(92,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:20:32'),(93,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:20:49'),(94,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:25:38'),(95,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:26:57'),(96,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:34:24'),(97,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:35:16'),(98,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-04 23:36:35'),(99,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:10:03'),(100,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:10:04'),(101,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:22:09'),(102,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:23:55'),(103,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:23:55'),(104,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:31:35'),(105,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:31:35'),(106,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:32:48'),(107,'admin_test','test','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:53:22'),(108,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 00:53:22'),(109,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:04:04'),(110,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:04:31'),(111,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:06:31'),(112,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:07:08'),(113,'u001','李阿姨','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','failed','普通用户不能访问管理端','2026-06-05 13:07:08'),(114,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:17:13'),(115,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:35:01'),(116,'admin_readonly','test1','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.7920','本地','success','','2026-06-05 13:35:13'),(117,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','本地','success','','2026-06-05 14:40:44'),(118,'2056555272571645954','y','0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','本地','success','','2026-06-05 15:02:05');
/*!40000 ALTER TABLE `t_admin_login_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_admin_operation_log`
--

DROP TABLE IF EXISTS `t_admin_operation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admin_operation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `operator` varchar(64) DEFAULT '',
  `role_name` varchar(64) DEFAULT '',
  `action_name` varchar(100) DEFAULT '',
  `target` varchar(255) DEFAULT '',
  `ip` varchar(64) DEFAULT '',
  `status` varchar(20) DEFAULT 'success',
  `details` varchar(500) DEFAULT '',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_admin_operation_log`
--

LOCK TABLES `t_admin_operation_log` WRITE;
/*!40000 ALTER TABLE `t_admin_operation_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_admin_operation_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_admin_role`
--

DROP TABLE IF EXISTS `t_admin_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admin_role` (
  `id` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(64) NOT NULL,
  `description` varchar(255) DEFAULT '',
  `status` varchar(20) DEFAULT 'active',
  `menu_ids` text,
  `permission_codes` text,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_admin_role`
--

LOCK TABLES `t_admin_role` WRITE;
/*!40000 ALTER TABLE `t_admin_role` DISABLE KEYS */;
INSERT INTO `t_admin_role` VALUES ('role-admin','管理员','ADMIN','可访问全部管理页面，负责日常审核与运营操作','active','[\"menu-users\",\"menu-blacklist\",\"menu-posts\",\"menu-comments\",\"menu-images\",\"menu-messages\",\"menu-market\",\"menu-services\",\"menu-orders\",\"menu-notifications\",\"menu-categories\",\"menu-menus\",\"menu-roles\",\"menu-permissions\",\"menu-login-logs\",\"menu-op-logs\"]','[\"user:view\",\"user:ban\",\"user:verify\",\"blacklist:edit\",\"blacklist:view\",\"posts:view\",\"posts:audit\",\"comments:view\",\"comments:manage\",\"images:audit\",\"images:view\",\"goods:view\",\"goods:audit\",\"services:view\",\"services:manage\",\"orders:view\",\"orders:cancel\",\"notifications:view\",\"notifications:create\",\"categories:view\",\"categories:edit\",\"menus:view\",\"roles:view\",\"permissions:view\",\"messages:view\",\"messages:manage\",\"logs:login\",\"logs:operation\"]','2026-06-02 21:07:26','2026-06-05 00:31:35'),('role-readonly','只读管理员','READONLY_ADMIN','可访问全部管理页面，但不可执行写操作','active','[\"menu-users\",\"menu-blacklist\",\"menu-posts\",\"menu-comments\",\"menu-images\",\"menu-messages\",\"menu-market\",\"menu-services\",\"menu-orders\",\"menu-notifications\",\"menu-categories\",\"menu-menus\",\"menu-roles\",\"menu-permissions\",\"menu-login-logs\",\"menu-op-logs\"]','[\"user:view\",\"posts:view\",\"goods:view\",\"services:view\",\"orders:view\",\"categories:view\",\"notifications:view\",\"menus:view\",\"messages:view\",\"comments:view\",\"images:view\",\"blacklist:view\",\"logs:login\",\"logs:operation\",\"roles:view\",\"permissions:view\"]','2026-06-02 21:07:26','2026-06-03 08:51:01'),('role-super','超级管理员','SUPER_ADMIN','拥有管理端全部页面与全部操作权限','active','[\"menu-users\",\"menu-blacklist\",\"menu-posts\",\"menu-comments\",\"menu-images\",\"menu-messages\",\"menu-market\",\"menu-services\",\"menu-orders\",\"menu-notifications\",\"menu-categories\",\"menu-menus\",\"menu-roles\",\"menu-permissions\",\"menu-login-logs\",\"menu-op-logs\"]','[\"user:view\",\"user:ban\",\"user:verify\",\"user:role\",\"blacklist:edit\",\"blacklist:view\",\"posts:view\",\"posts:audit\",\"comments:view\",\"comments:manage\",\"images:audit\",\"images:view\",\"goods:view\",\"goods:audit\",\"services:view\",\"services:manage\",\"orders:view\",\"orders:cancel\",\"notifications:view\",\"notifications:create\",\"categories:view\",\"categories:edit\",\"menus:view\",\"roles:view\",\"roles:manage\",\"permissions:view\",\"messages:view\",\"messages:manage\",\"logs:login\",\"logs:operation\",\"logs:retention\"]','2026-06-02 21:07:26','2026-06-03 08:51:01'),('role-user','普通用户','USER','前台普通账号，不具备管理端权限','active','[]','[]','2026-06-02 21:07:26','2026-06-03 08:51:01');
/*!40000 ALTER TABLE `t_admin_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_booking`
--

DROP TABLE IF EXISTS `t_booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_booking` (
  `id` bigint NOT NULL COMMENT '预约ID',
  `service_id` bigint NOT NULL COMMENT '服务ID',
  `buyer_id` varchar(64) NOT NULL COMMENT '买家ID',
  `seller_id` varchar(64) NOT NULL COMMENT '卖家ID',
  `booking_date` datetime NOT NULL COMMENT '预约日期',
  `booking_time` varchar(50) NOT NULL COMMENT '预约时间',
  `duration` int DEFAULT '1' COMMENT '服务时长(小时)',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态:pending confirmed completed cancelled',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notification_id` bigint DEFAULT NULL COMMENT '鍏宠仈鐨勯?鐭?D',
  PRIMARY KEY (`id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_booking_buyer_status_time` (`buyer_id`,`status`,`create_time` DESC),
  KEY `idx_booking_seller_status_time` (`seller_id`,`status`,`create_time` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='预约表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_booking`
--

LOCK TABLES `t_booking` WRITE;
/*!40000 ALTER TABLE `t_booking` DISABLE KEYS */;
INSERT INTO `t_booking` VALUES (2056636804829233154,1,'u001','u001','2026-05-20 10:00:00','10:00',2,'pending','2026-05-19 15:23:19','2026-05-19 15:23:19',NULL),(2056637003194646529,2,'u002','u001','2026-05-20 14:00:00','14:00',1,'pending','2026-05-19 15:24:07','2026-05-19 15:24:07',NULL),(2056639841907982338,1,'u003','u002','2026-05-21 09:00:00','09:00',2,'pending','2026-05-19 15:35:24','2026-05-19 15:35:24',NULL),(2056641218050711553,1,'2056555272571645954','u001','2026-05-19 15:00:00','15:00',4,'pending','2026-05-19 15:40:52','2026-05-19 15:40:52',NULL),(2056653972853710850,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:31:33','2026-05-19 16:31:33',NULL),(2056653981313622018,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:31:35','2026-05-19 16:31:35',NULL),(2056653993758121985,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:31:38','2026-05-19 16:31:38',NULL),(2056654071273054210,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:31:56','2026-05-19 16:31:56',NULL),(2056654092248768514,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:32:01','2026-05-19 16:32:01',NULL),(2056654098519252993,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:32:03','2026-05-19 16:32:03',NULL),(2056656677240266753,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:42:17','2026-05-19 16:42:17',NULL),(2056658060018409473,1,'2056555272571645954','u001','2026-05-19 16:00:00','16:00',4,'pending','2026-05-19 16:47:47','2026-05-19 16:47:47',NULL),(2056746669832536065,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:39:53','2026-05-19 22:39:53',NULL),(2056746842734329857,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:40:34','2026-05-19 22:40:34',NULL),(2056747944758345730,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:44:57','2026-05-19 22:44:57',NULL),(2056748022743040002,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:45:16','2026-05-19 22:45:16',NULL),(2056748099553329153,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:45:34','2026-05-19 22:45:34',NULL),(2056748122051575809,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:45:39','2026-05-19 22:45:39',NULL),(2056748199222575105,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:45:58','2026-05-19 22:45:58',NULL),(2056748276586512386,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:46:16','2026-05-19 22:46:16',NULL),(2056748871800193025,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:48:38','2026-05-19 22:48:38',NULL),(2056748902309560321,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:48:46','2026-05-19 22:48:46',NULL),(2056748918675734529,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:48:49','2026-05-19 22:48:49',NULL),(2056748928750452738,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:48:52','2026-05-19 22:48:52',NULL),(2056748989064544257,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:49:06','2026-05-19 22:49:06',NULL),(2056749892148527105,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:52:42','2026-05-19 22:52:42',NULL),(2056749898012164098,1,'2056555272571645954','u001','2026-05-19 22:00:00','22:00',4,'pending','2026-05-19 22:52:43','2026-05-19 22:52:43',NULL),(2056989620546531329,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:17','2026-05-20 14:45:17',NULL),(2056989654302289922,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:25','2026-05-20 14:45:25',NULL),(2056989665845014529,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:28','2026-05-20 14:45:28',NULL),(2056989666696458242,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:28','2026-05-20 14:45:28',NULL),(2056989667535319042,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:28','2026-05-20 14:45:28',NULL),(2056989668374179842,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:29','2026-05-20 14:45:29',NULL),(2056989669158514689,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:29','2026-05-20 14:45:29',NULL),(2056989669934460930,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:29','2026-05-20 14:45:29',NULL),(2056989670706212866,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:29','2026-05-20 14:45:29',NULL),(2056989713626525697,1,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:45:39','2026-05-20 14:45:39',NULL),(2056990506077351938,2,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:48:48','2026-05-20 14:48:48',NULL),(2056990553493958658,2,'2056555272571645954','u001','2026-05-20 14:00:00','14:00',4,'pending','2026-05-20 14:49:00','2026-05-20 14:49:00',NULL),(2056996299346477058,1,'2056555272571645954','u001','2026-05-20 15:00:00','15:00',4,'pending','2026-05-20 15:11:50','2026-05-20 15:11:50',NULL),(2056996786892374017,1,'2056555272571645954','u001','2026-05-20 15:00:00','15:00',4,'pending','2026-05-20 15:13:46','2026-05-20 15:13:46',NULL),(2057016121497178114,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:30:36','2026-05-20 16:30:36',NULL),(2057016122977767426,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:30:36','2026-05-20 16:30:36',NULL),(2057016141466259458,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:30:40','2026-05-20 16:30:40',NULL),(2057016451895087105,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:31:54','2026-05-20 16:31:54',NULL),(2057021050022481921,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:50:11','2026-05-20 16:50:11',NULL),(2057022405176938498,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:55:34','2026-05-20 16:55:34',NULL),(2057022468502540289,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:55:49','2026-05-20 16:55:49',NULL),(2057023358143778818,1,'2056555272571645954','u001','2026-05-20 16:00:00','16:00',4,'pending','2026-05-20 16:59:21','2026-05-20 16:59:21',NULL),(2057026038773796866,1,'2056555272571645954','u001','2026-05-20 17:00:00','17:00',4,'pending','2026-05-20 17:10:00','2026-05-20 17:10:00',NULL),(2057027132149157890,1,'2056555272571645954','u001','2026-05-20 17:00:00','17:00',4,'pending','2026-05-20 17:14:21','2026-05-20 17:14:21',NULL),(2057027552988844034,1,'2056555272571645954','u001','2026-05-20 17:00:00','17:00',4,'pending','2026-05-20 17:16:01','2026-05-20 17:16:01',NULL),(2059226131388112897,1,'2056555272571645954','u001','2026-05-26 18:00:00','18:00',4,'pending','2026-05-26 18:52:23','2026-05-26 18:52:23',NULL),(2059226154196738050,1,'2056555272571645954','u001','2026-05-26 18:00:00','18:00',4,'pending','2026-05-26 18:52:28','2026-05-26 18:52:28',NULL),(2059228478587740161,1,'2056555272571645954','u001','2026-05-26 18:00:00','18:00',4,'pending','2026-05-26 19:01:43','2026-05-26 19:01:43',NULL),(2059229387862450177,1,'2056555272571645954','u001','2026-05-26 19:00:00','19:00',4,'pending','2026-05-26 19:05:19','2026-05-26 19:05:19',NULL),(2059229420359917569,1,'2056555272571645954','u001','2026-05-26 19:00:00','19:00',4,'pending','2026-05-26 19:05:27','2026-05-26 19:05:27',NULL),(2059234843599290370,1,'2056555272571645954','u001','2026-05-26 19:00:00','19:00',4,'pending','2026-05-26 19:27:00','2026-05-26 19:27:00',NULL),(2059562784480747522,2,'2056555272571645954','u001','2026-05-27 17:00:00','17:00',4,'pending','2026-05-27 17:10:07','2026-05-27 17:10:07',NULL),(2059588158304477186,3,'2056555272571645954','u002','2026-05-27 18:00:00','18:00',4,'pending','2026-05-27 18:50:57','2026-05-27 18:50:57',NULL),(2059589576348327937,2059235922785320961,'2056555272571645954','2056555272571645954','2026-05-27 18:00:00','18:00',4,'pending','2026-05-27 18:56:35','2026-05-27 18:56:35',NULL);
/*!40000 ALTER TABLE `t_booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_category`
--

DROP TABLE IF EXISTS `t_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(64) DEFAULT 'category',
  `type` varchar(20) DEFAULT 'service',
  `status` varchar(20) DEFAULT 'normal',
  `sort_order` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type_order` (`type`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=2062571060159971331 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_category`
--

LOCK TABLES `t_category` WRITE;
/*!40000 ALTER TABLE `t_category` DISABLE KEYS */;
INSERT INTO `t_category` VALUES (1,'生活服务','category','service','normal',10,'2026-05-30 23:26:12'),(2,'闲置商品','category','goods','normal',20,'2026-05-30 23:26:12'),(3,'动态内容','category','dynamic','normal',30,'2026-05-30 23:26:12');
/*!40000 ALTER TABLE `t_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_comment`
--

DROP TABLE IF EXISTS `t_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_comment` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `news_id` bigint NOT NULL COMMENT '动态ID',
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `user_avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户头像',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `likes` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `parent_id` bigint DEFAULT '0' COMMENT '父评论ID',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  PRIMARY KEY (`id`),
  KEY `idx_news_id` (`news_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_news_create` (`news_id`,`create_time` DESC),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_comment_news_like_time` (`news_id`,`likes`,`create_time`),
  KEY `idx_comment_status_time` (`status`,`create_time` DESC),
  KEY `idx_comment_news_status_time` (`news_id`,`status`,`create_time` DESC),
  KEY `idx_comment_news_status_likes_time` (`news_id`,`status`,`likes`,`create_time` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=2062573295522676738 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_comment`
--

LOCK TABLES `t_comment` WRITE;
/*!40000 ALTER TABLE `t_comment` DISABLE KEYS */;
INSERT INTO `t_comment` VALUES (3,1,'u001','李阿姨','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','这家花店确实不错！',6,'2026-05-25 16:42:01',0,'normal'),(4,1,'u002','王大厨','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','谢谢推荐，已收藏',4,'2026-05-25 16:42:01',0,'normal'),(5,2,'u001','李阿姨','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','柯基找到了吗？',2,'2026-05-25 16:42:01',0,'normal'),(2058747503143485441,2057351368537436161,'2056555272571645954','元','/api/file/images/2026/05/25573c9475244347879acebaa5cf444c51.jpg','szd',0,'2026-05-25 11:10:29',0,'normal'),(2058831434672979970,2057351368537436161,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','ssd',0,'2026-05-25 16:44:00',0,'normal'),(2059295147603480578,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','s\'d\'f',0,'2026-05-26 23:26:38',0,'normal'),(2060166304011603969,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 sd',0,'2026-05-29 09:08:18',0,'normal'),(2060168121747460097,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 删掉\n\n @元 ',1,'2026-05-29 09:15:31',0,'normal'),(2060173491576459265,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 ',0,'2026-05-29 09:36:51',0,'normal'),(2060181276225654786,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 ',0,'2026-05-29 10:07:47',0,'normal'),(2060181553435594754,2057307709922213890,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','删掉',0,'2026-05-29 10:08:53',0,'normal'),(2060181581562597378,2057307709922213890,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 士大夫',0,'2026-05-29 10:09:00',0,'normal'),(2060182259857051649,2057307709922213890,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 ',0,'2026-05-29 10:11:42',0,'normal'),(2060198256634683394,2057351368537436161,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 删掉\n',0,'2026-05-29 11:15:16',2058747503143485441,'normal'),(2060203373396156417,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 覆盖\n',0,'2026-05-29 11:35:36',2060166304011603969,'normal'),(2060205749456789505,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 共有\n',0,'2026-05-29 11:45:02',2059295147603480578,'normal'),(2060205788354764801,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 共有',0,'2026-05-29 11:45:11',2060205749456789505,'normal'),(2060207421520273409,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 hi\n',0,'2026-05-29 11:51:41',2060205749456789505,'normal'),(2060207491158302721,2059293641194033153,'2056555272571645954','元','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','@元 姑姑',0,'2026-05-29 11:51:57',2060203373396156417,'normal'),(2061344578859368450,2060962266732797954,'2056555272571645954','y','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','sdf',0,'2026-06-01 15:10:20',0,'normal'),(2061344610312454145,2060962266732797954,'2056555272571645954','y','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','asdf',0,'2026-06-01 15:10:28',0,'normal');
/*!40000 ALTER TABLE `t_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_comment_like`
--

DROP TABLE IF EXISTS `t_comment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_comment_like` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `comment_id` bigint NOT NULL COMMENT '评论ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comment_user` (`comment_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='评论点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_comment_like`
--

LOCK TABLES `t_comment_like` WRITE;
/*!40000 ALTER TABLE `t_comment_like` DISABLE KEYS */;
INSERT INTO `t_comment_like` VALUES (2059927565607837698,3,'u001'),(2059914758212493313,4,'2056555272571645954'),(2059929352318427138,2058831434672980000,'2056555272571645954'),(2060021951205154817,2059295147603480600,'2056555272571645954'),(2060239155083272193,2060168121747460097,'2056555272571645954');
/*!40000 ALTER TABLE `t_comment_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_favorite`
--

DROP TABLE IF EXISTS `t_favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_favorite` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `target_type` varchar(20) NOT NULL COMMENT '类型：news/market/service',
  `target_id` bigint NOT NULL COMMENT '目标ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`,`target_type`,`target_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_favorite_user_time` (`user_id`,`create_time` DESC),
  KEY `idx_favorite_target` (`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_favorite`
--

LOCK TABLES `t_favorite` WRITE;
/*!40000 ALTER TABLE `t_favorite` DISABLE KEYS */;
INSERT INTO `t_favorite` VALUES (2059086854243196930,'2056555272571645954','news',999,'2026-05-26 09:38:56'),(2059164602273828865,'2056555272571645954','news',1,'2026-05-26 14:47:53'),(2059171652894658561,'2056555272571645954','news',2057307709922213890,'2026-05-26 15:15:54'),(2059172870534664194,'2056555272571645954','news',2057351368537436161,'2026-05-26 15:20:44');
/*!40000 ALTER TABLE `t_favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_follow`
--

DROP TABLE IF EXISTS `t_follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_follow` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `follower_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关注者ID',
  `following_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '被关注者ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follow` (`follower_id`,`following_id`),
  KEY `idx_follower` (`follower_id`),
  KEY `idx_following` (`following_id`),
  KEY `idx_follow_follower_following` (`follower_id`,`following_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2062777156313235458 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_follow`
--

LOCK TABLES `t_follow` WRITE;
/*!40000 ALTER TABLE `t_follow` DISABLE KEYS */;
INSERT INTO `t_follow` VALUES (2056752382801739778,'2056555272571645954','undefined','2026-05-19 23:02:35'),(2059186480841445378,'2056555272571645954','u004','2026-05-26 16:14:49'),(2059192137195933697,'2056555272571645954','u005','2026-05-26 16:37:18'),(2060241707631828993,'2056555272571645954','u002','2026-05-29 14:07:55');
/*!40000 ALTER TABLE `t_follow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_market_item`
--

DROP TABLE IF EXISTS `t_market_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_market_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '物品ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '描述',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `item_condition` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '成色',
  `images` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seller_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '卖家ID',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '分类',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '位置',
  `verified` tinyint(1) DEFAULT '0' COMMENT '是否认证',
  `free_shipping` tinyint(1) DEFAULT '0' COMMENT '是否包邮',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_seller` (`seller_id`),
  KEY `idx_category` (`category`),
  KEY `idx_create_time` (`created_at` DESC),
  KEY `idx_price` (`price`),
  KEY `idx_market_seller_id` (`seller_id`,`id`),
  KEY `idx_market_status_id` (`status`,`id` DESC),
  KEY `idx_market_seller_time` (`seller_id`,`created_at` DESC),
  KEY `idx_market_seller_id_id` (`seller_id`,`id` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=2062571059706986499 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闲置物品表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_market_item`
--

LOCK TABLES `t_market_item` WRITE;
/*!40000 ALTER TABLE `t_market_item` DISABLE KEYS */;
INSERT INTO `t_market_item` VALUES (1,'Test Coffee Machine',NULL,3200.00,'95成新','[\"/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg\"]','u002','',NULL,'',0,0,'2026-05-22 11:02:12','2026-05-25 10:42:20','active',''),(2,'Nintendo Switch 日版蓝红 - 带健身环','吃灰半年，全套包装齐全。',1800.00,'99新','[\"/api/file/images/2026/05/25a8bb77c8bde846389f9208b932a27833.jpg\"]','u003','market',2400.00,'徐汇区',1,1,'2026-05-18 19:05:09','2026-05-25 10:42:20','active','');
/*!40000 ALTER TABLE `t_market_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_message`
--

DROP TABLE IF EXISTS `t_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_message` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sender id',
  `receiver_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'receiver id',
  `content` text NOT NULL COMMENT '消息内容',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `message_type` varchar(20) DEFAULT 'text' COMMENT 'message type: text/image',
  `media_url` varchar(500) DEFAULT '' COMMENT 'media url for image message',
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_conversation` (`sender_id`,`receiver_id`),
  KEY `idx_create_time` (`create_time` DESC),
  KEY `idx_msg_sender_receiver_time` (`sender_id`,`receiver_id`,`create_time`),
  KEY `idx_msg_receiver_sender_read_time` (`receiver_id`,`sender_id`,`is_read`,`create_time`),
  KEY `idx_message_sender_receiver_time` (`sender_id`,`receiver_id`,`create_time` DESC),
  KEY `idx_message_receiver_read_time` (`receiver_id`,`is_read`,`create_time` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='消息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_message`
--

LOCK TABLES `t_message` WRITE;
/*!40000 ALTER TABLE `t_message` DISABLE KEYS */;
INSERT INTO `t_message` VALUES (13,'2056555272571645954','u001','你好，我想了解一下',1,'2026-05-21 17:12:35','text',''),(14,'2056555272571645954','u001','ssdds',1,'2026-05-21 17:12:39','text',''),(15,'2056555272571645954','u001','您好，我想预约您的服务「专业家庭保洁 - 全屋深度除尘除螨及高温消毒」，预约时间：2026-05-26 19:00，时长：4小时。请确认是否可接单。',1,'2026-05-26 19:05:19','text',''),(16,'2056555272571645954','u001','您好，我想预约您的服务「专业家庭保洁 - 全屋深度除尘除螨及高温消毒」，预约时间：2026-05-26 19:00，时长：4小时。请确认是否可接单。',1,'2026-05-26 19:05:27','text',''),(17,'2056555272571645954','u001','您好，我想预约您的服务「专业家庭保洁 - 全屋深度除尘除螨及高温消毒」，预约时间：2026-05-26 19:00，时长：4小时。请确认是否可接单。',1,'2026-05-26 19:27:00','text',''),(18,'2056555272571645954','u001','您好，我想预约您的服务「上门宠物洗护 - 狗狗SPA与深度清洁」，预约时间：2026-05-27 17:00，时长：4小时。请确认是否可接单。',1,'2026-05-27 17:10:07','text',''),(19,'2056555272571645954','u002','您好，我想预约您的服务「Test Service」，预约时间：2026-05-27 18:00，时长：4小时。请确认是否可接单。',0,'2026-05-27 18:50:57','text',''),(20,'2056555272571645954','2056555272571645954','您好，我想预约您的服务「撒是」，预约时间：2026-05-27 18:00，时长：4小时。请确认是否可接单。',1,'2026-05-27 18:56:35','text',''),(21,'2056555272571645954','u003','你好，我想了解一下',1,'2026-05-28 15:15:04','text',''),(22,'2056555272571645954','u001','士大夫',1,'2026-05-31 15:19:45','text',''),(23,'2056555272571645954','u001','👍',1,'2026-05-31 17:45:23','text','');
/*!40000 ALTER TABLE `t_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_news`
--

DROP TABLE IF EXISTS `t_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_news` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '动态ID',
  `author_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作者ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '标题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '动态内容',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '位置',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '生活记录' COMMENT '分类',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `comments_count` int DEFAULT '0' COMMENT '评论数',
  `images` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shares` int DEFAULT '0' COMMENT '分享数',
  `collections` int DEFAULT '0' COMMENT '收藏数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_create_time` (`create_time` DESC),
  KEY `idx_likes` (`likes` DESC),
  KEY `idx_news_comments_count` (`comments_count`),
  KEY `idx_news_author_ctime` (`author_id`,`create_time`),
  KEY `idx_news_status_time` (`status`,`create_time` DESC),
  KEY `idx_news_author_time` (`author_id`,`create_time` DESC),
  KEY `idx_news_status_comments_count` (`status`,`comments_count` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=2062573295128412163 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区动态表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_news`
--

LOCK TABLES `t_news` WRITE;
/*!40000 ALTER TABLE `t_news` DISABLE KEYS */;
INSERT INTO `t_news` VALUES (1,'u001','','今天在小区门口发现了一家新开的花店，品种好齐全，老板人也特别好！强烈推荐给各位邻居~ 🌸🌷','金地格林世界','生活记录',43,5,'[\"/api/file/images/2026/05/256b541d59db8041b79d36b6b089371833.jpg\"]',2,6,'2026-05-18 19:05:09','2026-06-04 23:35:17','normal',''),(2,'u002','','有人在公园看到一只走失的柯基吗？邻居家的狗跑丢了，大家帮忙关注下，特征是背部有一块深色花纹。','滨江公园','生活记录',86,15,NULL,12,8,'2026-05-18 19:05:09','2026-05-26 17:28:47','normal',''),(2057036000925290498,'u002','','Test content','','生活记录',0,0,NULL,0,0,'2026-05-20 17:49:35','2026-05-20 17:49:35','normal',''),(2057036000925290499,'u002','','Direct DB test','','生活记录',0,0,NULL,0,0,'2026-05-20 18:09:34','2026-05-20 18:09:34','normal',''),(2057036000925290500,'u001','数据库直接插入','测试内容','','生活记录',0,0,NULL,0,0,'2026-05-20 19:13:04','2026-05-25 00:36:32','normal',''),(2057061171371380738,'u001','','test after fix','','生活记录',0,0,NULL,0,0,'2026-05-20 19:29:36','2026-05-20 19:29:36','normal',''),(2057061538201014274,'u001','','test news','','生活记录',5,0,NULL,0,0,'2026-05-20 19:31:03','2026-05-28 10:24:57','normal',''),(2057280777390362625,'u001','','test with valid token','','生活记录',0,0,NULL,0,0,'2026-05-21 10:02:14','2026-05-21 10:02:14','normal',''),(2057281437678628866,'u001','','test with valid token','','生活记录',0,0,NULL,0,0,'2026-05-21 10:04:51','2026-05-21 10:04:51','normal',''),(2057282155584118785,'u001','','test with valid token','','生活记录',0,0,NULL,0,0,'2026-05-21 10:07:43','2026-05-21 10:07:43','normal',''),(2057299961251811330,'2056555272571645954','','test','','生活记录',0,0,NULL,0,0,'2026-05-21 11:18:28','2026-05-26 17:39:25','normal',''),(2057307709922213890,'2056555272571645954','','test from curl','','生活记录',0,3,NULL,0,1,'2026-05-21 11:49:15','2026-05-29 10:11:41','normal',''),(2057351368537436161,'2056555272571645954','','test ok','','生活记录',15,3,NULL,0,1,'2026-05-21 14:42:44','2026-05-29 11:15:15','normal',''),(2059293641194033153,'2056555272571645954','#话题#都是','#话题#都是','天津市 河东区','生活记录',1,10,'[\"/api/file/images/2026/05/2628d5b7325ff14ad8be8d6aeec2b62447.png\"]',0,0,'2026-05-26 23:20:38','2026-06-01 22:38:10','normal',''),(2060961141564542978,'2056555272571645954','??????-20260531134639','?????? 20260531134639','????','????',0,0,'[]',0,0,'2026-05-31 13:46:41','2026-05-31 13:46:41','normal','');
/*!40000 ALTER TABLE `t_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_notification`
--

DROP TABLE IF EXISTS `t_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification` (
  `id` bigint NOT NULL COMMENT '通知ID',
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '内容',
  `time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '时间',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `service_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '服务名称',
  `is_processed` tinyint(1) DEFAULT '0' COMMENT '鏄?惁宸插?鐞',
  `order_id` bigint DEFAULT NULL COMMENT '鍏宠仈鐨勮?鍗旾D',
  `related_booking_id` bigint DEFAULT NULL COMMENT '鍏宠仈鐨勯?绾?D',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_time` (`time` DESC),
  KEY `idx_notify_user_time` (`user_id`,`time`),
  KEY `idx_notification_time` (`time` DESC),
  KEY `idx_notify_booking` (`related_booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_notification`
--

LOCK TABLES `t_notification` WRITE;
/*!40000 ALTER TABLE `t_notification` DISABLE KEYS */;
INSERT INTO `t_notification` VALUES (2062563290526412801,'u001','预约已确认','您的服务预约《Test Service》已通过服务商确认，请按时到达。预约时间：2026-06-05 10:00','2026-06-04 23:53:04',0,'Test Service',1,NULL,NULL),(2062568472505143297,'u001','预约成功','您已成功预约服务，请等待服务商确认。','2026-06-05 00:13:39',0,'Test Service',0,NULL,NULL),(2062568472505143298,'u002','新的预约请求','用户 李阿姨 预约了您的服务《Test Service》，时间：2026-06-20 10:00','2026-06-05 00:13:39',0,'Test Service',1,2062568477039185921,2062568472442228737),(2062568477102100482,'u001','预约已确认','您的服务预约《Test Service》已通过服务商确认，请按时到达。预约时间：2026-06-20 10:00','2026-06-05 00:13:40',0,'Test Service',1,NULL,NULL),(2062570273174323202,'u001','预约成功','您已成功预约服务，请等待服务商确认。','2026-06-05 00:20:48',0,'Test Service',0,NULL,NULL),(2062570273274986497,'u002','新的预约请求','用户 李阿姨 预约了您的服务《Test Service》，时间：2026-06-21 11:00','2026-06-05 00:20:49',0,'Test Service',1,2062570277863555073,2062570273132380162),(2062570277989384194,'u001','预约已确认','您的服务预约《Test Service》已通过服务商确认，请按时到达。预约时间：2026-06-21 11:00','2026-06-05 00:20:50',0,'Test Service',1,NULL,NULL),(2062573296365731842,'u001','预约成功','您已成功预约服务，请等待服务商确认。','2026-06-05 00:32:49',0,'Test Service',0,NULL,NULL),(2062573296365731843,'u002','新的预约请求','用户 李阿姨 预约了您的服务《Test Service》，时间：2026-06-22 12:00','2026-06-05 00:32:49',0,'Test Service',1,2062573300748779522,2062573296365731841),(2062573300815888386,'u001','预约已确认','您的服务预约《Test Service》已通过服务商确认，请按时到达。预约时间：2026-06-22 12:00','2026-06-05 00:32:50',0,'Test Service',1,NULL,NULL),(2062770196532641793,'u001','Rabbit测试','验证通知是否走消息队列','2026-06-05 13:35:14',0,'Test Service',0,NULL,NULL);
/*!40000 ALTER TABLE `t_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_order`
--

DROP TABLE IF EXISTS `t_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_order` (
  `id` bigint NOT NULL COMMENT '璁㈠崟ID',
  `booking_id` bigint DEFAULT NULL COMMENT '鍏宠仈鐨勯?绾?D',
  `buyer_id` varchar(64) NOT NULL COMMENT '涔板?ID',
  `seller_id` varchar(64) NOT NULL COMMENT '鍗栧?ID',
  `service_id` bigint DEFAULT NULL COMMENT '鏈嶅姟ID',
  `service_title` varchar(200) DEFAULT NULL COMMENT '鏈嶅姟鏍囬?',
  `price` decimal(10,2) DEFAULT NULL COMMENT '浠锋牸',
  `booking_date` datetime DEFAULT NULL COMMENT '棰勭害鏃ユ湡',
  `booking_time` varchar(50) DEFAULT NULL COMMENT '棰勭害鏃堕棿',
  `duration` int DEFAULT '1' COMMENT '鏈嶅姟鏃堕暱(灏忔椂)',
  `status` varchar(20) DEFAULT 'pending' COMMENT '鐘舵?:pending confirmed completed cancelled',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_time` datetime DEFAULT NULL COMMENT '用户确认完成时间',
  `cancel_reason` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_order_buyer_ctime` (`buyer_id`,`create_time`),
  KEY `idx_order_seller_ctime` (`seller_id`,`create_time`),
  KEY `idx_order_buyer_status_ctime` (`buyer_id`,`status`,`create_time`),
  KEY `idx_order_seller_status_ctime` (`seller_id`,`status`,`create_time`),
  KEY `idx_order_buyer_time` (`buyer_id`,`create_time` DESC),
  KEY `idx_order_seller_time` (`seller_id`,`create_time` DESC),
  KEY `idx_order_status_time` (`status`,`create_time` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='璁㈠崟琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_order`
--

LOCK TABLES `t_order` WRITE;
/*!40000 ALTER TABLE `t_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_review_like`
--

DROP TABLE IF EXISTS `t_review_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_review_like` (
  `id` bigint NOT NULL,
  `review_id` bigint NOT NULL,
  `user_id` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_review_user` (`review_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_review_like`
--

LOCK TABLES `t_review_like` WRITE;
/*!40000 ALTER TABLE `t_review_like` DISABLE KEYS */;
INSERT INTO `t_review_like` VALUES (2059834177202135041,5,'2056555272571645954'),(2059278167240540162,6,'2056555272571645954');
/*!40000 ALTER TABLE `t_review_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_service`
--

DROP TABLE IF EXISTS `t_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_service` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '服务ID',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '描述',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '分类',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `seller_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '服务商ID',
  `rating` double DEFAULT '0' COMMENT '评分',
  `reviews` int DEFAULT '0' COMMENT '评价数',
  `distance` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '距离',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '单位',
  `highlights` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `images` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `area` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_seller` (`seller_id`),
  KEY `idx_category` (`category`),
  KEY `idx_rating` (`rating` DESC),
  KEY `idx_create_time` (`created_at` DESC),
  KEY `idx_service_seller_created` (`seller_id`,`created_at`),
  KEY `idx_service_seller_id` (`seller_id`,`id`),
  KEY `idx_service_status_id` (`status`,`id` DESC),
  KEY `idx_service_seller_time` (`seller_id`,`created_at` DESC),
  KEY `idx_service_seller_id_id` (`seller_id`,`id` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=2062571061279850498 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生活服务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_service`
--

LOCK TABLES `t_service` WRITE;
/*!40000 ALTER TABLE `t_service` DISABLE KEYS */;
INSERT INTO `t_service` VALUES (1,'专业家庭保洁 - 全屋深度除尘除螨及高温消毒','我们提供的不只是保洁，更是为您打造一个健康舒心的居家环境。我们的服务包括：全屋360°除尘、厨卫重垢去除、全屋除螨以及紫外线/高温蒸汽消毒。','domestic',150.00,'u001',4.81,128,'1.2km','次','[\"4小时\", \"自备工具\", \"环保药剂\"]',30.31,120.345,'[\"/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg\"]','2026-05-18 19:05:09','2026-05-27 15:53:42','active','','',''),(2,'上门宠物洗护 - 狗狗SPA与深度清洁','专业宠物洗护师，3年大厂经验。','pet',88.00,'u001',5,86,'0.8km','次','[\"自带设备\", \"温和沐浴\"]',NULL,NULL,'[\"/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg\"]','2026-05-18 19:05:09','2026-05-25 12:01:12','active','','',''),(3,'Test Service','desc','',100.00,'u002',0,0,'','',NULL,NULL,NULL,'[\"/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg\"]','2026-05-20 18:44:39','2026-06-04 22:37:32','active','','',''),(2059235922785320961,'撒是','啊实打实','other',123.00,'2056555272571645954',0,0,'','件',NULL,NULL,NULL,'[\"/api/file/images/2026/05/26ba9a9759975e493a8313dba8712d5cfd.jpg\"]','2026-05-26 19:31:17','2026-05-26 19:31:17','active','','','');
/*!40000 ALTER TABLE `t_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_service_review`
--

DROP TABLE IF EXISTS `t_service_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_service_review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_id` bigint NOT NULL COMMENT '服务ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `user_avatar` varchar(255) DEFAULT '' COMMENT '用户头像',
  `rating` int NOT NULL COMMENT '评分1-5',
  `content` text COMMENT '评价内容',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'normal',
  PRIMARY KEY (`id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sr_service_ctime` (`service_id`,`create_time`),
  KEY `idx_review_service_status_time` (`service_id`,`status`,`create_time` DESC),
  KEY `idx_service_review_status_rating` (`service_id`,`status`,`rating` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='服务评价表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_service_review`
--

LOCK TABLES `t_service_review` WRITE;
/*!40000 ALTER TABLE `t_service_review` DISABLE KEYS */;
INSERT INTO `t_service_review` VALUES (1,1,'u002','王大厨','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',5,'李阿姨的服务非常专业，打扫得很干净！下次还找她。',12,'2026-05-20 15:51:18','normal'),(2,1,'u003','小林','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',4,'还不错，阿姨人很好，就是预约稍微等了久了一点。',5,'2026-05-20 15:51:18','normal'),(3,2,'u001','李阿姨','https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',5,'宠物洗护很细致，狗狗很享受，下次带猫也来！',8,'2026-05-20 15:51:18','normal'),(4,2,'u003','小林','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',5,'非常专业！给狗狗剪的造型很好看。',15,'2026-05-20 15:51:18','normal'),(5,1,'2056555272571645954','元','https://api.dicebear.com/7.x/avataaars/svg?seed=1668820870@qq.com',5,'服务非常专业，师傅准时到达，工作认真仔细，家里焕然一新！强烈推荐！',39,'2026-05-20 16:00:47','normal'),(6,1,'2056541779252436993','测试用户3','https://api.dicebear.com/7.x/avataaars/svg?seed=test789@example.com',4,'整体不错，效率很高，下次还会预约',9,'2026-05-19 16:00:47','normal'),(7,2,'2056555272571645954','元','https://api.dicebear.com/7.x/avataaars/svg?seed=1668820870@qq.com',5,'给家里的狗狗洗得很干净，还帮忙修剪了指甲，太贴心了！',15,'2026-05-18 16:00:47','normal');
/*!40000 ALTER TABLE `t_service_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_test_images`
--

DROP TABLE IF EXISTS `t_test_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_test_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `images` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_test_images`
--

LOCK TABLES `t_test_images` WRITE;
/*!40000 ALTER TABLE `t_test_images` DISABLE KEYS */;
INSERT INTO `t_test_images` VALUES (1,'[\"http://test.com/1.jpg\"]');
/*!40000 ALTER TABLE `t_test_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_user`
--

DROP TABLE IF EXISTS `t_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '头像URL',
  `tag` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '标签',
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '个人简介',
  `profile_visible` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'public' COMMENT '个人资料可见性:public/friends',
  `posts_visible` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'public' COMMENT '动态可见性:public/friends',
  `show_location` tinyint(1) DEFAULT '1' COMMENT '是否显示位置:1显示 0隐藏',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0' COMMENT '是否认证',
  `followers_count` int DEFAULT '0' COMMENT '粉丝数',
  `following_count` int DEFAULT '0' COMMENT '关注数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rating` double DEFAULT '5',
  `sold_count` int DEFAULT '0',
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `admin_role` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `push_enabled` tinyint(1) DEFAULT '1',
  `message_notify` tinyint(1) DEFAULT '1',
  `follow_notify` tinyint(1) DEFAULT '1',
  `like_notify` tinyint(1) DEFAULT '1',
  `comment_notify` tinyint(1) DEFAULT '1',
  `system_notify` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_name` (`name`),
  KEY `idx_user_created` (`created_at` DESC),
  KEY `idx_user_admin_role` (`admin_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_user`
--

LOCK TABLES `t_user` WRITE;
/*!40000 ALTER TABLE `t_user` DISABLE KEYS */;
INSERT INTO `t_user` VALUES ('2056541779252436993','测试用户3','test789@example.com','123456','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','新晋邻居','','public','public',1,NULL,NULL,0,0,0,'2026-05-19 09:05:43','2026-05-25 10:42:20',5,0,'','','normal','USER',1,1,1,1,1,0),('2056555272571645954','y','1668820870@qq.com','$2a$10$0/.OYYMIfdq3bxSYWsdUJO9WftFb33rlxQvP/baqxBlYQ5mTdQM36','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','士大夫','接口自动化验证','public','public',1,NULL,NULL,0,0,4,'2026-05-19 09:59:20','2026-06-05 14:02:54',5,0,'13800000000','杭州-滨江','normal','SUPER_ADMIN',1,1,1,1,1,0),('admin_readonly','test1','test1@example.com','$2a$10$uMPIaJ4NBxKlZZxhEfGEI./D3Is.qP5uhzUlo9WS2LdxPUHS98lj.','','admin','','public','public',1,NULL,NULL,1,0,0,'2026-05-30 22:13:50','2026-06-02 22:00:43',5,0,'','','normal','READONLY_ADMIN',1,1,1,1,1,0),('admin_test','test','test@example.com','test','','admin','','public','public',1,NULL,NULL,1,0,0,'2026-05-30 17:30:03','2026-06-02 21:51:00',5,0,'','','normal','ADMIN',1,1,1,1,1,0),('normal_user','normal','normal@example.com','normal','','user','','public','public',1,NULL,NULL,0,0,0,'2026-05-30 22:13:50','2026-05-30 22:13:50',5,0,'','','normal','USER',1,1,1,1,1,0),('u001','李阿姨','li_ayi@example.com','$2a$10$lLGj1jiWCDBmOMv/U/mHAuGHv3Eo/Uqi/7pb.R7eEqLyhCuBD/xP.','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','社区达人','','public','public',1,30.3167,120.35,0,3420,156,'2026-05-18 19:05:09','2026-06-05 13:15:33',4.8,156,'','','normal','USER',1,1,1,1,1,0),('u002','王大厨','wang_dachu@example.com','123456','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','美食达人','','public','public',1,NULL,NULL,1,1241,320,'2026-05-18 19:05:09','2026-06-05 13:15:33',4.5,89,'','','normal','USER',1,1,1,1,1,0),('u003','小林','photo_xiaolin@example.com','123456','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','摄影达人','','public','public',1,NULL,NULL,0,850,412,'2026-05-18 19:05:09','2026-06-05 13:15:33',5,0,'','','normal','USER',1,1,1,1,1,0),('u004','小红','xiaohong@example.com','123456','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','美食达人','','public','public',1,NULL,NULL,1,521,120,'2026-05-20 15:02:29','2026-06-05 13:15:33',5,0,'','','normal','USER',1,1,1,1,1,0),('u005','老张','laozhang@example.com','123456','/api/file/images/2026/05/25f2854c6a91624583b19c970097257c46.jpg','摄影爱好者','','public','public',1,NULL,NULL,0,231,89,'2026-05-20 15:02:29','2026-06-05 13:15:33',5,0,'','','normal','USER',1,1,1,1,1,0);
/*!40000 ALTER TABLE `t_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'neighborhood_db'
--

--
-- Dumping routines for database 'neighborhood_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 15:13:34
