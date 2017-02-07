(function() {
  'use strict';

  var urlFrame = document.getElementById('urlFrame');
  var storage = chrome.storage.local;

  var extensionId = chrome.runtime.id;
  var extensionOptionsLink = document.getElementById('extensionOptionsLink');
  extensionOptionsLink.href = "chrome-extension://"+ extensionId + "/html/options.html";

  storage.get('serverUrl', function (data) {
    var content = document.getElementById('content');
    var error = document.getElementById('error');
    var url = data.serverUrl;

    // if needs to be checked here because if data.serverUrl its not checked
    // lastIndexOf and replace functions will fail
    if (data && data.serverUrl) {

      // remove trailing slash
      if(url.lastIndexOf("/") == url.length - 1  ) {
        url = url.substring(0,url.length-1);
      }

      // if now url is provided use /Extension as default
      if((url.replace("://","")).indexOf("/") < 0) {
        url += "/Extension";
      }

      error.classList.add('hidden');
      content.classList.remove('hidden');
      document.body.classList.remove('error');
      urlFrame.setAttribute('src', url);
    } else {
      content.classList.add('hidden');
      error.classList.remove('hidden');
      document.body.classList.add('error');
    }
  });

  // There is no event to listen to when popup page opens or closes
  // so a trick is used
  // to detect when popup is opened a chrome.runtime.connect is called
  // this will trigger chrome.runtime.onConnected in the background page
  chrome.runtime.connect();

  // when popup closes incomingPort.onDisconnect will trigger

}());
