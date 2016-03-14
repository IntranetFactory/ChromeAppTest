(function() {
  'use strict';

  var urlFrame = document.getElementById('urlFrame');
  var storage = chrome.storage.local;

  storage.get('frameUrl', function (data) {
    var content = document.getElementById('content');
    var error = document.getElementById('error');

    if (data && data.frameUrl) {
      error.classList.add('hidden');
      content.classList.remove('hidden');
      document.body.classList.remove('error');
      chrome.browserAction.setIcon({ path: '../img/icon-64px.png' });
      urlFrame.setAttribute('src', data.frameUrl);
    } else {
      content.classList.add('hidden');
      error.classList.remove('hidden');
      document.body.classList.add('error');
      chrome.browserAction.setIcon({ path: '../img/error-icon-64px.png' });
    }
  });

}());
