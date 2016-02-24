(function() {
  'use strict';

  var urlFrame = document.getElementById('urlFrame');
  var storage = chrome.storage.local;

  storage.get('frameUrl', function (data) {
    if (data && data.frameUrl) {
      urlFrame.setAttribute('src', data.frameUrl);
    }
  });

}());
