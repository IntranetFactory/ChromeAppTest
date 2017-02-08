(function () {
  'use strict';

  var API_RELATIVE_URL = "/api/adenin.Now.Service/CardStatus";

  var localStorage = chrome.storage.local;
  var apiUrl = false;
  var intervalId = false;
  var isInitialized = false;

  function refresh() {
    localStorage.get('serverUrl', function (data) {
      if (data && data.serverUrl !== undefined) {
        if (data.serverUrl !== "") {
          apiUrl = data.serverUrl + API_RELATIVE_URL;
          setCookiesForUrlHelper(apiUrl);
          updateBadge(apiUrl);
          if (intervalId) {
            clearInterval(intervalId);
          }
          intervalId = setInterval(updateBadge, 60000, apiUrl);
        } else {
          if (intervalId) {
            clearInterval(intervalId);
          }
          setExtensionIconHelper("red");
          setBadgeTextHelper("");
        }
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
    }, function (cookies) {
      if (cookies && cookies.forEach) {
        cookies.forEach(function (cookie, index) {
          document.cookie = cookie.name + "=" + cookie.value;
        });
      }
    });
  }

  chrome.cookies.onChanged.addListener(function (changeInfo) {
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
        path: '../img/icon_64_red.png'
      });
    } else if (icon === "green") {
      chrome.browserAction.setIcon({
        path: '../img/icon_64.png'
      });
    }
  }

  function updateBadge(apiUrl) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
   
    xhr.withCredentials = true;

    xhr.open("GET", apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var status = xhr.status;
        var statusText = xhr.statusText;

        if (status === 200 && statusText === "OK") {
          var response = xhr.response;
          if (response.ErrorCode === 0) {

            var counter = response.Data.cardInstanceCount;

            var count = counter.newLow + counter.newHigh + counter.newNormal;
            console.log("received " + counter.newLow + " " + counter.newHigh  + " " + counter.newNormal);

            // hide bade if we have no new cards
            if(count === 0) {
              setBadgeTextHelper("");
            } else {
              setBadgeTextHelper(count + "");
            }

            if (counter.newLow > 0 && (counter.newNormal + counter.newHigh) === 0) {
              setExtensionIconHelper("green");
              // low priority == blue badge
              setBadgeBackgroundColorHelper([3, 147, 201, 128]);
            } else if (counter.newNormal > 0 && counter.newHigh === 0) {
              setExtensionIconHelper("red");
              // normal priority == blue badge
              setBadgeBackgroundColorHelper([3, 147, 201, 128]);
            } else if (counter.newHigh > 0) {
              setExtensionIconHelper("red");
              // high priority == red badge
              setBadgeBackgroundColorHelper([255, 0, 0, 128]);
            } else {
              setExtensionIconHelper("green");
              // low priority == blue badge
              setBadgeBackgroundColorHelper([3, 147, 201, 128]);
            }

          } else if (response.ErrorCode === 401) {
            // set error icon on browserAction
            var errorText = response.Data.ErrorText;
            console.log("Error 401: "+errorText);
            setBadgeTextHelper("");
            setExtensionIconHelper("red");

          } else if (response.ErrorCode === 404) {
            // something special should be done here but its not specified yet
            console.log("error " + response.ErrorCode);
          } else {
            console.log("error " + response.ErrorCode);
          }
        } else if (status === 404 && statusText === "Not Found") {
          // something special should be done here but its not specified yet
          console.log('status === 404 && statusText === "Not Found"');
        } else {
          // set error icon on browserAction
          console.log("request failed");
          setBadgeTextHelper("");
          setExtensionIconHelper("red");
        }
      }
    };

    xhr.send();
    console.log("request " + apiUrl);
  }

  function Application() {
    return {
      refresh: function () {
        refresh();
      }
    };
  }

  window.Application = Application();

  refresh();
  isInitialized = true;

  // There is no event to listen to when popup page opens or closes
  // so a trick is used
  // to detect when popup is opened a chrome.runtime.connect is called
  // this will trigger chrome.runtime.onConnected in the background page
  chrome.runtime.onConnect.addListener(function (incomingPort) {
    // popup is opened
    // clear the badge
    setBadgeTextHelper("");
    // stop the updating
    if (intervalId) {
      clearInterval(intervalId);
    }

    // when popup closes incomingPort.onDisconnect will trigger
    incomingPort.onDisconnect.addListener(function () {
      // restart the updating
      refresh();
    });
  });

}());
