(function() {
  'use strict';

  var API_RELATIVE_URL = "/api/adenin.Now.Service/CardStatus";

  var localStorage = chrome.storage.local;
  var apiUrl = false;
  var intervalId = false;
  var isInitialized = false;

  function refresh() {
    localStorage.get('serverUrl', function(data) {
      if (data && data.serverUrl !== undefined) {
        apiUrl = data.serverUrl + API_RELATIVE_URL;
        setCookiesForUrlHelper(apiUrl);
        updateBadge(apiUrl);
        if (intervalId) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(updateBadge, 60000, apiUrl);
      }
    });
  }

  function setCookiesForUrlHelper(url) {
    // when refresh is called from cookies.onChanged handler
    // we do not want to set cookies again, because they are already set
    if (isInitialized) {
       return;
    }
    chrome.cookies.getAll({
      url: url
    }, function(cookies) {
      if (cookies && cookies.forEach) {
        cookies.forEach(function(cookie, index) {
          document.cookie = cookie.name + "=" + cookie.value;
        });
      }
    });
  }

  chrome.cookies.onChanged.addListener(function(changeInfo) {
    if (!apiUrl) {
      return;
    }

    var domain = changeInfo.cookie.domain;
    if (apiUrl.indexOf(domain) === -1) {
      return;
    }

    if (changeInfo.removed) {
      document.cookie = changeInfo.cookie.name + "=";
    } else {
      document.cookie = changeInfo.cookie.name + "=" + changeInfo.cookie.value;
    }
    refresh();
  });



  /**
   * @color color hex string, or int array of color values
   * @see https://developer.chrome.com/extensions/browserAction#method-setBadgeBackgroundColor
   */
  function setBadgeBackgroundColorHelper(color) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
  }

  function setBadgeTextHelper(text) {
    chrome.browserAction.setBadgeText({
      text: text
    });
  }

  /**
   * @icon - one of [red, green]
   * red is error icon, green is normal icon
   */
  function setExtensionIconHelper(icon) {
    if (icon === "red") {
      chrome.browserAction.setIcon({
        path: '../img/error-icon-64px.png'
      });
    } else if (icon === "green"){
      chrome.browserAction.setIcon({
        path: '../img/icon-64px.png'
      });
    }
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

            setBadgeTextHelper(count + "");
            if (count % 2) {
              // count is even number
              setBadgeBackgroundColorHelper("#00FF00");
            } else {
              // count is odd number
              setBadgeBackgroundColorHelper([255, 0, 0, 0]);
            }
            setExtensionIconHelper("green");
          } else if (response.ErrorCode === 401) {
            // set error icon on browserAction
            var errorText = response.Data.ErrorText;

            setBadgeTextHelper("");
            setExtensionIconHelper("red");
          } else if (response.ErrorCode === 404) {
            // something special should be done here but its not specified yet
          }
        } else if (status === 404 && statusText === "Not Found") {
          // something special should be done here but its not specified yet
        } else {
          // set error icon on browserAction
          setBadgeTextHelper("");
          setExtensionIconHelper("red");
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
  isInitialized = true;

}());
