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
                        response["monitors"].forEach(function(element, index, array) {
                            monitors[element["id"]] = element;
                            monitorIds.push(element["id"]);
                        });
                    }
                }
            }
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
    
}
