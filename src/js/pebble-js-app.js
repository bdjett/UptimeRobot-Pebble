/*******************
 * pebble-js-app.js
 *
 * JavaScript for UptimeRobot
 *
 * Created by: Brian Jett
 */

var maxAppMessageBuffer = 100;
var maxAppMessageTries = 3;
var appMessageRetryTimeout = 3000;
var appMessageTimeout = 100;
var httpTimeout = 12000;
var appMessageQueue = [];
var isNewList = false;

// User's current monitors
var monitors = [];
var monitorIds = [];

// getMonitors
// -----------
//
// gets all of the monitors associated with key
var getMonitors = function() {
    console.log("Getting monitors");
    var key = localStorage['api_key'].toString();
    var req = new XMLHttpRequest();
    if (key) {
        var requestUrl = "http://api.uptimerobot.com/getMonitors?apiKey=" + key +
                            "&logs=0&alertContacts=0&responseTimes=1&format=json&noJsonCallback=1";
        console.log(requestUrl);
        req.open('GET', requestUrl, true);
        req.onload = function(e) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if (req.responseText) {
                        var response = JSON.parse(req.responseText);
                        var monitorsArray = response.monitors.monitor;
                        monitorsArray.forEach(function(element, index, array) {
                            monitors[parseInt(element.id)] = element;
                            monitorIds.push(parseInt(element.id));
                            var friendlyName = element.friendlyname;
                            var url = element.url;
                            var status = parseInt(element.status);
                            var id = element.id;
                            appMessageQueue.push({'message': {
                                                    'index': index,
                                                    'id': id,
                                                    'friendlyName': friendlyName,
                                                    'url': url,
                                                    'status': status}});
                        });
                    }
                }
            }
            sendAppMessage();
        };
        req.ontimeout = function() {
            console.log("HTTP request timed out");
            sendError("Request timed out!");
        };
        req.onerror = function() {
            console.log("HTTP request returned error");
            sendError("Failed to connect!");
        };
        req.send(null);
    }
}

// getStatus
// ---------
//
// takes a monitor id and returns the status
var getStatus = function(monitorId) {
    console.log("Getting status of monitorId: " + monitorId);
    if (monitors[parseInt(monitorId)]) {
        var monitor = monitors[parseInt(monitorId)];
        var friendlyName = monitor.friendlyname;
        var status = parseInt(monitor.status);
        var uptimeRatio = monitor.alltimeuptimeratio;
        console.log(friendlyName + " " + uptimeRatio);
        appMessageQueue.push({'message':
                                {'friendlyName': friendlyName.toString(),
                                 'status': status,
                                 'uptime': uptimeRatio.toString()}});
        sendAppMessage();
    } else {
        sendError("Monitor does not exist.");
    }
}

// sendError
// ---------
//
// returns error to pebble
var sendError = function(error) {
    Pebble.showSimpleNotificationOnPebble("Error!", error.toString());
}

// sendAppMessage
// --------------
//
// sends app message queue to pebble
var sendAppMessage = function() {
    if (appMessageQueue.length > 0) {
        var currentAppMessage = appMessageQueue[0];
        currentAppMessage.numTries = currentAppMessage.numTries || 0;
        currentAppMessage.transactionId = currentAppMessage.transactionId || -1;

        if (currentAppMessage.numTries < maxAppMessageTries) {
            console.log("Sending message");
            Pebble.sendAppMessage(
                currentAppMessage.message,
                function(e) {
                    appMessageQueue.shift();
                    setTimeout(function() {
                        sendAppMessage();
                    }, appMessageTimeout);
                }, function(e) {
                    console.log("Faled sending AppMessage for transactionId: " + e.data.transactionId + ". Error: " + e.data.error.message);
                    appMessageQueue[0].transactionId = e.data.transactionId;
                    appMessageQueue[0].numTries++;
                    setTimeout(function() {
                        sendAppMessage();
                    }, appMessageRetryTimeout);
                }
            );
        } else {
            console.log("Faled sending AppMessage after multiple attemps for transactionId: " + currentAppMessage.transactionId + ". Error: None. Here's the message: " + JSON.stringify(currentAppMessage.message));
        }
    }
}

Pebble.addEventListener("appmessage", function(e) {
    if (e.payload.getStatus) {
        console.log("Getting info for " + e.payload.id);
        getStatus(e.payload.id);
    }
});

Pebble.addEventListener("ready", function(e) {
    if (localStorage['api_key']) {
        getMonitors();
    } else {
        sendError("Please enter your API key from UptimeRobot in the settings on the Pebble app.");
    }
});

Pebble.addEventListener("showConfiguration", function(e) {
    Pebble.openURL("http://logicalpixels.com/uptimerobot/uptimerobot_settings.html#" + localStorage['api_key']);
});

Pebble.addEventListener("webviewclosed", function(e) {
    var configuration = JSON.parse(decodeURIComponent(e.response));
    localStorage['api_key'] = configuration.api_key.toString();
    if (localStorage['api_key']) {
        getMonitors();
    } else {
        sendError("You didn't enter your API key in the settings app.");
    }
})
