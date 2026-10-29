(function () {
  "use strict";

  const configuredApiUrl = "http://localhost:5000";
  window.AM_API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");
})();
