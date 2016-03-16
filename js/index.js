(function() {
  'use strict';

  var urlFrame = document.getElementById('urlFrame');
  var storage = chrome.storage.local;

  var extensionId = chrome.runtime.id;
  var extensionOptionsLink = document.getElementById('extensionOptionsLink');
  extensionOptionsLink.href = "chrome-extension://"+ extensionId + "/options.html";

  storage.get('frameUrl', function (data) {
    var content = document.getElementById('content');
    var error = document.getElementById('error');

    if (data && data.frameUrl) {
      error.classList.add('hidden');
      content.classList.remove('hidden');
      document.body.classList.remove('error');
      urlFrame.setAttribute('src', data.frameUrl);
    } else {
      content.classList.add('hidden');
      error.classList.remove('hidden');
      document.body.classList.add('error');
    }
  });

}());
