/* AM Electronics API configuration.
   Update API_BASE_URL after the Render backend service is created if Render
   assigns a different public URL. Do not put secrets in this browser file. */
(function () {
  "use strict";
  const configuredApiUrl = "https://am-electronics-store.onrender.com";
  window.AM_API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");
})();
