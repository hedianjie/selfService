/*
Navicat MySQL Data Transfer

Source Server         : api_project
Source Server Version : 80013
Source Host           : localhost:3306
Source Database       : project

Target Server Type    : MYSQL
Target Server Version : 80013
File Encoding         : 65001

Date: 2021-01-13 16:18:06
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `attention`
-- ----------------------------
DROP TABLE IF EXISTS `attention`;
CREATE TABLE `attention` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '关联用户id',
  `user_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL COMMENT '关联作者id',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of attention
-- ----------------------------

-- ----------------------------
-- Table structure for `collect`
-- ----------------------------
DROP TABLE IF EXISTS `collect`;
CREATE TABLE `collect` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '关联用户id',
  `package_id` int(11) NOT NULL COMMENT '关联包id',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of collect
-- ----------------------------

-- ----------------------------
-- Table structure for `common`
-- ----------------------------
DROP TABLE IF EXISTS `common`;
CREATE TABLE `common` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL COMMENT '关联包id',
  `user_id` int(11) NOT NULL COMMENT '创建人',
  `parent_id` int(11) NOT NULL COMMENT '回复上级条目id',
  `like_num` int(11) DEFAULT '0' COMMENT '点赞数',
  `unlike_num` int(11) DEFAULT '0' COMMENT '反对数',
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '内容',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of common
-- ----------------------------

-- ----------------------------
-- Table structure for `message`
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '内容',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of message
-- ----------------------------
INSERT INTO `message` VALUES ('1', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B2, null, null);
INSERT INTO `message` VALUES ('2', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B232, null, null);
INSERT INTO `message` VALUES ('3', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B233, null, null);
INSERT INTO `message` VALUES ('4', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B2340D0A, null, null);
INSERT INTO `message` VALUES ('5', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B237, null, null);
INSERT INTO `message` VALUES ('6', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B237, null, null);
INSERT INTO `message` VALUES ('7', 0x363636736466616638733864667366383738E58F91E98081E588B0E58F91E98081E588B0E58F91E69292E68993E58F91E5A3ABE5A4A7E5A4AB383838383737, '2021-01-04 16:02:44', null);
INSERT INTO `message` VALUES ('8', 0xE8BF99E698AFE4B880E4B8AAE5AD97E7ACA6E4B8B23939, '2021-01-04 16:02:29', null);

-- ----------------------------
-- Table structure for `message_user`
-- ----------------------------
DROP TABLE IF EXISTS `message_user`;
CREATE TABLE `message_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '关联用户id',
  `message_id` int(11) NOT NULL COMMENT '关联消息id',
  `is_look` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否查看 1是 0否',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of message_user
-- ----------------------------

-- ----------------------------
-- Table structure for `package`
-- ----------------------------
DROP TABLE IF EXISTS `package`;
CREATE TABLE `package` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '标题',
  `desc` varchar(150) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '说明',
  `type_id` int(11) NOT NULL,
  `download_num` int(11) DEFAULT '0' COMMENT '下载次数',
  `like_num` int(11) DEFAULT '0' COMMENT '点赞次数',
  `collect_num` int(11) DEFAULT '0' COMMENT '收藏次数',
  `user_id` int(11) NOT NULL COMMENT '创建人',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of package
-- ----------------------------

-- ----------------------------
-- Table structure for `package_info`
-- ----------------------------
DROP TABLE IF EXISTS `package_info`;
CREATE TABLE `package_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL COMMENT '包上级id',
  `version` varchar(12) COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '版本',
  `package_directory_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '包目录地址',
  `package_download_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '包下载地址',
  `package_sample_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '' COMMENT '包示例地址',
  `package_readme_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT 'readme地址',
  `package_image_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '' COMMENT '图片地址',
  `directory_name` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '包名称',
  `package_size` double(16,2) NOT NULL DEFAULT '0.00' COMMENT '包大小',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of package_info
-- ----------------------------

-- ----------------------------
-- Table structure for `tag`
-- ----------------------------
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of tag
-- ----------------------------

-- ----------------------------
-- Table structure for `tag_package`
-- ----------------------------
DROP TABLE IF EXISTS `tag_package`;
CREATE TABLE `tag_package` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id` int(11) NOT NULL COMMENT '关联标签id',
  `package_id` int(11) NOT NULL COMMENT '关联包id',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of tag_package
-- ----------------------------

-- ----------------------------
-- Table structure for `type`
-- ----------------------------
DROP TABLE IF EXISTS `type`;
CREATE TABLE `type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=429496732 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of type
-- ----------------------------
INSERT INTO `type` VALUES ('429496731', '66', '2021-01-04 16:09:14', null);

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '名称',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '' COMMENT '头像',
  `desc` varchar(150) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '说明',
  `login_name` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '' COMMENT '账号',
  `pwd` varchar(16) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '密码',
  `is_enable` tinyint(1) unsigned zerofill NOT NULL DEFAULT '0' COMMENT '是否启用 1是 0否',
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `delete_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=293 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('290', 'xingaimingcheng', '', null, '', 'hedianjie', '0', '2021-01-12 08:33:10', '2021-01-12 09:46:11');
INSERT INTO `user` VALUES ('291', 'hedianjie2', '', null, '', '123321', '0', '2021-01-12 08:33:10', '2021-01-12 10:14:29');
INSERT INTO `user` VALUES ('292', '', '', null, '', '', '0', '2021-01-13 10:04:19', null);
