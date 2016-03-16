(function() {
  'use strict';

  var localStorage = chrome.storage.local;
  var apiUrl;
  var intervalId = false;

  chrome.cookies.getAll({ url: apiUrl }, function (cookies) {
    if (cookies && cookies.forEach) {
      cookies.forEach(function (cookie, index) {
        document.cookie = cookie.name + "=" + cookie.value;
      });
    }
  });

  chrome.cookies.onChanged.addListener(function(changeInfo) {
    var _apiUrl = apiUrl;
    var domain = changeInfo.cookie.domain;

    if (!_apiUrl || _apiUrl.indexOf(domain) === -1) {
      return;
    }

    if (changeInfo.removed) {
      document.cookie = changeInfo.cookie.name + "=";
    } else {
      document.cookie = changeInfo.cookie.name + "=" + changeInfo.cookie.value;
    }
    refresh();
  });

  function refresh() {
    localStorage.get('apiUrl', function(data) {
      if (data && data.apiUrl) {
        apiUrl = data.apiUrl;
        updateBadge(data.apiUrl);
        if (intervalId) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(updateBadge, 60000, data.apiUrl);
      }
    });
  }

  function updateBadge(apiUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";

    xhr.withCredentials = true;

    xhr.open("GET", apiUrl, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var status = xhr.status;
        var statusText = xhr.statusText;

        if (status === 200 && statusText === "OK") {
          var response = xhr.response;
          if (response.ErrorCode === 0) {
            var count = response.Data.visibleCardInstancesCount;
            chrome.browserAction.setBadgeText({
              text: count + ""
            });
            chrome.browserAction.setIcon({
              path: '../img/icon-64px.png'
            });
          } else if (response.ErrorCode === 401) {
            // set error icon on browserAction
            var errorText = response.Data.ErrorText;
            chrome.browserAction.setIcon({
              path: '../img/error-icon-64px.png'
            });
            chrome.browserAction.setBadgeText({
              text: ""
            });
          }
        } else {
          // set error icon on browserAction
          chrome.browserAction.setIcon({
            path: '../img/error-icon-64px.png'
          });
          chrome.browserAction.setBadgeText({
            text: ""
          });
        }
      }
    };

    xhr.send();
  }

  function Application() {
    return {
      refresh: function() {
        refresh();
      }
    };
  }

  window.Application = Application();

  refresh();

}());
