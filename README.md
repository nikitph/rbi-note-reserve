# ₹100 Note Reserve

An isometric line drawing of Indian ₹100-note bundles with two independent views:

- **Interactive widget:** hover to lift a bundle; adjust the intensity slider.
- **Loader:** a repeating lift wave with a **0.25×–3×** speed slider that changes the motion and cycle timing together.

Includes light and dark themes, a responsive layout, and a static loader when reduced motion is enabled. The notes are stylized geometric illustrations inspired by the new-series ₹100 note.

## Open

Open `index.html` in a browser. It is self-contained and works offline, with no installation or runtime dependencies.

## Edit and build

Use Node.js 20 or later. Edit `src/note-reserve.js` for the drawing and motion, or `scripts/build.mjs` for the two-view page and controls. Then run:

```sh
npm run build
```

The build writes `index.html`. The original Hairline engine is included unchanged in `vendor/hairline/kernel.js`.

## Verify

```sh
npm ci
npx playwright install chromium
npm test
```

The browser checks verify both figures render, hover selection and return to rest, intensity controls, actual speed-dependent loader cadence, theme switching, narrow layouts, reduced motion, clean teardown, and absence of browser errors. Screenshots are written to the ignored `work/` directory.

To use an existing Chromium-based browser, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable before running `npm test`.

## Attribution

Uses the engine and visual vocabulary of [Hairline by Lucas Markes](https://github.com/lucasmarkes/hairline), distributed under the [MIT license](vendor/hairline/LICENSE). The reserve drawing and combined widget/loader page were created for this project. This is an independent illustration, with no RBI affiliation.
