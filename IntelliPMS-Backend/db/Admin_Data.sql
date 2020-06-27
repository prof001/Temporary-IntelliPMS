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

/*Data for the table `employees` */

insert  into `employees`(`
sn`,`employeeId`,`employeeRole`,`firstName`,`lastName`,`otherName`,`emailAddress
`,`password`,`phoneNumber`,`address`,`picture`,`numOfHotels`,`createdBy`,`statuss`,`operateRegister`) values
(1,'ZHG57202','admin','Admin','Ontrac',NULL,'admin@ontrac.com','$2b$10$DCeqWTgX.1XtdkT72xoBye3yKWb1sfKRSf5wspql/u47OjgfTZCUS','111222333','Hillside','http://localhost:3000/images/employees/ontrac-admin-1590664580268.jpg',1,'VMX33868','enabled',NULL);

/*Data for the table `employees_hotels` */

insert  into `employees_hotels`(`
sn`,`hotelId
`,`employeeId`) values
(1,0,'ZHG57202');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
