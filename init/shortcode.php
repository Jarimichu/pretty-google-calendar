<?php

function pgcal_shortcode($atts) {

  $default = array();
  $globalSettings = get_option('pgcal_settings', $default);

  $args = shortcode_atts(
    array(
      'gcal'                       => "",
      'locale'                     => isset($globalSettings['default_locale']) ? $globalSettings['default_locale'] : "en",
      'list_type'                  => isset($globalSettings['default_list_type']) ? $globalSettings['default_list_type'] : "listCustom",
      'custom_list_button'         => isset($globalSettings['default_custom_list_button']) ? $globalSettings['default_custom_list_button'] : "list",
      'custom_days'                => isset($globalSettings['default_custom_days']) ? $globalSettings['default_custom_days'] : "28",
      'views'                      => isset($globalSettings['default_views']) ? $globalSettings['default_views'] : "dayGridMonth, listCustom",
      'initial_view'               => isset($globalSettings['default_initial_view']) ? $globalSettings['default_initial_view'] : "dayGridMonth",
      'enforce_listview_on_mobile' => isset($globalSettings['default_enforce_listview_on_mobile']) ? $globalSettings['default_enforce_listview_on_mobile'] : "true",
      'show_today_button'          => isset($globalSettings['default_show_today_button']) ? $globalSettings['default_show_today_button'] : "true",
      'show_title'                 => isset($globalSettings['default_show_title']) ? $globalSettings['default_show_title'] : "true",
      'show_description'           => isset($globalSettings['default_show_description']) ? $globalSettings['default_show_description'] : "false",
      'hide_meet_links'            => isset($globalSettings['default_hide_meet_links']) ? $globalSettings['default_hide_meet_links'] : "true",
      'id_hash'                    => bin2hex(random_bytes(5)),
      'use_tooltip'                => isset($globalSettings['default_use_tooltip']) ? $globalSettings['default_use_tooltip'] : (isset($globalSettings['use_tooltip']) ? "false" : "true"),
      'no_link'                    => isset($globalSettings['default_no_link']) ? $globalSettings['default_no_link'] : (isset($globalSettings['no_link']) ? "false" : "true"),
      'fc_args'                    => '{}',
    ),
    $atts
  );

  // Add the attributes from the shortcode OVERRIDING the stored settings
  $pgcalSettings = $args;
  $pgcalSettings["id_hash"] = preg_replace('/[\W]/', '', $pgcalSettings["id_hash"]);

  wp_enqueue_script('fullcalendar');
  wp_enqueue_script('fc_googlecalendar');

  if ($pgcalSettings['locale'] !== "en") {
    wp_enqueue_script('fc_locales');
  }

  if ($pgcalSettings['use_tooltip'] === "true") {
    wp_enqueue_script('popper');
    wp_enqueue_script('tippy');
    wp_enqueue_script('pgcal_tippy');

    wp_enqueue_style('pgcal_tippy');
    wp_enqueue_style('tippy_light');
  }

  // Load Local Scripts
  wp_enqueue_script('pgcal_helpers');
  wp_enqueue_script('pgcal_loader');

  // Load Styles
  wp_enqueue_style('fullcalendar');
  wp_enqueue_style('pgcal_css');

  $script = "
    document.addEventListener('DOMContentLoaded', function() {
      function pgcal_inlineScript(settings) {        
        var ajaxurl = '" . admin_url('admin-ajax.php') . "';
        pgcal_render_calendar(settings, ajaxurl);
      }

      pgcal_inlineScript(" . json_encode($pgcalSettings) . ");
    });
  ";
  wp_add_inline_script('pgcal_loader', $script);

  $shortcode_output = "
  <div id='pgcalendar-" . $pgcalSettings["id_hash"] . "' class='pgcal-container'>" . esc_html__("loading...", "pretty-google-calendar") . "</div>
  ";

  return $shortcode_output;
}
