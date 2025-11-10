<?php
/*
Plugin Name: Google Calendar Integration for Venture Upward
Plugin URI: https://github.com/Jarimichu/pretty-google-calendar
Description: A Google Calendar API Integration modified for use with Venture Upward Live Classes.
Version: 2.1.5
Author: Jarimichu
Text Domain: pretty-google-calendar
*/


define('PGCAL_VER', "2.1.5");
define('PGCAL_DIR', plugin_dir_path(__FILE__));
define('PGCAL_TEMPLATE_DIR', PGCAL_DIR . 'templates/');
define('PGCAL_URL', plugin_dir_url(__FILE__));

load_plugin_textdomain('pretty-google-calendar', false, PGCAL_DIR . 'languages');

require(PGCAL_DIR . 'util/utils.php');
require(PGCAL_DIR . 'admin/admin.php');
require(PGCAL_DIR . 'init/shortcode.php');
require(PGCAL_DIR . 'init/init.php');

// require(PGCAL_DIR . 'dev/console-log.php'); // DEBUG