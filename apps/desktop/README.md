# PROJECT X Desktop
Electron desktop shell for official social websites in one window, using WebContentsView instead of iframe.

From repository root run `npm install` and `npm run dev:desktop`. On Windows, build installer with `npm run dist:desktop`.

**Limitations:** Embedded-browser login may be blocked by providers. Popups open in system browser for security. This is not the Cloudflare-hosted web version. Sessions are stored locally per platform. The installer is unsigned and has not been tested on Windows yet.
