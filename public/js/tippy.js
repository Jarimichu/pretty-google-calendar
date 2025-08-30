function pgcal_tippyRender(info, currCal) {
  // console.log(info.event); // DEBUG

  const startTime = info.event.allDay
    ? "All Day"
    : new Date(info.event.startStr).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

  const endTime = info.event.allDay
    ? ""
    : " - " +
      new Date(info.event.endStr).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

  const locString = info.event.extendedProps.location
    ? `<p>${info.event.extendedProps.location}</p>`
    : "";

  let toolContent = `
    <h2>${info.event.title} </h2>
    <p>${startTime}${endTime}</p>
    ${locString}`;

  toolContent += pgcal_breakify(
    pgcal_urlify(info.event.extendedProps.description)
  );

  // Check for Google Meet link, Google Drive links, and event URL, add buttons to tooltip
  const meetLink = pgcal_extractMeetLink(info.event);
  const driveLinks = pgcal_extractDriveLinks(info.event);
  const eventUrl = info.event.url;
  
  let buttonsHtml = '';
  
  if (driveLinks.length > 0) {
    if (driveLinks.length === 1) {
      buttonsHtml += `<button onclick="window.open('${driveLinks[0].url}', '_blank')" 
              style="background-color: #34a853; color: white; border: none; border-radius: 4px; 
                     padding: 6px 12px; font-size: 12px; cursor: pointer; margin-right: 8px;">
        View Documents
      </button>`;
    } else {
      const linksAction = driveLinks.map(link => `window.open('${link.url}', '_blank');`).join(' ');
      buttonsHtml += `<button onclick="${linksAction}" 
              style="background-color: #34a853; color: white; border: none; border-radius: 4px; 
                     padding: 6px 12px; font-size: 12px; cursor: pointer; margin-right: 8px;">
        View Documents (${driveLinks.length})
      </button>`;
    }
  }
  
  if (meetLink) {
    buttonsHtml += `<button onclick="window.open('${meetLink}', '_blank')" 
            style="background-color: #4285f4; color: white; border: none; border-radius: 4px; 
                   padding: 6px 12px; font-size: 12px; cursor: pointer; margin-right: 8px;">
      Join Classroom
    </button>`;
  }
  
  if (eventUrl) {
    buttonsHtml += `<button onclick="window.open('${eventUrl}', '_blank')" 
            style="background-color: #9c27b0; color: white; border: none; border-radius: 4px; 
                   padding: 6px 12px; font-size: 12px; cursor: pointer; margin-right: 8px;">
      View Event
    </button>`;
  }
  
  const additionalButtons = buttonsHtml ? `<div style="margin-top: 10px;">${buttonsHtml}</div>` : '';

  toolContent += `<div class="toolloc">${pgcal_mapify(
    info.event.extendedProps.location
  )} ${pgcal_addToGoogle(info.event.url)}${additionalButtons}</div>`;

  tippy(info.el, {
    trigger: "click",
    content: toolContent,
    theme: "light", // TODO: from settings
    allowHTML: true,
    placement: pgcal_is_mobile() ? "bottom" : "auto",
    popperOptions: pgcal_is_mobile()
      ? {
          modifiers: [
            {
              name: "flip",
              enabled: false,
              options: {
                // flipBehavior: ['bottom', 'right', 'top']
                // fallbackPlacements: ['right', 'top'],
              },
            },
          ],
        }
      : "",
    interactive: "true", // Allows clicking inside
    appendTo: document.getElementById(currCal),
    maxWidth: 600, // TODO: from settings
    boundary: "window",
  });
}
