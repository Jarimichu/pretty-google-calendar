const { __, _x, _n, sprintf } = wp.i18n;

/**
 * Splits comma separated list of calendars into array, then loops through and
 * builds eventSources object.
 *
 * @param {array} settings Settings received from shortcode parameters
 * @returns object
 */
function pgcal_resolve_cals(settings) {
  let calArgs = [];
  const cals = settings["gcal"].split(",");

  for (var i = 0; i < cals.length; i++) {
    calArgs.push({
      googleCalendarId: cals[i],
      className: `pgcal-event-${i}`,
      // Request additional fields from Google Calendar API to get Google Meet links
      extraParams: {
        // Request hangoutLink and conferenceData fields
        // Note: This will only work if the calendar has proper permissions
      }
    });
  }
  return calArgs;
}

/**
 * Computes all variables related to views
 *
 * @param {array} settings Settings received from the shortcode parameters
 * @returns object
 */
const pgcal_resolve_views = (settings) => {
  // const gridViews = [
  //   "dayGridDay",
  //   "dayGridWeek",
  //   "dayGridMonth",
  //   "dayGridYear",
  // ];
  // const listViews = [
  //   "listDay",
  //   "listWeek",
  //   "listMonth",
  //   "listYear",
  //   "listCustom",
  // ];
  // const otherViews = ["multiMonthYear", "timeGridWeek", "timeGridDay"];

  // const allowedViews = [...listViews, ...gridViews, ...otherViews];

  const wantsToEnforceListviewOnMobile = pgcal_is_truthy(
    settings["enforce_listview_on_mobile"]
  );

  // let initialView = "dayGridMonth";

  // if (allowedViews.includes(settings["initial_view"])) {
  //   initialView = settings["initial_view"];
  // }

  initialView = settings["initial_view"];

  const viewsArray = pgcal_csv_to_array(settings["views"]);
  const viewsIncludesList = pgcal_get_item_by_fuzzy_value(viewsArray, "list");
  const listType = pgcal_get_item_by_fuzzy_value(
    viewsArray,
    settings["list_type"]
  );

  if (pgcal_is_mobile() && wantsToEnforceListviewOnMobile) {
    initialView = listType;
  }

  const views = {
    all: viewsArray,
    length: viewsArray.length,
    hasList: !!viewsIncludesList,
    listType,
    initial: initialView,
    wantsToEnforceListviewOnMobile,
  };

  return views;
};

/**
 * Tests if the given array has the value in any part of each item
 *
 * @param {string} csv Array to be tested
 * @returns array
 */
const pgcal_csv_to_array = (csv) => csv.split(",").map((view) => view.trim());

/**
 * Tests if the given array has the value in any part of each item
 *
 * @param {array} array Array to be tested
 * @param {string} value String to be checked
 * @returns boolean
 */
const pgcal_get_item_by_fuzzy_value = (array, value) =>
  array.find((item) => item.toLowerCase().includes(value.toLowerCase()));

/**
 * Tests if a value is truthy
 *
 * @param {string} value String to be tested
 * @returns boolean
 */
function pgcal_is_truthy(value) {
  const lowercaseValue =
    typeof value === "string" ? value.toLowerCase() : value;
  return ["true", "1", true, 1].includes(lowercaseValue);
}

/**
 * Tests whether the window size is equal to or less than 768... an arbitrary
 * standard for what is mobile...
 *
 * @returns boolean
 */
function pgcal_is_mobile(width = 768) {
  return window.innerWidth <= width;
}

/**
 * Remove Google Meet links from text
 *
 * @param {string} text Text containing potential Meet links
 * @returns {string} Text with Meet links removed
 */
function pgcal_removeMeetLinks(text) {
  if (!text) return '';
  
  // Google Meet URL patterns (with or without protocol)
  const meetRegex = /(?:https?:\/\/)?meet\.google\.com\/[a-z0-9-]+/gi;
  
  // Also remove Meet links that might be wrapped in HTML tags
  const meetLinkInATagRegex = /<a[^>]*href="(?:https?:\/\/)?meet\.google\.com\/[a-z0-9-]+"[^>]*>.*?<\/a>/gi;
  
  // Remove Meet links (both plain URLs and those wrapped in anchor tags)
  let cleanedText = text.replace(meetLinkInATagRegex, '').replace(meetRegex, '');
  
  // Remove empty HTML tags that might be left behind
  cleanedText = cleanedText.replace(/<([^>]+)>\s*<\/\1>/g, '');
  
  // Remove multiple consecutive line breaks and replace with single line break
  cleanedText = cleanedText.replace(/(\r?\n\s*){2,}/g, '\n');
  
  // Remove leading and trailing whitespace from each line
  cleanedText = cleanedText.replace(/^[ \t]+|[ \t]+$/gm, '');
  
  // Remove empty lines
  cleanedText = cleanedText.replace(/^\s*[\r\n]/gm, '');
  
  // Clean up any remaining multiple spaces
  cleanedText = cleanedText.replace(/[ \t]+/g, ' ');
  
  // Remove empty paragraphs or divs
  cleanedText = cleanedText.replace(/<(p|div)\s*>\s*<\/(p|div)>/gi, '');
  
  // Trim the entire string
  return cleanedText.trim();
}

