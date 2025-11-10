// document.addEventListener("DOMContentLoaded", function () {

/**
 * Get global settings securely via Ajax
 *
 * @returns global settings
 */
async function pgcalFetchGlobals(ajaxurl) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", ajaxurl, true);
    xhr.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    var data = "action=pgcal_ajax_action";
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var response = JSON.parse(xhr.responseText);
        resolve(response);
      } else {
        reject("AJAX request failed with status " + xhr.status);
      }
    };
    xhr.send(data);
  });
}

async function pgcal_render_calendar(pgcalSettings, ajaxurl) {
  const globalSettings = await pgcalFetchGlobals(ajaxurl);

  // console.log(globalSettings["google_api"]); // DEBUG

  const currCal = `pgcalendar-${pgcalSettings["id_hash"]}`;
  const calendarEl = document.getElementById(currCal);
  calendarEl.innerHTML = "";
  let width = window.innerWidth;

  const views = pgcal_resolve_views(pgcalSettings);
  const cals = pgcal_resolve_cals(pgcalSettings);

  // console.table(cals); // DEBUG
  // console.table(pgcalSettings); // DEBUG
  // console.table(views); // DEBUG

  const toolbarLeft = pgcal_is_truthy(pgcalSettings["show_today_button"])
    ? "prev,next today"
    : "prev,next";
  const toolbarCenter = pgcal_is_truthy(pgcalSettings["show_title"])
    ? "title"
    : "";
  const toolbarRight = views.length > 1 ? views.all.join(",") : "";

  let selectedView = views.initial;

  const pgcalDefaults = {
    locale: pgcalSettings["locale"],
    googleCalendarApiKey: globalSettings["google_api"],

    eventSources: cals,

    views: {
      // Options apply to dayGridMonth, dayGridWeek, and dayGridDay views
      dayGrid: {
        eventTimeFormat: {
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        },
      },
      // Custom List View
      listCustom: {
        type: "list",
        duration: { days: parseInt(pgcalSettings["custom_days"]) },
        buttonText: pgcalSettings["custom_list_button"],
      },
    },

    // Day grid options
    eventDisplay: "block", // Adds border and bocks to events instead of bulleted list (default)
    height: "auto",
    fixedWeekCount: false, // True: 6 weeks, false: flex for month

    // List options
    listDayFormat: { weekday: "long", month: "long", day: "numeric" },

    initialView: views.initial,

    headerToolbar: {
      left: toolbarLeft,
      center: toolbarCenter,
      right: toolbarRight,
    },

    eventDidMount: function (info) {
      if (pgcalSettings["use_tooltip"] === "true") {
        pgcal_tippyRender(info, currCal);
      }
      
      // Find the event element first
      const eventEl = info.el;
      
      // Only add buttons in list view, not in grid/calendar view
      if (eventEl.closest('.fc-list-event')) {
        // Add description row if enabled
        if (pgcalSettings["show_description"] === "true") {
          pgcal_addDescriptionRow(info, eventEl, pgcalSettings);
        }
        
        // Extract data for all button types
        const meetLink = pgcal_extractMeetLink(info.event);
        const driveLinks = pgcal_extractDriveLinks(info.event);
        const eventUrl = info.event.url;
        
        if (meetLink || driveLinks.length > 0 || eventUrl) {
          const meetButton = pgcal_createMeetButton(meetLink);
          const docsButton = pgcal_createDocumentsButton(driveLinks);
          const eventButton = pgcal_createEventButton(eventUrl);
          
          // Create buttons HTML
          let buttonsHtml = '';
          if (docsButton) buttonsHtml += docsButton;
          if (meetButton) buttonsHtml += meetButton;
          if (eventButton) buttonsHtml += eventButton;
          
          // Create a new table row for the buttons
          const listEventRow = eventEl.closest('.fc-list-event');
          if (listEventRow && buttonsHtml) {
            // Check if buttons row already exists
            if (listEventRow.nextElementSibling && listEventRow.nextElementSibling.classList.contains('pgcal-buttons-row')) {
              return;
            }
            
            const buttonsRow = document.createElement('tr');
            buttonsRow.className = 'pgcal-buttons-row fc-list-event';
            
            const buttonsCell = document.createElement('td');
            buttonsCell.className = 'pgcal-buttons-cell';
            buttonsCell.colSpan = listEventRow.children.length;
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'pgcal-buttons-container';
            buttonsContainer.innerHTML = buttonsHtml;
            
            buttonsCell.appendChild(buttonsContainer);
            buttonsRow.appendChild(buttonsCell);
            
            // Insert the buttons row after description row if it exists, otherwise after event row
            let insertAfter = listEventRow;
            if (listEventRow.nextElementSibling && listEventRow.nextElementSibling.classList.contains('pgcal-description-row')) {
              insertAfter = listEventRow.nextElementSibling;
            }
            insertAfter.parentNode.insertBefore(buttonsRow, insertAfter.nextSibling);
          }
        }
      }
    },

    eventClick: function (info) {
      // Always prevent default link behavior to avoid interference with custom buttons
      // Users can still access the event via the "View Event" button
      if (
        pgcalSettings["use_tooltip"] === "true" ||
        pgcalSettings["no_link"] === "true" ||
        pgcal_extractMeetLink(info.event) ||
        pgcal_extractDriveLinks(info.event).length > 0 ||
        info.event.url
      ) {
        info.jsEvent.preventDefault(); // Prevent following link
      }
    },

    // Change view on window resize
    windowResize: function (view) {
      // Catch mobile chrome, which changes window size as nav bar appears
      // so only fire if width has changed.
      if (
        window.innerWidth !== width &&
        views.hasList &&
        views.wantsToEnforceListviewOnMobile
      ) {
        if (pgcal_is_mobile()) {
          calendar.changeView(views.listType);
        } else {
          calendar.changeView(selectedView);
        }
      }
    },
  };

  const pgcalOverrides = JSON.parse(pgcalSettings["fc_args"]);
  const pgCalArgs = pgcal_argmerge(pgcalDefaults, pgcalOverrides);

  // console.log(pgcalSettings["fc_args"]); // DEBUG
  // console.log(JSON.stringify(pgcalDefaults, null, 2)); // DEBUG
  // console.log(JSON.stringify(pgCalArgs, null, 2)); // DEBUG

  const calendar = new FullCalendar.Calendar(calendarEl, pgCalArgs);
  calendar.render();
}
