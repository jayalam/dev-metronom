CREATE SCHEMA IF NOT EXISTS `metronom-dev`;

CREATE TABLE IF NOT EXISTS `metronom-dev`.`url_shorter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `long_url` VARCHAR(45) NOT NULL,
  `short_url_id` VARCHAR(45) NOT NULL,
  `access_counter` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `long_url_UNIQUE` (`long_url` ASC),
  UNIQUE INDEX `short_url_id_UNIQUE` (`short_url_id` ASC));

CREATE TABLE IF NOT EXISTS `metronom-dev`.`url_short_timestamp` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `short_url_id` INT NOT NULL,
  `timestamp` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));
