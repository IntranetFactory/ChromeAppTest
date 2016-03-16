(function() {
  'use strict';
  var saveButton = document.getElementById('saveBtn');
  var urlInput = document.getElementById('urlInput');
  var urlEcho = document.getElementById('urlEcho');
  var localStorage = chrome.storage.local;

  var apiUrlSaveButton = document.getElementById('apiUrlSaveBtn');
  var apiUrlInput = document.getElementById('apiUrlInput');
  var apiUrlEcho = document.getElementById('apiUrlEcho');

  var backgroundPage = chrome.extension.getBackgroundPage();
  var application = backgroundPage.Application;

  if (saveButton) {
    saveButton.addEventListener('click', function(event) {
      var frameUrl = urlInput.value;
      localStorage.set({
        frameUrl: frameUrl
      });
      urlEcho.innerHTML = frameUrl;
      if (application && application.refresh) {
        application.refresh();
      }
    });
  }

  localStorage.get('frameUrl', function (data) {
    if (data && data.frameUrl) {
      urlEcho.innerHTML = data.frameUrl;
      urlInput.value = data.frameUrl;
    }
  });

  if (apiUrlSaveButton) {
    apiUrlSaveButton.addEventListener('click', function(event) {
      var apiUrl = apiUrlInput.value;
      localStorage.set({
        apiUrl: apiUrl
      });
      apiUrlEcho.innerHTML = apiUrl;
      if (application && application.refresh) {
        application.refresh();
      }
    });
  }

  localStorage.get('apiUrl', function (data) {
    if (data && data.apiUrl) {
      apiUrlEcho.innerHTML = data.apiUrl;
      apiUrlInput.value = data.apiUrl;
    }
  });
}());