/**
 * Detect URLs and encase them in <a>. Ignores existing <a> tags.
 *
 * @param {*} text
 * @returns
 */
function pgcal_urlify(text) {
  const urlRegex = /<a[\s>].*?<\/a>|https?:\/\/[^\s]+[?!.]*\/?\b/g;
  if (text) {
    return text.replace(urlRegex, function (m) {
      if (m.startsWith("<a")) {
        // If it's an existing <a> tag, return it as is
        return m;
      } else {
        // Extract the URL part from the matched string
        const urlMatch = m.match(/https?:\/\/[^\s]+[?!.]*\/?\b/);

        if (urlMatch) {
          const url = urlMatch[0];
          const punctuation = url.match(/[?!.]*$/);

          if (punctuation) {
            const cleanedURL = url.replace(/[?!.]*$/, "");
            const linkText = cleanedURL;
            return (
              '<a target="_blank" href="' +
              cleanedURL +
              '">' +
              linkText +
              "</a>" +
              punctuation[0]
            );
          } else {
            // If no punctuation found, treat the whole URL as the link text
            return '<a target="_blank" href="' + url + '">' + url + "</a>";
          }
        }
        // If no URL found, return the original match
        return m;
      }
    });
  }
  return "";
}

/**
 * Find breaks, and add <br />
 *
 * @param {string} text
 * @returns
 */
function pgcal_breakify(text) {
  if (text) {
    return text.replace(/(?:\r\n|\r|\n)/g, "<br />");
  }
  return "";
}

/**
 * Create map button
 *
 * @param {string} text Text of map link
 * @returns Formatted map button
 */
function pgcal_mapify(text) {
  const buttonLabel = __("Map", "pretty-google-calendar");
  let footer = "";
  if (text) {
    footer += `<br /><a class="button" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURI(
      text
    )}">${buttonLabel}</a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp`;
  }
  return footer;
}

/**
 * Converts url to a formatted <a href=... link
 *
 * @param {string} url
 * @returns formatted HTML url
 */
function pgcal_addToGoogle(url) {
  const buttonLabel = __("Add to Google Calendar", "pretty-google-calendar");
  if (url) {
    return `<a class="button" href="${url}" target="_blank">${buttonLabel}</a>`;
  }
}

/**
 * Extract Google Meet link from event description or location
 *
 * @param {object} event Event object from FullCalendar
 * @returns {string|null} Google Meet URL if found, null otherwise
 */
function pgcal_extractMeetLink(event) {
  // Google Meet URL patterns (with or without protocol)
  const meetRegex = /(?:https?:\/\/)?meet\.google\.com\/[a-z0-9-]+/gi;
  
  // Check if there's a hangoutLink property (Google Calendar API)
  if (event.extendedProps && event.extendedProps.hangoutLink) {
    return event.extendedProps.hangoutLink;
  }
  
  // Check for hangoutLink directly on the event (some API responses)
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  
  // Check for conferenceData (newer Google Calendar API)
  if (event.extendedProps && event.extendedProps.conferenceData && 
      event.extendedProps.conferenceData.entryPoints) {
    for (const entryPoint of event.extendedProps.conferenceData.entryPoints) {
      if (entryPoint.entryPointType === 'video' && entryPoint.uri) {
        return entryPoint.uri;
      }
    }
  }
  
  // Check the description for Meet links
  if (event.extendedProps && event.extendedProps.description) {
    const descriptionMatch = event.extendedProps.description.match(meetRegex);
    if (descriptionMatch) {
      const meetUrl = descriptionMatch[0];
      return meetUrl.startsWith('http') ? meetUrl : 'https://' + meetUrl;
    }
  }
  
  // Check the location for Meet links
  if (event.extendedProps && event.extendedProps.location) {
    const locationMatch = event.extendedProps.location.match(meetRegex);
    if (locationMatch) {
      const meetUrl = locationMatch[0];
      return meetUrl.startsWith('http') ? meetUrl : 'https://' + meetUrl;
    }
  }
  
  // Check location directly on event
  if (event.location) {
    const locationMatch = event.location.match(meetRegex);
    if (locationMatch) {
      const meetUrl = locationMatch[0];
      return meetUrl.startsWith('http') ? meetUrl : 'https://' + meetUrl;
    }
  }
  
  // Check description directly on event  
  if (event.description) {
    const descriptionMatch = event.description.match(meetRegex);
    if (descriptionMatch) {
      const meetUrl = descriptionMatch[0];
      return meetUrl.startsWith('http') ? meetUrl : 'https://' + meetUrl;
    }
  }
  
  return null;
}

