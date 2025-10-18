Cloudflare Pages setup notes

1) Headers
- This repository includes a `_headers` file at the project root to set a permissive Content-Security-Policy that allows Firebase Realtime Database over HTTPS and WebSockets on both legacy `firebaseio.com` and new `firebasedatabase.app` domains.
- Cloudflare Pages will pick this up automatically on deploy. Remove any zone-level CSP (Response header rules) that conflict, or ensure you do not set a second CSP there.

2) Custom domains
- Map `climitquest.org` and `www.climitquest.org` in Pages → Custom domains; set one as primary.
- Ensure DNS CNAMEs point to `<project>.pages.dev` and SSL is Active.

3) Firebase Auth authorized domains
- In Firebase Console → Authentication → Settings → Authorized domains, add both your Pages default domain and all custom domains:
  - d5e31be6.climatequest-phonebuzzer.pages.dev
  - climitquest.org
  - www.climitquest.org
