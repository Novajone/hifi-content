//
//  deployNewScripts_ui.js
//
//  Created by Zach Fox on 2019-03-20
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document setTimeout clearTimeout */

// Emit an event specific to the App JS over the EventBridge.
var APP_NAME = "DEPLOY";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


var keyUpTimeout = false;
var KEY_UP_DELAY_MS = 500;
function scriptTextKeyUp() {
    var statusContainer = document.getElementById("statusContainer");

    if (keyUpTimeout) {
        clearTimeout(keyUpTimeout);
        keyUpTimeout = false;
    }

    if (!validateForm()) {
        statusContainer.innerHTML = "";
        return;
    }

    keyUpTimeout = setTimeout(function() {
        statusContainer.innerHTML = "...";
        deployNewScripts(true);
    }, KEY_UP_DELAY_MS);
}


function deployNewScripts(isDryRun) {
    var isPrefixMatch = document.getElementById("isPrefixMatch");
    var oldClientText = document.getElementById("oldClientText");
    var newClientText = document.getElementById("newClientText");
    var oldServerText = document.getElementById("oldServerText");
    var newServerText = document.getElementById("newServerText");

    var data = {
        "oldText": {
            "client": oldClientText.value,
            "server": oldServerText.value
        },
        "newText": {
            "client": newClientText.value,
            "server": newServerText.value
        },
        "isPrefixMatch": isPrefixMatch.checked,
        "isDryRun": isDryRun
    };

    emitAppSpecificEvent("deployNewScripts", data);

    closeModal();
}


function isPrefixMatchClicked() {
    var isPrefixMatch = document.getElementById("isPrefixMatch");
    var oldClientText = document.getElementById("oldClientText");
    var newClientText = document.getElementById("newClientText");
    var oldClientTextLabel = document.getElementById("oldClientTextLabel");
    var newClientTextLabel = document.getElementById("newClientTextLabel");
    var oldServerText = document.getElementById("oldServerText");
    var newServerText = document.getElementById("newServerText");
    var oldServerTextLabel = document.getElementById("oldServerTextLabel");
    var newServerTextLabel = document.getElementById("newServerTextLabel");

    if (isPrefixMatch.checked) {
        oldClientText.placeholder = "Old Client Script Prefix";
        newClientText.placeholder = "New Client Script Prefix";
        oldClientTextLabel.innerHTML = "Old Client Script Prefix";
        newClientTextLabel.innerHTML = "New Client Script Prefix";
        oldServerText.placeholder = "Old Server Script Prefix";
        newServerText.placeholder = "New Server Script Prefix";
        oldServerTextLabel.innerHTML = "Old Server Script Prefix";
        newServerTextLabel.innerHTML = "New Server Script Prefix";
    } else {
        oldClientText.placeholder = "Old Client Script (Exactly)";
        newClientText.placeholder = "New Client Script (Exactly)";
        oldClientTextLabel.innerHTML = "Old Client Script (Exactly)";
        newClientTextLabel.innerHTML = "New Client Script (Exactly)";
        oldServerText.placeholder = "Old Server Script (Exactly)";
        newServerText.placeholder = "New Server Script (Exactly)";
        oldServerTextLabel.innerHTML = "Old Server Script (Exactly)";
        newServerTextLabel.innerHTML = "New Server Script (Exactly)";
    }
    
    if (validateForm()) {
        document.getElementById("statusContainer").innerHTML = "...";
        deployNewScripts(true);
    }
}


function validateForm() {
    var oldClientText = document.getElementById("oldClientText");
    var newClientText = document.getElementById("newClientText");
    var oldServerText = document.getElementById("oldServerText");
    var newServerText = document.getElementById("newServerText");

    var retval = true;

    if ((oldClientText.value).length === 0 && (newClientText.value).length === 0 &&
        (oldServerText.value).length === 0 && (newServerText.value).length === 0) {
        retval = false;
    }

    if ((oldClientText.value).length > 0 && (oldClientText.value).indexOf("http") === -1) {
        oldClientText.setCustomValidity("Invalid value. This should be a URL.");
        retval = false;
        return retval;
    } else {
        oldClientText.setCustomValidity("");
    }

    if ((oldClientText.value).length > 0 && (newClientText.value).indexOf("http") === -1) {
        newClientText.setCustomValidity("Invalid value. This should be a URL.");
        retval = false;
        return retval;
    } else {
        newClientText.setCustomValidity("");
    }

    if ((oldServerText.value).length > 0 && (oldServerText.value).indexOf("http") === -1) {
        oldServerText.setCustomValidity("Invalid value. This should be a URL.");
        retval = false;
        return retval;
    } else {
        oldServerText.setCustomValidity("");
    }

    if ((oldServerText.value).length > 0 && (newServerText.value).indexOf("http") === -1) {
        newServerText.setCustomValidity("Invalid value. This should be a URL.");
        retval = false;
        return retval;
    } else {
        newServerText.setCustomValidity("");
    }

    return retval;
}


function maybeOpenModal() {
    if (validateForm()) {
        var modalContainer = document.getElementById("modalContainer");
        modalContainer.style.display = "block";
        
        var modalTextContainer = document.getElementById("modalTextContainer");
        modalTextContainer.innerHTML = `
            <strong>Are you sure?</strong><br>
            This operation will:<br>
            - Modify ${numModifiedClientScripts} entity client scripts<br>
            - Modify ${numModifiedServerScripts} entity server scripts<br>
            - Unlock, modify, then relock a total of ${numLockedScripts} entities
        `;
    } else {
        document.getElementById("form").checkValidity();
    }
}


function closeModal() {
    var modalContainer = document.getElementById("modalContainer");
    modalContainer.style.display = "none";
}


function initializeUI() {
    document.getElementById("loadingContainer").style.display = "none";
}


function showOperationInProgressStatus() {
    var statusContainer = document.getElementById("statusContainer");
    statusContainer.innerHTML = "An edit operation is currently in progress. Please try again in a moment...";
}

var numModifiedClientScripts = 0;
var numModifiedServerScripts = 0;
var numLockedScripts = 0;
function onEditComplete(data) {
    var isDryRun = data.isDryRun;
    numModifiedClientScripts = data.numModifiedClientScripts;
    numModifiedServerScripts = data.numModifiedServerScripts;
    numLockedScripts = data.numLockedScripts;
    
    var statusContainer = document.getElementById("statusContainer");

    if (isDryRun) {
        statusContainer.innerHTML = `
            This operation would:<br>
            - Modify ${numModifiedClientScripts} entity client scripts<br>
            - Modify ${numModifiedServerScripts} entity server scripts<br>
            - Unlock, modify, then relock a total of ${numLockedScripts} entities
        `;
    } else {
        statusContainer.innerHTML = `
            You modified ${numModifiedClientScripts} entity client scripts and ${numModifiedServerScripts} entity server scripts.
        `;
    }
}


// Handle messages over the EventBridge from the App JS
function onScriptEventReceived(scriptEvent) {
    var event = scriptEvent;
    try {
        event = JSON.parse(event);
    } catch (error) {
        return;
    }
    
    if (event.app !== APP_NAME) {
        return;
    }
    
    switch (event.method) {
        case "initializeUI":
            initializeUI();
            break;


        case "operationInProgress":
            showOperationInProgressStatus();
            break;


        case "editComplete":
            onEditComplete(event.data);
            break;


        default:
            console.log("Unrecognized event method supplied to App UI JS: " + event.method);
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});