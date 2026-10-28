# Creator Toolkit app: deploy and Google Play guide

Package ID (permanent, cannot change after publishing): `in.creatortoolkits.app`
Creator and contact in the app and privacy page: Naveen Kodali, naveenkodali322@gmail.com

How it works: the app is a web app (this folder) hosted on Vercel. PWABuilder wraps it as an Android app (AAB file). You upload that AAB to the Play Console. After that, any change you make to the web app goes live without a new Play release.

Total time: about 1 hour of your work now, then 14 days of closed testing, then Google review.

---

## Part 1. GitHub: new repository

1. github.com, then New repository. Name: `creator-toolkit-app`. Private or public, both work. Create it.
2. Unzip the zip I sent. Open the `creator-toolkit-app` folder, press Ctrl+A (select everything inside), and drag all of it onto the GitHub "uploading an existing file" page. The folders `api`, `fonts`, `icons` and `store` stay as folders.
3. Check that the repo root shows: `index.html`, `app.js`, `app.css`, `sw.js`, `privacy.html`, `manifest.webmanifest`, `assetlinks.json`, `vercel.json`, `package.json` and the folders `api`, `fonts`, `icons`. Commit.
4. If `.vercelignore` is missing (hidden files are sometimes skipped), nothing breaks. It only keeps the store files off the website.

## Part 2. Groq key (the AI)

1. console.groq.com, sign in with YOUR own account (not the account used for the website). Groq limits are per account, so a separate account gives the app its own free limit.
2. API Keys, Create API Key, copy it (starts with `gsk_`). Do not paste it in chat or in any file.

## Part 3. Vercel

1. vercel.com, Add New, Project, import the `creator-toolkit-app` repo.
2. Framework Preset: Other. Build command and output directory: leave empty.
3. Open Environment Variables and add `GROQ_API_KEY` with your key. Deploy.
4. Open the `.vercel.app` address Vercel gives you. Remember this address, it is your APP DOMAIN.

Optional, nicer: use `app.creatortoolkits.in`. Vercel project, Settings, Domains, add it, then the owner of creatortoolkits.in (Naveen) adds the CNAME record that Vercel shows in his domain's DNS settings. Decide this BEFORE Part 5, because PWABuilder asks for the address and the Play app is tied to it.

Vercel's free Hobby plan is for non-commercial use. The app has no ads or payments, so that is fine now. If you add ads or payments later, you need a paid plan.

## Part 4. Test in the browser, on your phone

Open the APP DOMAIN on your phone in Chrome and check:
- Each tool: type a topic, tap Generate, you get results. Copy works. The star saves to Saved.
- "Report a problem with these results" opens a small panel and sends.
- About shows Naveen Kodali. Privacy Policy opens `/privacy.html`.
- `APP-DOMAIN/.well-known/assetlinks.json` opens (it still has placeholder text, that is fine for now).

If Generate says "API key not set", the `GROQ_API_KEY` variable is missing: add it in Vercel, Settings, Environment Variables, then Deployments, Redeploy.

## Part 5. PWABuilder: make the AAB

1. pwabuilder.com, enter your APP DOMAIN, Start. It should show the manifest and service worker as found.
2. Package for stores, Android, Generate Package. Set:
   - Package ID: `in.creatortoolkits.app`
   - App name: `Creator Toolkit: YouTube Tools`, Launcher name: `Creator Toolkit`
   - App version `1.0.0`, version code `1`
   - Signing key: Create new. Notification delegation, location delegation and Play Billing: all OFF. Include source code: off.
3. Download the zip. Keep it safe forever: it has the signing key and passwords. It also has the `.aab` file and its own `assetlinks.json`.
4. Open `signing-key-info.txt` and note the SHA-256 fingerprint. This is the PWABuilder (upload) key fingerprint.

## Part 6. Play Console: create the app and upload

1. Play Console (the account you publish from), Create app. Name `Creator Toolkit: YouTube Tools`, language English (India) or English, App, Free. Accept the declarations.
2. Set up your app tasks: fill them using `LISTING.md` (app content table). Privacy policy URL: `APP-DOMAIN/privacy.html`.
3. Testing, Closed testing, Create track (or use the default one), Testers: create an email list with at least 15 Gmail addresses, Countries: India (and others if you like).
4. Create new release, upload the `.aab`. Accept Play App Signing when it asks. Release name `1.0.0`, add the release notes from `LISTING.md`, Save, Review, Start rollout to closed testing.
5. Main store listing: paste the texts from `LISTING.md`, upload `store/play-store-icon-512.png` and `store/feature-graphic-1024x500.png`. Screenshots come in Part 8.

## Part 7. Fix the address bar (assetlinks.json)

If you skip this, the installed app shows a Chrome address bar on top, because Android cannot prove the app belongs to the website.

1. Play Console, your app, Test and release, App integrity (older name: Setup, App signing). Copy the SHA-256 certificate fingerprint of the App signing key.
2. In your GitHub repo open `assetlinks.json`, edit it, and replace
   - `PASTE_PLAY_APP_SIGNING_SHA256_HERE` with the Play app signing fingerprint
   - `PASTE_PWABUILDER_UPLOAD_KEY_SHA256_HERE` with the fingerprint from Part 5 step 4
   Keep the format `AA:BB:CC:...` exactly. Commit. Vercel redeploys in about a minute.
3. Open `APP-DOMAIN/.well-known/assetlinks.json` in a browser. You must see your two fingerprints and no placeholder text.
4. Uninstall and reinstall the test app. The address bar should be gone.

## Part 8. Testers, screenshots, production

1. Testing, Closed testing, Testers tab, copy the opt-in link. Send it to at least 15 people. Each person opens the link on their phone with their Gmail, taps Become a tester, then installs from Play. They must stay opted in for 14 days in a row. Ask them to open the app a few times.
2. Install it yourself the same way. Take 4 to 8 screenshots (Home, a tool with results, Tags counter, Description draft, Checklist, Saved). Telugu text shows correctly on a real phone. Upload them in the store listing.
3. After 14 days with 12 or more opted-in testers: Play Console Dashboard, Apply for production. Google usually answers in 7 days or less, sometimes longer.
4. After approval, Production, Create new release with the same AAB or a newer one, and roll out.

## Later changes

- Any change in the web files (text, design, fixes): edit on GitHub, Vercel redeploys, the installed app shows it the next time it opens (the second time for cached files). No Play release needed.
- A new Play release (new AAB) is needed only if you change the package, icon, name or colors inside the Android wrapper. Then rebuild in PWABuilder with the SAME signing key and a higher version code.
- Reports from the Report button: Vercel project, Logs, search for `APP_REPORT`. Vercel keeps logs for a short time on the free plan, so check now and then.

## Things to know honestly

- The Play store page shows the developer name of the account you publish from. Naveen is the creator inside the app, the privacy page and the listing text. Keep Naveen's written OK (a message is enough) that the app is his and published with permission, in case Google asks.
- The website's AdSense does not run in the app. The app has no ads. AdMob can be added later, but that needs a new version and updated Play forms.
- Groq free plan has a limit per minute. If many people use the app at once they may see "busy, try again". Normal use is fine.
- The app keeps its own copy of the AI code. If Naveen changes the website's tools later, the app does not change by itself.
- Privacy page: says the app is made by Naveen Kodali and no mention of anyone else. If you ever use a different support email, change it in `privacy.html`, `app.js` (CONTACT) and the Play listing.
