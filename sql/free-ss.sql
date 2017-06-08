/*
Navicat MySQL Data Transfer

Source Server         : 192.168.1.116_3306
Source Server Version : 50718
Source Host           : 192.168.1.116:3306
Source Database       : free-ss

Target Server Type    : MYSQL
Target Server Version : 50718
File Encoding         : 65001

Date: 2017-06-05 16:10:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- -- ----------------------------
-- -- Table structure for node
-- -- ----------------------------
DROP TABLE IF EXISTS `node`;
CREATE TABLE `node` (
  `node_id` int(13) NOT NULL,
  `node_type` int(11) NOT NULL DEFAULT '0',
  `host` varchar(255) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `encryption` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- -- -- ----------------------------
-- -- -- Table structure for user
-- -- -- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int(13) NOT NULL,
  `user_type` int(2) NOT NULL DEFAULT '1',
  `reg_time` int(15) DEFAULT NULL,
  `last_login_time` int(15) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


