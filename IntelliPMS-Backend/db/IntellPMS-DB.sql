/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 10.4.11-MariaDB : Database - intellpms
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`intellpms` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `intellpms`;

/*Table structure for table `billings` */

DROP TABLE IF EXISTS `billings`;

CREATE TABLE `billings` (
  `billingId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `billedFor` varchar(50) NOT NULL,
  `billedForId` int(20) unsigned NOT NULL,
  `hotelId` int(30) DEFAULT NULL,
  `multipleBillingsId` varchar(50) DEFAULT NULL,
  `guestId` varchar(30) NOT NULL,
  `paymentDate` datetime NOT NULL,
  `paymentType` varchar(100) NOT NULL,
  `accountId` varchar(50) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `amount` int(50) DEFAULT NULL,
  `managerId` varchar(50) DEFAULT NULL,
  `referenceNumber` varchar(100) DEFAULT NULL,
  `checkOutId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`billingId`),
  KEY `guestid` (`guestId`),
  KEY `fk_billing_room` (`billedForId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4;

/*Data for the table `billings` */

insert  into `billings`(`billingId`,`billedFor`,`billedForId`,`hotelId`,`multipleBillingsId`,`guestId`,`paymentDate`,`paymentType`,`accountId`,`transactionId`,`amount`,`managerId`,`referenceNumber`,`checkOutId`) values 
(1,'checkin',1,1,'96377422','1','2020-05-29 12:18:00','card','1','83927272',27000,NULL,NULL,'CO67268487'),
(2,'checkin',1,1,'96377422','1','2020-05-29 12:18:00','cash',NULL,NULL,15000,NULL,NULL,'CO67268487'),
(3,'reservation',1,1,NULL,'2','2020-05-29 13:25:00','transfer','1','940484736',12000,NULL,NULL,NULL),
(4,'reservation',2,1,NULL,'2','2020-05-29 14:47:00','transfer','2','8039338393',23000,NULL,NULL,NULL),
(5,'checkin',3,1,NULL,'2','2020-06-01 09:29:00','card','1','89303337AS',45000,NULL,NULL,'CO77102709'),
(6,'checkin',4,1,'31883029','MCG992341','2020-06-01 18:20:00','card','1','DT72280012',10000,NULL,NULL,'CO74848847'),
(7,'checkin',4,1,'31883029','MCG992341','2020-06-01 18:20:00','cash',NULL,NULL,10000,NULL,NULL,'CO74848847'),
(9,'balance during checkout',3,1,NULL,'2','2020-06-01 18:30:00','card','Select a Bank',NULL,NULL,NULL,NULL,'CO77102709'),
(10,'checkin',5,1,'92884765','1','2020-06-01 18:31:00','card','1','21003930',30000,NULL,NULL,'CO05522775'),
(11,'checkin',5,1,'92884765','1','2020-06-01 18:31:00','cash',NULL,NULL,95000,NULL,NULL,'CO05522775'),
(12,'checkin',6,1,'96180017','3','2020-06-01 18:36:00','transfer','2','3002R3893',21000,NULL,NULL,'CO97802125'),
(13,'checkin',6,1,'96180017','3','2020-06-01 18:36:00','cash',NULL,NULL,1500,NULL,NULL,'CO97802125'),
(14,'checkin',7,1,'21137455','5','2020-06-01 18:42:00','card','1','9003837100',28000,NULL,NULL,'CO42752123'),
(15,'checkin',7,1,'21137455','5','2020-06-01 18:42:00','cash',NULL,NULL,11000,NULL,NULL,'CO42752123'),
(16,'balance during checkout',7,1,NULL,'5','2020-06-01 18:52:00','card','1','9301102928',40000,NULL,NULL,'CO42752123'),
(17,'balance during checkout',6,1,NULL,'3','2020-06-01 18:58:00','transfer','1','9839300128',2000,NULL,NULL,'CO97802125'),
(18,'reservation',3,1,'36017962','4','2020-06-02 00:24:00','transfer','1','998012920ER',3000,NULL,NULL,'CO34939815'),
(19,'reservation',3,1,'36017962','4','2020-06-02 00:24:00','cash',NULL,NULL,15000,NULL,NULL,'CO34939815'),
(20,'reservation checkin',8,1,NULL,'4','2020-06-02 00:29:00','transfer','2','8039338393AT',30000,NULL,NULL,NULL),
(21,'reservation',4,1,NULL,'3','2020-06-04 00:23:00','cash',NULL,NULL,30000,NULL,NULL,'CO65071075'),
(22,'extra payment',8,1,NULL,'4','2020-06-05 16:39:00','card','1','33637300',12000,NULL,NULL,'CO34939815'),
(23,'extra payment',8,1,NULL,'4','2020-06-05 16:39:00','cash',NULL,NULL,34000,NULL,NULL,'CO34939815'),
(24,'extra payment',8,1,NULL,'4','2020-06-05 16:52:00','cash',NULL,NULL,3000,NULL,NULL,'CO34939815'),
(25,'reservation',5,1,NULL,'1','2020-06-08 11:28:00','card','1','9003837100',3000,NULL,NULL,NULL),
(26,'checkin',9,1,NULL,'MCG289408','2020-06-08 12:25:00','cash',NULL,NULL,40000,NULL,NULL,NULL),
(27,'reservation checkin',10,1,NULL,'3','2020-06-08 17:46:00','card','1','83927272',30000,NULL,NULL,NULL),
(28,'balance during checkout',10,1,NULL,'3','2020-06-08 18:08:00','card','1','83927272',9000,NULL,NULL,'CO99851581'),
(29,'reservation checkin',11,1,NULL,'3','2020-06-08 18:10:00','card','1','83927272WRT',27000,NULL,NULL,NULL),
(30,'reservation checkin',12,1,NULL,'3','2020-06-08 18:10:00','cash',NULL,NULL,40000,NULL,NULL,NULL),
(31,'balance during checkout',8,1,'84372587','4','2020-06-10 16:18:00','card','1','83927272',70000,NULL,NULL,'CO34939815'),
(32,'balance during checkout',8,1,'84372587','4','2020-06-10 16:18:00','cash',NULL,NULL,100,NULL,NULL,'CO34939815'),
(33,'checkin',13,1,NULL,'8','2020-06-10 16:22:00','transfer','2','90393837363',25000,NULL,NULL,'CO64942887'),
(34,'balance during checkout',13,1,NULL,'8','2020-06-15 15:51:00','card','1','177282900',50000,NULL,NULL,'CO64942887'),
(35,'balance during checkout',12,1,NULL,'1','2020-06-16 20:11:00','card','1','9003837100',300120,NULL,NULL,'CO65071075'),
(36,'checkin',14,1,NULL,'5','2020-06-16 20:12:00','managerCredit',NULL,NULL,30000,'XAW31986','12839AR',NULL),
(37,'checkin',15,1,'63251030','7','2020-06-17 11:22:00','cash',NULL,NULL,60000,NULL,NULL,NULL),
(38,'checkin',15,1,'63251030','7','2020-06-17 11:22:00','managerCredit',NULL,NULL,17003,'XAW31986','33711WR78',NULL);

/*Table structure for table `buildings` */

DROP TABLE IF EXISTS `buildings`;

CREATE TABLE `buildings` (
  `buildingId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) NOT NULL,
  `buildingName` varchar(100) NOT NULL,
  `numOfRooms` int(20) NOT NULL,
  `startingRoom` int(20) NOT NULL,
  `endingRoom` int(20) NOT NULL,
  PRIMARY KEY (`buildingId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `buildings` */

insert  into `buildings`(`buildingId`,`hotelId`,`buildingName`,`numOfRooms`,`startingRoom`,`endingRoom`) values 
(1,1,'Gallant Paths',9,1,9),
(2,1,'Hiding Routes',11,10,21);

/*Table structure for table `changed_rooms` */

DROP TABLE IF EXISTS `changed_rooms`;

CREATE TABLE `changed_rooms` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `checkInId` int(20) NOT NULL,
  `oldRoomId` int(20) NOT NULL,
  `oldRoomStayDays` int(20) NOT NULL,
  `newRoomId` int(20) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `guestId` varchar(30) NOT NULL,
  `changedDateTime` datetime NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `changed_rooms` */

insert  into `changed_rooms`(`sn`,`checkInId`,`oldRoomId`,`oldRoomStayDays`,`newRoomId`,`createdBy`,`guestId`,`changedDateTime`,`reason`) values 
(2,8,1,1,3,'XAW31986','4','2020-06-03 22:21:00','Setting for an apartment');

/*Table structure for table `checkedin_rooms` */

DROP TABLE IF EXISTS `checkedin_rooms`;

CREATE TABLE `checkedin_rooms` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `checkInId` int(20) NOT NULL,
  `roomId` int(20) NOT NULL,
  `roomNumber` int(20) NOT NULL,
  `statuss` varchar(20) NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;

/*Data for the table `checkedin_rooms` */

insert  into `checkedin_rooms`(`sn`,`checkInId`,`roomId`,`roomNumber`,`statuss`) values 
(6,15,13,20,'checkedOut'),
(7,16,1,12,'checkedOut'),
(8,17,14,15,'checkedOut'),
(10,19,2,14,'active'),
(11,20,18,19,'active'),
(12,21,16,10,'active'),
(13,22,10,70,'active');

/*Table structure for table `checkin_out` */

DROP TABLE IF EXISTS `checkin_out`;

CREATE TABLE `checkin_out` (
  `checkInId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` varchar(20) NOT NULL,
  `roomId` int(20) DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `checkInDate` datetime NOT NULL,
  `checkOutDate` datetime NOT NULL,
  `actualCheckOutDate` datetime DEFAULT NULL,
  `numOfGuests` int(20) NOT NULL,
  `billingId` varchar(50) DEFAULT NULL,
  `reservationId` int(20) DEFAULT NULL,
  `statuss` varchar(30) DEFAULT NULL,
  `extended` varchar(30) DEFAULT NULL,
  `changedRoom` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`checkInId`),
  KEY `fk_guests_checkin` (`guestId`),
  KEY `fk_billings_checkin` (`billingId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;

/*Data for the table `checkin_out` */

insert  into `checkin_out`(`checkInId`,`guestId`,`roomId`,`createdBy`,`checkInDate`,`checkOutDate`,`actualCheckOutDate`,`numOfGuests`,`billingId`,`reservationId`,`statuss`,`extended`,`changedRoom`) values 
(3,'2',2,'XAW31986','2020-05-30 09:25:00','2020-06-05 13:00:00','2020-06-01 18:30:00',1,'5',NULL,'checkedOut',NULL,NULL),
(5,'4',3,'XAW31986','2020-06-01 18:30:00','2020-06-04 13:00:00','2020-06-01 18:40:00',1,'92884765',NULL,'checkedOut',NULL,NULL),
(8,'4',3,'XAW31986','2020-06-02 07:29:00','2020-06-11 01:00:00','2020-06-10 16:18:00',1,'20',3,'checkedOut','true',NULL),
(9,'MCG289408',1,'XAW31986','2020-06-08 12:22:00','2020-06-12 13:00:00',NULL,3,'26',NULL,'active',NULL,NULL),
(10,'3',5,'XAW31986','2020-06-08 17:46:00','2020-06-12 12:00:00','2020-06-08 18:08:00',1,'27',4,'checkedOut',NULL,NULL),
(11,'3',5,'XAW31986','2020-06-08 18:10:00','2020-06-12 12:00:00',NULL,1,'29',4,'active',NULL,NULL),
(12,'1',6,'XAW31986','2020-06-08 18:10:00','2020-06-12 12:00:00','2020-06-16 20:11:00',1,'30',4,'checkedOut',NULL,NULL),
(13,'8',3,'XAW31986','2020-06-10 16:19:00','2020-06-12 13:00:00','2020-06-15 15:51:00',1,'33',NULL,'checkedOut',NULL,NULL),
(14,'5',3,'XAW31986','2020-06-16 20:11:00','2020-06-18 13:00:00',NULL,1,'36',NULL,'active',NULL,NULL),
(15,'7',6,'XAW31986','2020-06-17 11:21:00','2020-06-18 13:00:00',NULL,1,'63251030',NULL,'active',NULL,NULL);

/*Table structure for table `checkout` */

DROP TABLE IF EXISTS `checkout`;

CREATE TABLE `checkout` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `checkOutId` varchar(20) NOT NULL,
  `checkInId` int(20) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `checkOutDateTime` datetime DEFAULT NULL,
  `balanceInfo` varchar(50) NOT NULL,
  `amountDuringCheckout` int(50) DEFAULT NULL,
  PRIMARY KEY (`sn`,`checkOutId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

/*Data for the table `checkout` */

insert  into `checkout`(`sn`,`checkOutId`,`checkInId`,`createdBy`,`checkOutDateTime`,`balanceInfo`,`amountDuringCheckout`) values 
(1,'CO67268487',1,'XAW31986','2020-05-29 15:09:00','keep',39700),
(2,'CO77102709',3,'XAW31986','2020-06-01 18:30:00','make payment',-43200),
(3,'CO74848847',4,'XAW31986','2020-06-01 18:30:00','keep',20000),
(4,'CO05522775',5,'XAW31986','2020-06-01 18:40:00','keep',125000),
(5,'CO42752123',7,'XAW31986','2020-06-01 18:52:00','make payment',-35000),
(6,'CO97802125',6,'XAW31986','2020-06-01 18:58:00','make payment',-1500),
(7,'CO99851581',10,'XAW31986','2020-06-08 18:08:00','make payment',-8500),
(8,'CO34939815',8,'XAW31986','2020-06-10 16:18:00','make payment',-70100),
(9,'CO64942887',13,'XAW31986','2020-06-15 15:51:00','make payment',-47000),
(10,'CO65071075',12,'XAW31986','2020-06-16 20:11:00','make payment',-300120);

/*Table structure for table `clean_room` */

DROP TABLE IF EXISTS `clean_room`;

CREATE TABLE `clean_room` (
  `cleanRoomId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int(20) NOT NULL,
  `createdBy` varchar(30) DEFAULT NULL,
  `createdDateTime` datetime DEFAULT NULL,
  `statuss` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`cleanRoomId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `clean_room` */

/*Table structure for table `customer_service` */

DROP TABLE IF EXISTS `customer_service`;

CREATE TABLE `customer_service` (
  `requestId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` int(20) unsigned NOT NULL,
  `userId` int(20) unsigned NOT NULL,
  `requestType` varchar(200) NOT NULL,
  `orderDateTime` datetime NOT NULL,
  `status` varchar(100) NOT NULL,
  `amount` int(100) NOT NULL,
  PRIMARY KEY (`requestId`),
  KEY `fk_user_service` (`userId`),
  KEY `fk_guest_service` (`guestId`),
  CONSTRAINT `fk_guest_service` FOREIGN KEY (`guestId`) REFERENCES `guests` (`guestId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_service` FOREIGN KEY (`userId`) REFERENCES `employees` (`sn`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `customer_service` */

/*Table structure for table `dropoff_key` */

DROP TABLE IF EXISTS `dropoff_key`;

CREATE TABLE `dropoff_key` (
  `dropOffKeyId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int(20) NOT NULL,
  `dropOffDateTime` datetime NOT NULL,
  `dropOffNote` varchar(200) NOT NULL,
  `pickupKeyDateTime` datetime DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `pickedUpBy` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`dropOffKeyId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

/*Data for the table `dropoff_key` */

insert  into `dropoff_key`(`dropOffKeyId`,`roomId`,`dropOffDateTime`,`dropOffNote`,`pickupKeyDateTime`,`createdBy`,`pickedUpBy`) values 
(1,2,'2020-06-02 23:06:24','Welcome to my hotel','2020-06-03 11:54:00','XAW31986','XAW31986'),
(2,2,'2020-06-03 11:54:00','Just for strol','2020-06-03 11:55:00','XAW31986','XAW31986'),
(3,2,'2020-06-03 11:56:00','Hello\n','2020-06-03 11:57:00','XAW31986','XAW31986'),
(4,2,'2020-06-03 12:03:00','Sit down here','2020-06-03 12:03:00','XAW31986','XAW31986'),
(5,2,'2020-06-03 12:08:00','Sitting down around','2020-06-03 12:08:00','XAW31986','XAW31986'),
(6,2,'2020-06-03 12:09:00','Sitting in the house','2020-06-03 12:10:00','XAW31986','XAW31986'),
(7,1,'2020-06-15 11:32:00','Going for an event',NULL,'XAW31986',NULL);

/*Table structure for table `employees` */

DROP TABLE IF EXISTS `employees`;

CREATE TABLE `employees` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(50) NOT NULL,
  `employeeRole` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `otherName` varchar(100) DEFAULT NULL,
  `emailAddress` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `picture` varchar(300) NOT NULL,
  `numOfHotels` int(20) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `statuss` varchar(50) NOT NULL,
  `operateRegister` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`sn`,`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `employees` */

insert  into `employees`(`sn`,`employeeId`,`employeeRole`,`firstName`,`lastName`,`otherName`,`emailAddress`,`password`,`phoneNumber`,`address`,`picture`,`numOfHotels`,`createdBy`,`statuss`,`operateRegister`) values 
(1,'ZHG57202','admin','Admin','Ontrac',NULL,'admin@ontrac.com','$2b$10$DCeqWTgX.1XtdkT72xoBye3yKWb1sfKRSf5wspql/u47OjgfTZCUS','111222333','Hillside','http://localhost:3000/images/employees/ontrac-admin-1590664580268.jpg',1,'VMX33868','enabled',NULL),
(2,'XAW31986','manager','Manager','Ontrac','null','manager@ontrac.com','$2b$10$z6XQEoHQODosHUuedwk8keuVn.3oBO13f1lOIa6p3hO9WphHE18jO','09021345100','Manager House','http://localhost:3000/images/employees/ontrac-manager-1590673800451.png',1,'ZHG57202','enabled','true'),
(3,'MSK98306','waiter','Paul','Malema','null','j@col.com',NULL,'1234567','Now Building','http://localhost:3000/images/employees/malema-paul-1590761144886.jpg',1,'XAW31986','enabled',NULL);

/*Table structure for table `employees_hotels` */

DROP TABLE IF EXISTS `employees_hotels`;

CREATE TABLE `employees_hotels` (
  `sn` int(30) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(30) NOT NULL,
  `employeeId` varchar(30) NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `employees_hotels` */

insert  into `employees_hotels`(`sn`,`hotelId`,`employeeId`) values 
(1,0,'ZHG57202'),
(2,1,'XAW31986'),
(3,1,'MSK98306');

/*Table structure for table `extend_stay` */

DROP TABLE IF EXISTS `extend_stay`;

CREATE TABLE `extend_stay` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `checkInId` int(20) NOT NULL,
  `guestId` varchar(30) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `extensionDateTime` datetime DEFAULT NULL,
  `extensionOption` varchar(50) NOT NULL,
  `extensionLength` varchar(50) NOT NULL,
  `rate` varchar(50) DEFAULT NULL,
  `cost` int(50) DEFAULT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `extend_stay` */

insert  into `extend_stay`(`sn`,`checkInId`,`guestId`,`createdBy`,`extensionDateTime`,`extensionOption`,`extensionLength`,`rate`,`cost`) values 
(1,8,'4','XAW31986',NULL,'hour','5','30',3600),
(2,8,'4','XAW31986',NULL,'day','3',NULL,NULL);

/*Table structure for table `guests` */

DROP TABLE IF EXISTS `guests`;

CREATE TABLE `guests` (
  `guestId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestTitle` varchar(40) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `otherName` varchar(100) DEFAULT NULL,
  `address` varchar(300) NOT NULL,
  `phoneNumber` varchar(30) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `gender` varchar(50) NOT NULL,
  PRIMARY KEY (`guestId`),
  KEY `guestid` (`guestId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

/*Data for the table `guests` */

insert  into `guests`(`guestId`,`guestTitle`,`firstName`,`lastName`,`otherName`,`address`,`phoneNumber`,`email`,`country`,`gender`) values 
(1,'Mr','Rental','Cole','Dasibi','Best Can Park','09031631002','paul@coolest.com','Nigeria','male'),
(2,'Mrs','Debby','Mala','H','Hideouts','09031912600','Grunsmill@cool.go','Morocco','female'),
(3,'Mrs','Hala','Loma','K','Loma','09021301121','paula@wind.gp','Nigeria','female'),
(4,'Mr','Fire','Liquid','H','Lounge arena','09041330012','liquidFire@gmail.com','Montenegro','male'),
(5,'Mrs','Kabom','Pilisar','A','Maundy day','06099201102','bullish@retal.kabom','Nigeria','female'),
(6,'Mrs','Cubana','LastMa','K','Hello Park','06033425262','oishcool@hmail.com','Nigeria','female'),
(7,'Miss','pullest','Laskni','Mikk','Gresta','09011228494','hashtag@gmail.com','Nigeria','female'),
(8,'Mr','John','Oshalusi','J','19 Malabo Street, Banex, Wuse 2,','09011223345','oshalusijohn@gmail.com','Nigeria','male');

/*Table structure for table `guests_credit` */

DROP TABLE IF EXISTS `guests_credit`;

CREATE TABLE `guests_credit` (
  `creditId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` int(20) NOT NULL,
  `checkOutId` varchar(50) NOT NULL,
  `amount` int(50) NOT NULL,
  `insertedDateTime` datetime NOT NULL,
  `statuss` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`creditId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `guests_credit` */

insert  into `guests_credit`(`creditId`,`guestId`,`checkOutId`,`amount`,`insertedDateTime`,`statuss`) values 
(1,1,'CO67268487',39700,'2020-05-29 15:09:00','unused'),
(2,5,'CO74848847',20000,'2020-06-01 18:30:00','unused'),
(3,1,'CO05522775',125000,'2020-06-01 18:40:00','unused');

/*Table structure for table `guests_credit_usage` */

DROP TABLE IF EXISTS `guests_credit_usage`;

CREATE TABLE `guests_credit_usage` (
  `sn` int(30) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` int(30) NOT NULL,
  `creditId` int(30) NOT NULL,
  `currentAmount` int(30) NOT NULL,
  `amountDeducted` int(30) NOT NULL,
  `reasonForDeduction` varchar(100) NOT NULL,
  `employeeId` int(30) NOT NULL,
  `amountLeft` int(30) NOT NULL,
  `deductionDateTime` datetime NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `guests_credit_usage` */

/*Table structure for table `hotel_account_details` */

DROP TABLE IF EXISTS `hotel_account_details`;

CREATE TABLE `hotel_account_details` (
  `bankAccountId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) NOT NULL,
  `bankName` varchar(50) NOT NULL,
  `accountNumber` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`bankAccountId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hotel_account_details` */

insert  into `hotel_account_details`(`bankAccountId`,`hotelId`,`bankName`,`accountNumber`) values 
(1,1,'Dynamic Standard Bank','2010092831'),
(2,1,'Union Bank of Nigeria','4003931002'),
(3,2,'United Bank for Africa','109330012');

/*Table structure for table `hotel_pos_details` */

DROP TABLE IF EXISTS `hotel_pos_details`;

CREATE TABLE `hotel_pos_details` (
  `posSn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `posId` varchar(50) NOT NULL,
  PRIMARY KEY (`posSn`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hotel_pos_details` */

insert  into `hotel_pos_details`(`posSn`,`hotelId`,`bankName`,`posId`) values 
(1,1,'Sterling Bank','2RT73831001'),
(2,2,'Polaris Bank','340019202'),
(3,2,'First City Monument Bank','8002102923');

/*Table structure for table `hotel_roomtype` */

DROP TABLE IF EXISTS `hotel_roomtype`;

CREATE TABLE `hotel_roomtype` (
  `roomTypeId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) NOT NULL,
  `roomTypeName` varchar(50) NOT NULL,
  `quantity` int(20) NOT NULL,
  `basePrice` int(20) NOT NULL,
  `minimumPrice` int(20) NOT NULL,
  `icon` varchar(60) NOT NULL,
  `shortDescription` text DEFAULT NULL,
  PRIMARY KEY (`roomTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hotel_roomtype` */

insert  into `hotel_roomtype`(`roomTypeId`,`hotelId`,`roomTypeName`,`quantity`,`basePrice`,`minimumPrice`,`icon`,`shortDescription`) values 
(1,1,'furnished',9,35000,32000,'icon-handbag','Group of rooms completely furnished'),
(2,1,'High-Class',5,40000,38250,'icon-diamond','Rooms for people of high social class'),
(3,1,'Basic',17,11000,10000,'icon-map','Basic rooms for people with small budget');

/*Table structure for table `hotel_services` */

DROP TABLE IF EXISTS `hotel_services`;

CREATE TABLE `hotel_services` (
  `serviceId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) unsigned NOT NULL,
  `serviceType` varchar(50) NOT NULL,
  `serviceName` varchar(100) NOT NULL,
  `serviceCost` int(50) NOT NULL,
  PRIMARY KEY (`serviceId`),
  KEY `fk_hotel_services` (`hotelId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hotel_services` */

insert  into `hotel_services`(`serviceId`,`hotelId`,`serviceType`,`serviceName`,`serviceCost`) values 
(1,1,'housekeeping','Buscuit',100),
(2,1,'laundry','Shirts',1500),
(3,1,'laundry','Shoe',1150);

/*Table structure for table `hotels` */

DROP TABLE IF EXISTS `hotels`;

CREATE TABLE `hotels` (
  `hotelId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelName` varchar(150) NOT NULL,
  `numOfRooms` int(50) NOT NULL,
  `address` varchar(300) NOT NULL,
  `location` varchar(300) NOT NULL,
  `picture` varchar(300) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  PRIMARY KEY (`hotelId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hotels` */

insert  into `hotels`(`hotelId`,`hotelName`,`numOfRooms`,`address`,`location`,`picture`,`createdBy`) values 
(1,'Residency Hotel',30,'People\'s park, off Kabo','963 Drive, off Prospek','http://localhost:3000/images/hotels/residency-hotel-1590671522924.jpg','ZHG57202'),
(2,'Salling Rope',40,'Malign','Kaduna, Nigeria','http://localhost:3000/images/hotels/salling-rope-1590674744052.jpg','XAW31986');

/*Table structure for table `house_keeping` */

DROP TABLE IF EXISTS `house_keeping`;

CREATE TABLE `house_keeping` (
  `houseKeepingId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` int(20) NOT NULL,
  `roomId` int(20) NOT NULL,
  `employeeId` int(20) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `createdDateTime` datetime DEFAULT NULL,
  `endDateTime` datetime DEFAULT NULL,
  `markUnavailable` varchar(50) DEFAULT NULL,
  `statuss` varchar(50) NOT NULL,
  PRIMARY KEY (`houseKeepingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `house_keeping` */

/*Table structure for table `housekeeping` */

DROP TABLE IF EXISTS `housekeeping`;

CREATE TABLE `housekeeping` (
  `houseKeepingId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` varchar(20) NOT NULL,
  `checkInId` int(20) NOT NULL,
  `roomId` int(20) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `processingBy` varchar(30) DEFAULT NULL,
  `completedBy` varchar(30) DEFAULT NULL,
  `createdDateTime` datetime DEFAULT NULL,
  `endDateTime` datetime DEFAULT NULL,
  `amount` int(30) DEFAULT NULL,
  `statuss` varchar(50) NOT NULL,
  `paymentStatus` varchar(30) NOT NULL,
  `checkOutId` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`houseKeepingId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

/*Data for the table `housekeeping` */

insert  into `housekeeping`(`houseKeepingId`,`guestId`,`checkInId`,`roomId`,`createdBy`,`processingBy`,`completedBy`,`createdDateTime`,`endDateTime`,`amount`,`statuss`,`paymentStatus`,`checkOutId`) values 
(1,'MCG289408',2,4,'XAW31986','XAW31986','XAW31986','2020-05-29 15:01:00','2020-05-29 15:01:00',700,'completed','paid',NULL),
(3,'4',8,3,'XAW31986','XAW31986','XAW31986','2020-06-08 10:37:00','2020-06-08 10:37:00',300,'completed','paid','CO34939815'),
(4,'5',8,3,'XAW31986','XAW31986',NULL,'2020-06-08 11:23:00',NULL,300,'processing','paid',NULL),
(5,'3',11,5,'XAW31986','XAW31986','XAW31986','2020-06-22 10:53:00','2020-06-22 10:56:00',300,'completed','unpaid',NULL);

/*Table structure for table `housekeeping_items` */

DROP TABLE IF EXISTS `housekeeping_items`;

CREATE TABLE `housekeeping_items` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `housekeepingId` int(20) NOT NULL,
  `checkInId` int(20) DEFAULT NULL,
  `item` varchar(50) DEFAULT NULL,
  `quantity` int(30) DEFAULT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

/*Data for the table `housekeeping_items` */

insert  into `housekeeping_items`(`sn`,`housekeepingId`,`checkInId`,`item`,`quantity`) values 
(1,1,2,'1',2),
(2,1,2,'1',5),
(3,2,8,'1',2),
(4,3,8,'1',3),
(5,4,8,'1',3),
(6,5,11,'1',3);

/*Table structure for table `issues_comments` */

DROP TABLE IF EXISTS `issues_comments`;

CREATE TABLE `issues_comments` (
  `issueCommentId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` varchar(20) NOT NULL,
  `checkInId` int(20) DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `processingBy` varchar(30) DEFAULT NULL,
  `completedBy` varchar(30) DEFAULT NULL,
  `type` varchar(40) NOT NULL,
  `note` text NOT NULL,
  `createdDateTime` datetime NOT NULL,
  `resolvedDateTime` datetime DEFAULT NULL,
  `statuss` varchar(50) NOT NULL,
  PRIMARY KEY (`issueCommentId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

/*Data for the table `issues_comments` */

insert  into `issues_comments`(`issueCommentId`,`guestId`,`checkInId`,`createdBy`,`processingBy`,`completedBy`,`type`,`note`,`createdDateTime`,`resolvedDateTime`,`statuss`) values 
(1,'1',1,'XAW31986',NULL,NULL,'issue','New Issue','2020-05-29 15:08:00','2020-05-29 15:09:00','resolved');

/*Table structure for table `laundry_items` */

DROP TABLE IF EXISTS `laundry_items`;

CREATE TABLE `laundry_items` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `laundryId` int(20) NOT NULL,
  `checkInId` int(20) NOT NULL,
  `serviceId` int(50) NOT NULL,
  `quantity` int(30) NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `laundry_items` */

insert  into `laundry_items`(`sn`,`laundryId`,`checkInId`,`serviceId`,`quantity`) values 
(1,1,1,3,2),
(2,2,3,2,2);

/*Table structure for table `laundry_services` */

DROP TABLE IF EXISTS `laundry_services`;

CREATE TABLE `laundry_services` (
  `laundryId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` varchar(30) NOT NULL,
  `checkInId` int(20) DEFAULT NULL,
  `roomId` int(20) DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `processingBy` varchar(30) DEFAULT NULL,
  `completedBy` varchar(30) DEFAULT NULL,
  `createdDateTime` datetime DEFAULT NULL,
  `dueDateTime` datetime NOT NULL,
  `completedDateTime` datetime DEFAULT NULL,
  `statuss` varchar(50) NOT NULL,
  `amount` int(50) NOT NULL,
  `paymentStatus` varchar(30) NOT NULL,
  `checkOutId` varbinary(30) DEFAULT NULL,
  PRIMARY KEY (`laundryId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `laundry_services` */

insert  into `laundry_services`(`laundryId`,`guestId`,`checkInId`,`roomId`,`createdBy`,`processingBy`,`completedBy`,`createdDateTime`,`dueDateTime`,`completedDateTime`,`statuss`,`amount`,`paymentStatus`,`checkOutId`) values 
(1,'1',1,1,'XAW31986','XAW31986','XAW31986','2020-05-29 14:58:00','2020-06-02 02:00:00','2020-05-29 14:59:00','completed',2300,'paid','CO67268487'),
(2,'2',3,2,'XAW31986','XAW31986','XAW31986','2020-06-01 09:58:00','2020-06-04 10:00:00','2020-06-01 09:59:00','completed',3000,'paid','CO77102709');

/*Table structure for table `login_activities` */

DROP TABLE IF EXISTS `login_activities`;

CREATE TABLE `login_activities` (
  `loginId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(30) NOT NULL,
  `registerId` int(20) DEFAULT NULL,
  `loginDateTime` datetime NOT NULL,
  `logoutDateTime` datetime DEFAULT NULL,
  `loginStatus` varchar(30) NOT NULL,
  PRIMARY KEY (`loginId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

/*Data for the table `login_activities` */

insert  into `login_activities`(`loginId`,`employeeId`,`registerId`,`loginDateTime`,`logoutDateTime`,`loginStatus`) values 
(3,'XAW31986',9,'2020-06-10 13:43:00','2020-06-22 11:06:00','loggedOut'),
(4,'XAW31986',10,'2020-06-10 17:16:00','2020-06-22 11:06:00','loggedOut'),
(5,'XAW31986',NULL,'2020-06-10 18:03:00','2020-06-22 11:06:00','loggedOut'),
(6,'XAW31986',NULL,'2020-06-10 18:05:00','2020-06-22 11:06:00','loggedOut'),
(7,'XAW31986',NULL,'2020-06-11 10:48:00','2020-06-22 11:06:00','loggedOut'),
(8,'XAW31986',11,'2020-06-11 10:48:00','2020-06-22 11:06:00','loggedOut'),
(9,'XAW31986',NULL,'2020-06-22 10:52:00','2020-06-22 11:06:00','loggedOut'),
(10,'XAW31986',NULL,'2020-06-22 10:57:00','2020-06-22 11:06:00','loggedOut'),
(11,'ZHG57202',NULL,'2020-06-22 10:58:00',NULL,'loggedIn'),
(12,'XAW31986',NULL,'2020-06-22 11:06:00','2020-06-22 11:06:00','loggedOut');

/*Table structure for table `lost_key` */

DROP TABLE IF EXISTS `lost_key`;

CREATE TABLE `lost_key` (
  `lostKeyId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int(20) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `lostKeyDateTime` datetime NOT NULL,
  `lostKeyNote` varchar(200) NOT NULL,
  `changedBy` varchar(30) DEFAULT NULL,
  `changeKeyDateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`lostKeyId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `lost_key` */

insert  into `lost_key`(`lostKeyId`,`roomId`,`createdBy`,`lostKeyDateTime`,`lostKeyNote`,`changedBy`,`changeKeyDateTime`) values 
(1,2,'XAW31986','2020-06-03 12:49:00','Lost it',NULL,NULL),
(2,6,'XAW31986','2020-06-09 11:09:00','Dancing','XAW31986','2020-06-10 18:36:00'),
(3,6,'XAW31986','2020-06-10 18:37:00','Lost',NULL,NULL);

/*Table structure for table `multiple_staying_guest_table` */

DROP TABLE IF EXISTS `multiple_staying_guest_table`;

CREATE TABLE `multiple_staying_guest_table` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `checkInId` int(20) NOT NULL,
  `tempGuestId` varchar(30) NOT NULL,
  `guestType` varchar(30) NOT NULL,
  `guestId` int(20) NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

/*Data for the table `multiple_staying_guest_table` */

insert  into `multiple_staying_guest_table`(`sn`,`checkInId`,`tempGuestId`,`guestType`,`guestId`) values 
(1,2,'MCG863289','2',2),
(2,2,'MCG863289','2',3),
(3,4,'MCG992341','2',4),
(4,4,'MCG992341','3',5),
(5,9,'MCG289408','3',3),
(6,9,'MCG289408','2',6),
(7,9,'MCG289408','2',7);

/*Table structure for table `payment_details` */

DROP TABLE IF EXISTS `payment_details`;

CREATE TABLE `payment_details` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `billingId` int(20) unsigned NOT NULL,
  `bank` varchar(100) DEFAULT NULL,
  `posNumber` varchar(100) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `accountNumber` varchar(100) DEFAULT NULL,
  `amount` int(30) DEFAULT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `payment_details` */

/*Table structure for table `refunds` */

DROP TABLE IF EXISTS `refunds`;

CREATE TABLE `refunds` (
  `sn` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` int(20) NOT NULL,
  `checkOutId` varchar(20) NOT NULL,
  `bankName` varchar(50) NOT NULL,
  `accountNumber` int(20) NOT NULL,
  `statuss` varchar(20) NOT NULL,
  `createdDateTime` datetime NOT NULL,
  PRIMARY KEY (`sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `refunds` */

/*Table structure for table `register` */

DROP TABLE IF EXISTS `register`;

CREATE TABLE `register` (
  `registerId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(30) NOT NULL,
  `hotelId` int(30) NOT NULL,
  `cashOnHand` int(20) NOT NULL,
  `dateTimeOpened` datetime NOT NULL,
  `dateTimeClosed` datetime DEFAULT NULL,
  `totalAmountOnClose` int(20) DEFAULT NULL,
  `statuss` varchar(30) DEFAULT NULL,
  `closingSummary` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`registerId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

/*Data for the table `register` */

insert  into `register`(`registerId`,`employeeId`,`hotelId`,`cashOnHand`,`dateTimeOpened`,`dateTimeClosed`,`totalAmountOnClose`,`statuss`,`closingSummary`) values 
(3,'XAW31986',1,6000,'2020-06-01 14:02:00','2020-06-04 15:27:00',147500,'closed','Hello'),
(4,'XAW31986',1,21000,'2020-06-02 16:20:00','2020-06-02 22:31:00',21000,'closed','Through with all I have to do'),
(5,'XAW31986',1,1000,'2020-06-02 22:35:00','2020-06-02 22:36:00',1000,'closed','Good to go'),
(6,'XAW31986',1,11000,'2020-06-02 22:48:00','2020-06-05 17:09:50',NULL,'closed',NULL),
(7,'XAW31986',1,30000,'2020-06-05 11:47:00','2020-06-05 17:10:00',NULL,'closed',NULL),
(8,'XAW31986',1,7000,'2020-06-08 11:26:00','2020-06-09 12:46:00',156000,'closed','Packing Out'),
(9,'XAW31986',1,20000,'2020-06-10 16:18:00','2020-06-10 16:50:00',115100,'closed','Good bye'),
(10,'XAW31986',1,7000,'2020-06-10 17:17:00','2020-06-10 17:23:00',7000,'closed','Pickings these and thats'),
(11,'XAW31986',1,10000,'2020-06-15 15:51:00','2020-06-17 11:01:00',390120,'closed','Register closed'),
(12,'XAW31986',1,19500,'2020-06-15 11:16:00',NULL,NULL,'active',NULL);

/*Table structure for table `register_activities` */

DROP TABLE IF EXISTS `register_activities`;

CREATE TABLE `register_activities` (
  `activityId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `registerId` int(20) NOT NULL,
  `billingId` int(20) NOT NULL,
  PRIMARY KEY (`activityId`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4;

/*Data for the table `register_activities` */

insert  into `register_activities`(`activityId`,`registerId`,`billingId`) values 
(6,3,12),
(7,3,13),
(8,3,14),
(9,3,15),
(10,3,17),
(11,3,18),
(12,3,19),
(13,3,20),
(14,3,21),
(15,7,22),
(16,7,23),
(17,7,24),
(18,8,25),
(19,8,26),
(20,8,27),
(21,8,28),
(22,8,29),
(23,8,30),
(24,9,31),
(25,9,32),
(26,9,33),
(27,11,34),
(28,11,35),
(29,11,36),
(30,12,37),
(31,12,38);

/*Table structure for table `reservations` */

DROP TABLE IF EXISTS `reservations`;

CREATE TABLE `reservations` (
  `reservationId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) NOT NULL,
  `payingGuestId` int(20) unsigned NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `numOfRooms` int(20) NOT NULL,
  `adultsPerRoom` int(20) NOT NULL,
  `childrenPerRoom` int(20) DEFAULT NULL,
  `roomTypeId` int(20) DEFAULT NULL,
  `billingId` varchar(20) DEFAULT NULL,
  `reservationStartDateTime` datetime DEFAULT NULL,
  `reservationEndDateTime` datetime DEFAULT NULL,
  `checkInDate` datetime DEFAULT NULL,
  `totalPayment` int(30) DEFAULT NULL,
  `statuss` varchar(30) DEFAULT NULL,
  `cancelledBy` varchar(30) DEFAULT NULL,
  `cancelledDateTime` datetime DEFAULT NULL,
  `cancellationNote` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`reservationId`),
  KEY `fk_reservation_guest` (`payingGuestId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

/*Data for the table `reservations` */

insert  into `reservations`(`reservationId`,`hotelId`,`payingGuestId`,`createdBy`,`numOfRooms`,`adultsPerRoom`,`childrenPerRoom`,`roomTypeId`,`billingId`,`reservationStartDateTime`,`reservationEndDateTime`,`checkInDate`,`totalPayment`,`statuss`,`cancelledBy`,`cancelledDateTime`,`cancellationNote`) values 
(1,1,2,'XAW31986',1,1,0,1,'3','2020-06-03 13:00:00','2020-05-10 13:00:00',NULL,12000,'cancelled','XAW31986','2020-05-29 14:36:00','No rooms'),
(2,1,2,'XAW31986',1,1,1,3,'4','2020-06-01 02:00:00','2020-06-05 13:00:00','2020-05-29 14:50:00',9700,'checkedIn',NULL,NULL,NULL),
(3,1,4,'XAW31986',1,1,0,2,'36017962','2020-06-04 15:00:00','2020-06-08 13:00:00','2020-06-02 00:29:00',-26000,'checkedIn',NULL,NULL,NULL),
(4,1,3,'XAW31986',2,1,0,1,'21','2020-06-07 10:00:00','2020-06-12 13:00:00','2020-06-08 18:10:00',7820,'checkedIn',NULL,NULL,NULL),
(5,1,1,'XAW31986',2,1,0,3,'25','2020-06-10 09:00:00','2020-06-14 13:00:00',NULL,3000,'active',NULL,NULL,NULL);

/*Table structure for table `room_attributes` */

DROP TABLE IF EXISTS `room_attributes`;

CREATE TABLE `room_attributes` (
  `attributeId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int(20) unsigned NOT NULL,
  `attribute` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`attributeId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

/*Data for the table `room_attributes` */

insert  into `room_attributes`(`attributeId`,`roomId`,`attribute`) values 
(4,2,'Brews'),
(5,2,'Machine'),
(6,1,'Bread'),
(7,1,'Marks'),
(8,1,'Latern'),
(9,3,'Dancing'),
(10,3,'Bullies'),
(11,3,'Lamp'),
(12,4,'Bed'),
(13,4,'Matches'),
(14,5,'Bridge'),
(15,5,'Cat'),
(16,5,'Mattress'),
(17,5,'Elevators'),
(18,6,'Bed'),
(19,6,'Bacres'),
(20,6,'Leather'),
(21,6,'Pan'),
(22,7,'Biking'),
(23,7,'Bulling'),
(24,7,'Freeging');

/*Table structure for table `room_services` */

DROP TABLE IF EXISTS `room_services`;

CREATE TABLE `room_services` (
  `roomServiceId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `guestId` varchar(30) NOT NULL,
  `checkInId` int(20) DEFAULT NULL,
  `roomId` int(20) NOT NULL,
  `employeeId` int(20) DEFAULT NULL,
  `invoiceId` varchar(30) DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `processingBy` varchar(30) DEFAULT NULL,
  `completedBy` varchar(30) DEFAULT NULL,
  `createdDateTime` datetime NOT NULL,
  `completedDateTime` datetime DEFAULT NULL,
  `numOfItems` int(20) DEFAULT NULL,
  `amount` int(30) NOT NULL,
  `paymentStatus` varchar(50) DEFAULT NULL,
  `statuss` varchar(30) NOT NULL,
  `waiterId` varchar(30) DEFAULT NULL,
  `checkOutId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`roomServiceId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `room_services` */

insert  into `room_services`(`roomServiceId`,`guestId`,`checkInId`,`roomId`,`employeeId`,`invoiceId`,`createdBy`,`processingBy`,`completedBy`,`createdDateTime`,`completedDateTime`,`numOfItems`,`amount`,`paymentStatus`,`statuss`,`waiterId`,`checkOutId`) values 
(1,'2',3,2,NULL,'100931PQ','XAW31986','XAW31986','XAW31986','2020-06-02 14:00:00','2020-06-01 10:07:00',6,1200,'paid','completed','MSK98306','CO77102709'),
(2,'4',8,2,NULL,'1829SD','XAW31986',NULL,NULL,'2020-06-05 10:09:00',NULL,5,1000,'paid','unprocessed','MSK98306',NULL),
(3,'MCG289408',9,1,NULL,'1200AD','XAW31986','XAW31986','XAW31986','2020-06-21 10:00:00','2020-06-19 17:38:00',4,6000,'paid','completed','MSK98306',NULL);

/*Table structure for table `rooms` */

DROP TABLE IF EXISTS `rooms`;

CREATE TABLE `rooms` (
  `roomId` int(20) unsigned NOT NULL AUTO_INCREMENT,
  `hotelId` int(20) unsigned NOT NULL,
  `roomNumber` int(20) unsigned NOT NULL,
  `roomTypeId` int(30) NOT NULL,
  `buildingId` int(40) DEFAULT NULL,
  `createdBy` varchar(30) NOT NULL,
  `adjustedPrice` int(50) NOT NULL,
  `roomStatus` varchar(40) NOT NULL,
  `currentOccupant` varchar(30) DEFAULT NULL,
  `picture` varchar(200) NOT NULL,
  `lostKey` varchar(50) DEFAULT NULL,
  `currentLostKeyId` int(20) DEFAULT NULL,
  `dropOffKey` varchar(50) DEFAULT NULL,
  `currentDropOffKeyId` varchar(20) DEFAULT NULL,
  `notForSale` varchar(20) DEFAULT NULL,
  `cleanRoom` varchar(20) DEFAULT NULL,
  `cleanRoomId` int(20) DEFAULT NULL,
  PRIMARY KEY (`roomId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

/*Data for the table `rooms` */

insert  into `rooms`(`roomId`,`hotelId`,`roomNumber`,`roomTypeId`,`buildingId`,`createdBy`,`adjustedPrice`,`roomStatus`,`currentOccupant`,`picture`,`lostKey`,`currentLostKeyId`,`dropOffKey`,`currentDropOffKeyId`,`notForSale`,`cleanRoom`,`cleanRoomId`) values 
(1,1,1,1,1,'ZHG57202',37000,'occupied','MCG289408','http://localhost:3000/images/rooms/furnished1-1590684987334.jpg',NULL,NULL,'true','7',NULL,NULL,NULL),
(2,1,3,2,2,'ZHG57202',42000,'available','0','http://localhost:3000/images/rooms/23-1590689039490.jpg','false',NULL,'false','0','false',NULL,NULL),
(3,1,10,3,2,'XAW31986',12000,'occupied','5','http://localhost:3000/images/rooms/310-1590759508896.jpg',NULL,NULL,'false','',NULL,NULL,NULL),
(5,1,4,1,1,'XAW31986',38500,'occupied','3','http://localhost:3000/images/rooms/14-1591204599599.jpg',NULL,NULL,'false',NULL,NULL,NULL,NULL),
(6,1,5,1,1,'XAW31986',36680,'occupied','7','http://localhost:3000/images/rooms/15-1591632340175.jpg','true',3,'false',NULL,NULL,NULL,NULL),
(7,1,9,3,2,'XAW31986',13000,'available','0','http://localhost:3000/images/rooms/39-1592392083978.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
