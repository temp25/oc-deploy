let eventCount;

function getElementById(id) {
  return document.getElementById(id);
}

function regionDropdownChange() {
  let selectedRegion = getElementById("regionDropdown").value;
  console.log("selectedRegion: " + selectedRegion);
  let deployElement = getElementById("deploy");
  if (deployElement.disabled === true) {
    deployElement.disabled = false;
  }
}

function deploy() {
  let confirmAction = confirm("Are you sure you want to initiate deployment in the selected region ?");
  if (confirmAction) {
    eventCount = 0;
    initializeEventSource();
  } else {
    console.debug("Deploy action dismissed...");
  }
}

function addToServerEvents(eventMessage) {
  ++eventCount;
  let serverEvents = getElementById("serverEvents");
  let eventId = "event-" + eventCount;
  let span = document.createElement("span");
  let br = document.createElement("br");
  let serverEventsContainer = getElementById("serverEventsContainer");
  span.id = eventId;
  span.innerHTML = eventMessage;
  serverEvents.appendChild(span);
  serverEvents.appendChild(br);
  serverEventsContainer.scrollTop = serverEventsContainer.scrollHeight;
}

function initializeEventSource() {
  if (!!window.EventSource) {
    const eventSource = new EventSource('/executeCommand?command=test.bat&args=--region=west');
    const eventStreamStatus = getElementById('eventStreamStatus');
    const deployElement = getElementById("deploy");

    eventSource.addEventListener('message', function(e) {
      eventStreamStatus.innerHTML = "streaming data";
      eventStreamStatus.style.color="#00FF00";
      addToServerEvents(e.data);
    }, false);

    eventSource.addEventListener('open', function(e) {
      eventStreamStatus.innerHTML = "Connected";
      eventStreamStatus.style.color="#00FF00";
      deployElement.disabled=true;
    }, false);

    eventSource.addEventListener('error', function(e) {
      
      if (e.eventPhase == EventSource.CLOSED)
        eventSource.close();
        deployElement.disabled=false;
      if (e.target.readyState == EventSource.CLOSED) {
        eventStreamStatus.innerHTML = "Disconnected";
        eventStreamStatus.style.color="#FF0000";
        deployElement.disabled=false;
      }
      else if (e.target.readyState == EventSource.CONNECTING) {
        eventStreamStatus.innerHTML = "Connecting...";
        eventStreamStatus.style.color="#FFFF00";
      }
    }, false);

  } else {
    let errorMessage = "Your browser doesn't support SSE";
    console.error(errorMessage);
    alert(errorMessage);
  }  
}
