# Yejie Mya Lee 

Build a mobile-first, single-page romantic birthday gift site for my girlfriend Mya. It's a vertical-scroll webtoon (Korean comic style) telling the story of how we met.

Opening screen: full black screen, nothing but centered white text: "Happy birthday, Mya" and a smaller line "tap to open." Tapping fades the screen out, starts a background music track (looping, soft fade-in), and reveals the comic. Music must only start on that tap. Add a tiny mute/unmute button pinned to a corner.

Comic section: a vertical stack of full-width image panels, no gaps, no margins, on a black background, like a webtoon app. Each panel fades in as it scrolls into view. Panels will be added later as image files — set it up so I can drop images into a folder and list them in one array.

Ending section: after the last panel, a dark section with a handwritten-style font (something like Caveat) containing a personal note from me, then one photo, then the line "To be continued… until Japan." Leave placeholder text and a placeholder image.

Style: monochrome, black and white, with one accent color: a soft blue. Minimal. No navigation, no header, no footer, no branding, no logos, no "made with" anything. Must look perfect on iPhone Safari. Keep everything in one page.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f22e00c1-5cff-416c-b65f-74a168d4317d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
