<?php

/** @package  */
class pgcalSettings {
  /**
   * Holds the values to be used in the fields callbacks
   */
  private $options;

  /**
   * Start up
   */
  public function __construct() {
    add_action('admin_menu', array($this, 'pgcal_add_plugin_page'));
    add_action('admin_init', array($this, 'pgcal_page_init'));
  }

  /**
   * Add options page
   */
  public function pgcal_add_plugin_page() {
    add_options_page(
      esc_attr__('Settings Admin', 'pretty-google-calendar'),
      esc_attr__('Google Calendar API Settings', 'pretty-google-calendar'),
      'manage_options',
      'pgcal-setting-admin',
      array($this, 'pgcal_create_admin_page')
    );
  }

  public function pgcal_create_admin_page() {
    $this->options = get_option('pgcal_settings');
?>
    <div class="pgcal-settings-header">
      <h1><?php echo esc_html__('Google Calendar API Settings', 'pretty-google-calendar') ?></h1>
    </div>
    <form method="post" action="options.php">
      <?php
      // This prints out all hidden setting fields
      settings_fields('pgcal_option_group');
      do_settings_sections('pgcal-setting-admin');
      submit_button();
      ?>
    </form>
    </div>
<?php
  }

  /**
   * Register and add settings
   */
  public function pgcal_page_init() {
    register_setting(
      'pgcal_option_group', // Option group
      'pgcal_settings', // Option name
      array($this, 'pgcal_sanitize') // Sanitize
    );

    add_settings_section(
      'pgcal-main-settings',
      esc_attr__('Usage', 'pretty-google-calendar'),
      array($this, 'pgcal_pring_main_info'), // Callback
      'pgcal-setting-admin' // Page
    );

    add_settings_section(
      'pgcal-defaults-settings',
      esc_attr__('Default Shortcode Settings', 'pretty-google-calendar'),
      array($this, 'pgcal_print_defaults_info'), // Callback
      'pgcal-setting-admin' // Page
    );

    add_settings_field(
      'google_api',
      esc_attr__('Google API', 'pretty-google-calendar'),
      array($this, 'pgcal_gapi_callback'), // Callback
      'pgcal-setting-admin', // Page
      'pgcal-main-settings' // Section
    );

    // Default shortcode settings
    add_settings_field(
      'default_locale',
      esc_attr__('Default Locale', 'pretty-google-calendar'),
      array($this, 'pgcal_default_locale_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_list_type',
      esc_attr__('Default List Type', 'pretty-google-calendar'),
      array($this, 'pgcal_default_list_type_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_custom_list_button',
      esc_attr__('Default Custom List Button Label', 'pretty-google-calendar'),
      array($this, 'pgcal_default_custom_list_button_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_custom_days',
      esc_attr__('Default Custom Days', 'pretty-google-calendar'),
      array($this, 'pgcal_default_custom_days_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_views',
      esc_attr__('Default Views', 'pretty-google-calendar'),
      array($this, 'pgcal_default_views_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_initial_view',
      esc_attr__('Default Initial View', 'pretty-google-calendar'),
      array($this, 'pgcal_default_initial_view_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_enforce_listview_on_mobile',
      esc_attr__('Default Enforce List View on Mobile', 'pretty-google-calendar'),
      array($this, 'pgcal_default_enforce_listview_on_mobile_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_show_today_button',
      esc_attr__('Default Show Today Button', 'pretty-google-calendar'),
      array($this, 'pgcal_default_show_today_button_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_show_title',
      esc_attr__('Default Show Title', 'pretty-google-calendar'),
      array($this, 'pgcal_default_show_title_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_show_description',
      esc_attr__('Default Show Description', 'pretty-google-calendar'),
      array($this, 'pgcal_default_show_description_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_hide_meet_links',
      esc_attr__('Default Hide Meet Links', 'pretty-google-calendar'),
      array($this, 'pgcal_default_hide_meet_links_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_use_tooltip',
      esc_attr__('Default Use Tooltip', 'pretty-google-calendar'),
      array($this, 'pgcal_default_use_tooltip_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );

    add_settings_field(
      'default_no_link',
      esc_attr__('Default No Link', 'pretty-google-calendar'),
      array($this, 'pgcal_default_no_link_callback'),
      'pgcal-setting-admin',
      'pgcal-defaults-settings'
    );
  }

  /**
   * Sanitize each setting field as needed
   *
   * @param array $input Contains all settings fields as array keys
   */
  public function pgcal_sanitize($input) {
    $sanitized_input = array();
    
    if (isset($input['google_api']))
      $sanitized_input['google_api'] = sanitize_text_field($input['google_api']);

    // Default shortcode settings
    if (isset($input['default_locale']))
      $sanitized_input['default_locale'] = sanitize_text_field($input['default_locale']);

    if (isset($input['default_list_type']))
      $sanitized_input['default_list_type'] = sanitize_text_field($input['default_list_type']);

    if (isset($input['default_custom_list_button']))
      $sanitized_input['default_custom_list_button'] = sanitize_text_field($input['default_custom_list_button']);

    if (isset($input['default_custom_days']))
      $sanitized_input['default_custom_days'] = absint($input['default_custom_days']);

    if (isset($input['default_views']))
      $sanitized_input['default_views'] = sanitize_text_field($input['default_views']);

    if (isset($input['default_initial_view']))
      $sanitized_input['default_initial_view'] = sanitize_text_field($input['default_initial_view']);

    if (isset($input['default_enforce_listview_on_mobile']))
      $sanitized_input['default_enforce_listview_on_mobile'] = sanitize_text_field($input['default_enforce_listview_on_mobile']);

    if (isset($input['default_show_today_button']))
      $sanitized_input['default_show_today_button'] = sanitize_text_field($input['default_show_today_button']);

    if (isset($input['default_show_title']))
      $sanitized_input['default_show_title'] = sanitize_text_field($input['default_show_title']);

    if (isset($input['default_show_description']))
      $sanitized_input['default_show_description'] = sanitize_text_field($input['default_show_description']);

    if (isset($input['default_hide_meet_links']))
      $sanitized_input['default_hide_meet_links'] = sanitize_text_field($input['default_hide_meet_links']);

    if (isset($input['default_use_tooltip']))
      $sanitized_input['default_use_tooltip'] = sanitize_text_field($input['default_use_tooltip']);

    if (isset($input['default_no_link']))
      $sanitized_input['default_no_link'] = sanitize_text_field($input['default_no_link']);

    return $sanitized_input;
  }

  /**
   * Print the Section text
   */
  public function pgcal_pring_main_info() {
    printf(
      '<p>%s</p>',
      esc_html__('You must have your Google Calendar API setup to use this plugin. Please enter your key below:', 'pretty-google-calendar')
    );
  }

  /**
   * Print the defaults Section text
   */
  public function pgcal_print_defaults_info() {
    printf(
      '<p>%s</p>',
      esc_html__("Set default values for shortcode parameters. These will be used when the parameter is not specified in the shortcode.", "pretty-google-calendar")
    );
  }

  /**
   * Get the settings option array and print one of its values
   */
  public function pgcal_gapi_callback() {
    printf(
      '<input type="text" id="google_api" name="pgcal_settings[google_api]" value="%s" style="width: 600px;" />',
      isset($this->options['google_api']) ? esc_attr($this->options['google_api']) : ''
    );
  }

  public function pgcal_default_locale_callback() {
    $value = isset($this->options['default_locale']) ? esc_attr($this->options['default_locale']) : 'en';
    printf(
      '<input type="text" id="default_locale" name="pgcal_settings[default_locale]" value="%s" placeholder="en" />
      <p class="description">%s</p>',
      $value,
      esc_html__('Language locale code (e.g., en, es, fr, de)', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_list_type_callback() {
    $value = isset($this->options['default_list_type']) ? esc_attr($this->options['default_list_type']) : 'listCustom';
    $options = array(
      'listCustom' => 'Custom List',
      'listDay' => 'List Day',
      'listWeek' => 'List Week', 
      'listMonth' => 'List Month',
      'listYear' => 'List Year'
    );
    
    echo '<select id="default_list_type" name="pgcal_settings[default_list_type]">';
    foreach ($options as $key => $label) {
      printf(
        '<option value="%s" %s>%s</option>',
        esc_attr($key),
        selected($value, $key, false),
        esc_html($label)
      );
    }
    echo '</select>';
  }

  public function pgcal_default_custom_list_button_callback() {
    $value = isset($this->options['default_custom_list_button']) ? esc_attr($this->options['default_custom_list_button']) : 'list';
    printf(
      '<input type="text" id="default_custom_list_button" name="pgcal_settings[default_custom_list_button]" value="%s" placeholder="list" />
      <p class="description">%s</p>',
      $value,
      esc_html__('Label for the custom list button', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_custom_days_callback() {
    $value = isset($this->options['default_custom_days']) ? absint($this->options['default_custom_days']) : 28;
    printf(
      '<input type="number" id="default_custom_days" name="pgcal_settings[default_custom_days]" value="%d" min="1" max="365" />
      <p class="description">%s</p>',
      $value,
      esc_html__('Number of days to show in custom list view', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_views_callback() {
    $value = isset($this->options['default_views']) ? esc_attr($this->options['default_views']) : 'dayGridMonth, listCustom';
    printf(
      '<input type="text" id="default_views" name="pgcal_settings[default_views]" value="%s" placeholder="dayGridMonth, listCustom" style="width: 300px;" />
      <p class="description">%s</p>',
      $value,
      esc_html__('Comma-separated list of available views (e.g., dayGridMonth, listCustom, dayGridWeek)', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_initial_view_callback() {
    $value = isset($this->options['default_initial_view']) ? esc_attr($this->options['default_initial_view']) : 'dayGridMonth';
    $options = array(
      'dayGridMonth' => 'Month Grid',
      'dayGridWeek' => 'Week Grid',
      'dayGridDay' => 'Day Grid',
      'listCustom' => 'Custom List',
      'listDay' => 'List Day',
      'listWeek' => 'List Week',
      'listMonth' => 'List Month',
      'listYear' => 'List Year'
    );
    
    echo '<select id="default_initial_view" name="pgcal_settings[default_initial_view]">';
    foreach ($options as $key => $label) {
      printf(
        '<option value="%s" %s>%s</option>',
        esc_attr($key),
        selected($value, $key, false),
        esc_html($label)
      );
    }
    echo '</select>';
  }

  public function pgcal_default_enforce_listview_on_mobile_callback() {
    $value = isset($this->options['default_enforce_listview_on_mobile']) ? esc_attr($this->options['default_enforce_listview_on_mobile']) : 'true';
    printf(
      '<select id="default_enforce_listview_on_mobile" name="pgcal_settings[default_enforce_listview_on_mobile]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>
      <p class="description">%s</p>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar'),
      esc_html__('Switch to list view on mobile devices', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_show_today_button_callback() {
    $value = isset($this->options['default_show_today_button']) ? esc_attr($this->options['default_show_today_button']) : 'true';
    printf(
      '<select id="default_show_today_button" name="pgcal_settings[default_show_today_button]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_show_title_callback() {
    $value = isset($this->options['default_show_title']) ? esc_attr($this->options['default_show_title']) : 'true';
    printf(
      '<select id="default_show_title" name="pgcal_settings[default_show_title]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_show_description_callback() {
    $value = isset($this->options['default_show_description']) ? esc_attr($this->options['default_show_description']) : 'false';
    printf(
      '<select id="default_show_description" name="pgcal_settings[default_show_description]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>
      <p class="description">%s</p>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar'),
      esc_html__('Show event descriptions in list view', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_hide_meet_links_callback() {
    $value = isset($this->options['default_hide_meet_links']) ? esc_attr($this->options['default_hide_meet_links']) : 'true';
    printf(
      '<select id="default_hide_meet_links" name="pgcal_settings[default_hide_meet_links]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>
      <p class="description">%s</p>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar'),
      esc_html__('Hide Google Meet links from descriptions (they will still appear as buttons)', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_use_tooltip_callback() {
    $value = isset($this->options['default_use_tooltip']) ? esc_attr($this->options['default_use_tooltip']) : 'false';
    printf(
      '<select id="default_use_tooltip" name="pgcal_settings[default_use_tooltip]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>
      <p class="description">%s</p>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar'),
      esc_html__('Show event details in a tooltip when clicking on events', 'pretty-google-calendar')
    );
  }

  public function pgcal_default_no_link_callback() {
    $value = isset($this->options['default_no_link']) ? esc_attr($this->options['default_no_link']) : 'false';
    printf(
      '<select id="default_no_link" name="pgcal_settings[default_no_link]">
        <option value="true" %s>%s</option>
        <option value="false" %s>%s</option>
      </select>
      <p class="description">%s</p>',
      selected($value, 'true', false),
      esc_html__('True', 'pretty-google-calendar'),
      selected($value, 'false', false),
      esc_html__('False', 'pretty-google-calendar'),
      esc_html__('Disable links to calendar.google.com when clicking on events', 'pretty-google-calendar')
    );
  }

  // public function pgcal_tooltip_callback() {
  //   printf(
  //     '<input title="%s" type="checkbox" id="use_tooltip" name="pgcal_settings[use_tooltip]" value="yes" %s />',
  //     esc_html__("Use the popper/tooltip plugin to display event information.", "pretty-google-calendar"),
  //     isset($this->options['use_tooltip']) ? 'checked' : ''
  //   );
  // }

  // public function pgcal_no_link_callback() {
  //   printf(
  //     '<input title="%s" type="checkbox" id="no_link" name="pgcal_settings[no_link]" value="yes" %s />',
  //     esc_html__("Disable the link to the calendar.google.com event.", "pretty-google-calendar"),
  //     isset($this->options['no_link']) ? 'checked' : ''
  //   );
  // }
}