/**
 * Extract other links from event description (excluding all Google links)
 *
 * @param {object} event Event object from FullCalendar
 * @returns {array} Array of other URLs found
 */
function pgcal_extractOtherLinks(event) {
  const otherLinks = [];
  
  // Match URLs but exclude all google.com domains
  const urlRegex = /https?:\/\/(?!(?:[a-z0-9-]+\.)*google\.com)[^\s<>"]+/gi;
  
  // Check the description for other links
  if (event.extendedProps && event.extendedProps.description) {
    const descriptionMatches = event.extendedProps.description.match(urlRegex);
    if (descriptionMatches) {
      descriptionMatches.forEach(url => {
        // Clean up any trailing punctuation
        const cleanUrl = url.replace(/[?!.]*$/, '');
        if (!otherLinks.some(link => link.url === cleanUrl)) {
          otherLinks.push({
            url: cleanUrl,
            title: 'Link'
          });
        }
      });
    }
  }
  
  // Check description directly on event  
  if (event.description) {
    const descriptionMatches = event.description.match(urlRegex);
    if (descriptionMatches) {
      descriptionMatches.forEach(url => {
        const cleanUrl = url.replace(/[?!.]*$/, '');
        // Avoid duplicates
        if (!otherLinks.some(link => link.url === cleanUrl)) {
          otherLinks.push({
            url: cleanUrl,
            title: 'Link'
          });
        }
      });
    }
  }
  
  return otherLinks;
}

/**
 * Extract Google Drive links from event attachments or description
 *
 * @param {object} event Event object from FullCalendar
 * @returns {array} Array of Google Drive URLs found
 */
function pgcal_extractDriveLinks(event) {
  const driveLinks = [];
  
  // Google Drive URL patterns (docs, sheets, slides, drive files)
  const driveRegex = /https?:\/\/(?:docs|sheets|slides|drive)\.google\.com\/[^\s<>"]+/gi;
  
  // Check attachments first (Google Calendar API)
  if (event.extendedProps && event.extendedProps.attachments) {
    for (const attachment of event.extendedProps.attachments) {
      if (attachment.fileUrl && attachment.fileUrl.match(driveRegex)) {
        driveLinks.push({
          url: attachment.fileUrl,
          title: attachment.title || 'Document'
        });
      }
    }
  }
  
  // Check attachments directly on event
  if (event.attachments) {
    for (const attachment of event.attachments) {
      if (attachment.fileUrl && attachment.fileUrl.match(driveRegex)) {
        driveLinks.push({
          url: attachment.fileUrl,
          title: attachment.title || 'Document'
        });
      }
    }
  }
  
  // Check the description for Drive links
  if (event.extendedProps && event.extendedProps.description) {
    const descriptionMatches = event.extendedProps.description.match(driveRegex);
    if (descriptionMatches) {
      descriptionMatches.forEach(url => {
        // Avoid duplicates
        if (!driveLinks.some(link => link.url === url)) {
          driveLinks.push({
            url: url,
            title: 'Document'
          });
        }
      });
    }
  }
  
  // Check description directly on event  
  if (event.description) {
    const descriptionMatches = event.description.match(driveRegex);
    if (descriptionMatches) {
      descriptionMatches.forEach(url => {
        // Avoid duplicates
        if (!driveLinks.some(link => link.url === url)) {
          driveLinks.push({
            url: url,
            title: 'Document'
          });
        }
      });
    }
  }
  
  return driveLinks;
}

/**
 * Create View Documents button for Google Drive links
 *
 * @param {array} driveLinks Array of drive link objects
 * @returns {string} HTML button element
 */
function pgcal_createDocumentsButton(driveLinks) {
  if (!driveLinks || driveLinks.length === 0) return '';
  
  // If only one document, open it directly
  if (driveLinks.length === 1) {
    return `<button class="pgcal-docs-btn" onclick="window.open('${driveLinks[0].url}', '_blank')" title="View Document">View Documents</button>`;
  }
  
  // If multiple documents, create a dropdown-like behavior
  const linksHtml = driveLinks.map(link => 
    `window.open('${link.url}', '_blank');`
  ).join(' ');
  
  return `<button class="pgcal-docs-btn" onclick="${linksHtml}" title="View ${driveLinks.length} Documents">View Documents</button>`;
}

/**
 * Create View Event button for Google Calendar event
 *
 * @param {string} eventUrl Google Calendar event URL
 * @returns {string} HTML button element
 */
function pgcal_createEventButton(eventUrl) {
  if (!eventUrl) return '';
  
  return `<button class="pgcal-event-btn" onclick="window.open('${eventUrl}', '_blank')" title="View Event in Google Calendar">View Event</button>`;
}

/**
 * Create Join Classroom button for Google Meet
 *
 * @param {string} meetUrl Google Meet URL
 * @returns {string} HTML button element
 */
function pgcal_createMeetButton(meetUrl) {
  if (!meetUrl) return '';
  
  return `<button class="pgcal-meet-btn" onclick="window.open('${meetUrl}', '_blank')" title="Join Google Meet">Join Classroom</button>`;
}

/**
 * Create View Link button for other links
 *
 * @param {array} otherLinks Array of other link objects
 * @returns {string} HTML button element
 */
function pgcal_createOtherLinkButton(otherLinks) {
  if (!otherLinks || otherLinks.length === 0) return '';
  
  // If only one link, open it directly
  if (otherLinks.length === 1) {
    return `<button class="pgcal-other-btn" onclick="window.open('${otherLinks[0].url}', '_blank')" title="View Link">View Link</button>`;
  }
  
  // If multiple links, create a dropdown
  const dropdownId = 'pgcal-other-dropdown-' + Math.random().toString(36).substr(2, 9);
  const linksList = otherLinks.map(link => 
    `<li><a href="${link.url}" target="_blank">${link.url}</a></li>`
  ).join('');
  
  return `<button class="pgcal-other-btn" onclick="pgcal_toggleOtherLinksDropdown('${dropdownId}')" title="View ${otherLinks.length} Links">View Links (${otherLinks.length})</button><div id="${dropdownId}" class="pgcal-other-dropdown" style="display: none;"><ul>${linksList}</ul></div>`;
}

/**
 * Toggle the dropdown for other links
 *
 * @param {string} dropdownId The ID of the dropdown to toggle
 */
function pgcal_toggleOtherLinksDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

/**
 * Add description row under the event in list view
 *
 * @param {object} info Event info object from FullCalendar
 * @param {HTMLElement} eventEl Event element
 * @param {object} settings Calendar settings object
 */
function pgcal_addDescriptionRow(info, eventEl, settings) {
  // Get the description from the event
  let description = '';
  
  // Check for description in various places
  if (info.event.extendedProps && info.event.extendedProps.description) {
    description = info.event.extendedProps.description;
  } else if (info.event.description) {
    description = info.event.description;
  }
  
  // Only proceed if there's a description
  if (!description || description.trim() === '') {
    return;
  }
  
  // Clean and format the description
  description = description.trim();
  
  // Remove Google Meet links from description if enabled
  if (settings && pgcal_is_truthy(settings["hide_meet_links"])) {
    description = pgcal_removeMeetLinks(description);
  }
  
  // After cleaning, check if there's still content
  if (!description || description.trim() === '') {
    return;
  }
  
  // Convert URLs to links and line breaks to <br>
  description = pgcal_urlify(description);
  description = pgcal_breakify(description);
  
  // Final cleanup to remove any leading/trailing <br> tags
  description = description.replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '');
  
  // If description is empty after all processing, don't add the row
  if (!description || description.trim() === '') {
    return;
  }
  
  // Find the list event row
  const listEventRow = eventEl.closest('.fc-list-event');
  if (!listEventRow) {
    return;
  }
  
  // Check if description row already exists
  if (listEventRow.nextElementSibling && listEventRow.nextElementSibling.classList.contains('pgcal-description-row')) {
    return;
  }
  
  // Create the description row
  const descriptionRow = document.createElement('tr');
  descriptionRow.className = 'pgcal-description-row fc-list-event';
  
  // Create the description cell that spans all columns
  const descriptionCell = document.createElement('td');
  descriptionCell.className = 'pgcal-description-cell';
  descriptionCell.colSpan = listEventRow.children.length;
  descriptionCell.innerHTML = `<div class="pgcal-description-content">${description}</div>`;
  
  descriptionRow.appendChild(descriptionCell);
  
  // Insert the description row after the current event row
  listEventRow.parentNode.insertBefore(descriptionRow, listEventRow.nextSibling);
}

/**
 * Merge arrays overriding arguments
 *
 */
function pgcal_argmerge(defaults, override) {
  // override = Array.isArray(atts) ? override : Object.assign({}, override);
  const out = {};

  for (const [name, defaultVal] of Object.entries(defaults)) {
    if (override.hasOwnProperty(name)) {
      out[name] = override[name];
    } else {
      out[name] = defaultVal;
    }
  }

  for (const name in override) {
    if (!out.hasOwnProperty(name)) {
      out[name] = override[name];
    }
  }

  return out;
}
