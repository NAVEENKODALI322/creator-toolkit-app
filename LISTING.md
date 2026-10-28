# Google Play listing: copy and paste text

Everything here is under Naveen Kodali's name (the creator). The Play Console account is only the place where the app is published.

## Main store listing

**App name** (max 30, this one is 30):
```
Creator Toolkit: YouTube Tools
```

**Short description** (max 80, this one is 78):
```
AI titles, hooks, tags, hashtags & descriptions for YouTube. Telugu + English.
```

**Full description** (max 4000):
```
Creator Toolkit helps YouTube creators with the writing part of an upload. Type your video topic and get drafts that you can edit.

WHAT YOU CAN DO
• Title Generator: title ideas in English, Telugu or a Telugu + English mix, with a character count so you can keep titles near 60 characters
• Hook Generator: opening lines for the first seconds of your video
• Tags Generator: search tags, with a counter for YouTube's 500 character limit
• Hashtag Generator: hashtags for YouTube, Instagram or TikTok
• Description Generator: a first draft of your video description that you can edit, copy or share
• Upload Checklist: eight things to check before you press Publish

MADE FOR EVERYDAY USE
• Free, with no ads and no sign-up
• Your history and favorites stay on your phone, so you can come back to good ideas
• Copy any result with one tap
• Saved results and the checklist also open without internet

AN HONEST NOTE
The results are AI drafts. Read them, change them so they sound like you, and only promise in a title or hook what your video really delivers. Nothing in this app guarantees views, subscribers or income.

ABOUT
Creator Toolkit is created by Naveen Kodali, a graphic designer and Telugu YouTube creator from Andhra Pradesh. The same tools are on the website creatortoolkits.in, where he also explains how the tools are checked and shares real numbers from his own channel.

Questions or feedback: naveenkodali322@gmail.com
```

**Graphics**
- App icon (512 x 512): `store/play-store-icon-512.png`
- Feature graphic (1024 x 500): `store/feature-graphic-1024x500.png`
- Phone screenshots (2 to 8): take them on a real phone after you install the test version (see DEPLOY.md, part 8). Suggested shots: Home, Title Generator with results, Tags with the 500 counter, Description draft, Checklist, Saved.

**Contact details** (these are shown publicly on the store page)
- Email: naveenkodali322@gmail.com
- Website: https://www.creatortoolkits.in
- Privacy policy URL: `https://YOUR-APP-DOMAIN/privacy.html` (use the real domain after Vercel deploy)

**Category:** Tools (another fit: Video Players & Editors). **Tags:** pick up to 5 that Play offers, for example YouTube, Video, Productivity.

## App content (the "Set up your app" tasks)

These are my suggested answers. Google changes its forms, so read each question and answer honestly. While you fill them, send me a screenshot of any page you are unsure about and I will check it.

| Task | Suggested answer |
|---|---|
| App access | All functionality is available without login or special access |
| Ads | No, the app does not contain ads |
| Content rating | Category: Utility, Productivity, Communication or Other. Answer No to violence, sexual content, bad language, drugs, gambling. The app shows AI-generated text from the person's own topic, so if there is a question about user-generated or AI content, answer Yes and mention the in-app Report button. The rating is expected to be the lowest one (Everyone) |
| Target audience | 18 and over (the privacy policy says the app is not for children under 13; choosing 18+ keeps the review simple) |
| News app | No |
| COVID-19, government, financial features, health | No / none |
| Advertising ID | The app does not use it |
| Data safety | See below |

### Generative AI and the Report button
Google requires apps that show AI-generated content to let people report offensive content without leaving the app. The app has this: under every set of results there is "Report a problem with these results". Reports go to your Vercel log (project > Logs). Look there now and then. If a report shows something bad, tell me and I will tighten the prompt.

### Data safety (suggested)
- Does the app collect or share user data? Yes, because of the optional Report button and server logs.
- Data types: Other user-generated content (only when someone taps Report: topic, result, reason). The text people type into the tools is sent to the server and the AI service only to create the result and is not saved, which Google calls ephemeral processing.
- Shared with third parties? No. The AI service (Groq) and the host (Vercel) work for the app as service providers.
- Is collection optional? Yes (only on Report).
- Purposes: App functionality, keeping the service safe.
- Encrypted in transit? Yes (HTTPS).
- Can users ask to delete their data? Yes, by email to naveenkodali322@gmail.com. There are no accounts.
- Server logs may include IP address. If the form asks about it, tell me what you see and we will answer it together.

## Release notes (first version)
```
First release of Creator Toolkit: Title, Hook, Tags, Hashtag and Description generators, Upload Checklist, and saved history on your phone.
```
