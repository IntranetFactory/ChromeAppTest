(function() {
  'use strict';
  var saveButton = document.getElementById('saveBtn');
  var urlInput = document.getElementById('urlInput');
  var urlEcho = document.getElementById('urlEcho');
  var localStorage = chrome.storage.local;

  var backgroundPage = chrome.extension.getBackgroundPage();
  var application = backgroundPage.Application;

  if (saveButton) {
    saveButton.addEventListener('click', function(event) {
      var frameUrl = urlInput.value;
      localStorage.set({
        serverUrl: frameUrl
      });
      urlEcho.innerHTML = frameUrl;
      if (application && application.refresh) {
        application.refresh();
      }
    });
  }

  localStorage.get('serverUrl', function (data) {
    if (data && data.serverUrl) {
      urlEcho.innerHTML = data.serverUrl;
      urlInput.value = data.serverUrl;
    }
  });

}());
