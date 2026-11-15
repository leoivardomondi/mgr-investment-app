<?php
/**
 * OPTIONAL: cPanel MySQL Database Configuration for MGR Investment Group
 *
 * By default, `api.php` works automatically with ZERO configuration using
 * cPanel's built-in SQLite database (`mgr_data/mgr_database.sqlite`).
 *
 * If you prefer to use a cPanel MySQL database instead:
 * 1. Create a database & user in cPanel -> MySQL® Database Wizard
 * 2. Fill in DB_NAME, DB_USER, and DB_PASS below.
 *    (Leave DB_NAME empty '' to use the automatic zero-config SQLite database).
 */

define('DB_HOST', 'localhost');
define('DB_NAME', ''); // e.g. 'cpaneluser_mgr_db'
define('DB_USER', ''); // e.g. 'cpaneluser_mgr_admin'
define('DB_PASS', ''); // Your MySQL user password

