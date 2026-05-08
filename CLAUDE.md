# Onboard Zendesk Theme — Notes for Claude

Brief orientation for future Claude instances picking up this repo cold. Read before making changes.

## What this is

A Zendesk Guide theme for Edoc Service's **Onboard** product. Sister theme to the ePoster theme (different repo). Owner: alexklaschus@gmail.com.

Live at: `https://edoconboard.zendesk.com/hc/en-us/`

## Sync flow

Zendesk Help Center pulls this theme from GitHub. There is no `zat`/`zcli` push step.

- Push to `main` on GitHub
- Zendesk re-syncs only when `manifest.json` `version` changes
- **Always bump the version** when committing user-visible changes (current: see manifest)

## Load-bearing things that look optional — DO NOT DELETE

### `assets/*-bundle.js` (~3MB total)

These are Copenhagen's prebuilt React bundles for the request form. Files:

- `new-request-form-bundle.js`
- `new-request-form-translations-bundle.js`
- `shared-bundle.js`
- `wysiwyg-bundle.js`
- `flash-notifications-bundle.js`
- `ticket-fields-bundle.js`
- `es-module-shims.js` (importmap polyfill)

**Why they exist:** `manifest.json` is `api_version: 4`. That version removed the `{{request_form}}` and `{{form}}` Curlybars helpers. The new request page is now a React component (`renderNewRequestForm`) that you import as an ES module and mount client-side.

**The wiring:**

1. `templates/document_head.hbs` declares an `<script type="importmap">` mapping bare specifiers (`"new-request-form"`, `"shared"`, etc.) to the asset URLs above.
2. `templates/new_request_page.hbs` does `import { renderNewRequestForm } from "new-request-form"` and calls it on a `<div id="new-request-form">` mount node, passing a large props object derived from Curlybars helpers (`{{json new_request_form}}`, `{{json user.role}}`, etc.).
3. The polyfill (`es-module-shims.js`) loads only on browsers without native importmap support.

If you "clean up" any of these bundles, the request form goes blank with no console error visible to the user, only an import resolution failure. We learned this the hard way.

## Layout intent (don't redesign on a whim)

- **Home page (`home_page.hbs`):** two-up hub gateway — "Worker Help" and "Admin Help" cards. Mirrors how the customer mentally splits their audience. Not a flat chapter list.
- **Category pages (`category_page.hbs`):** editorial 2-column grid showing all sections of that hub with inline article lists. Section kickers come from a hardcoded map in `script.js` (`KICKERS` / `HUB_KICKERS`) — keep that map in sync if section names change in Zendesk.
- **Article page:** left rail with siblings, center body, right rail TOC, and a "Still stuck?" CTA at the bottom that goes to `/requests/new`.

## Header/nav rules

- **Sign in is hidden for anonymous users intentionally.** Only admins need to authenticate to manage tickets; regular visitors don't get prompted. `templates/header.hbs` has `{{#if signed_in}}` for Sign out only — no `{{else}}` branch.
- The "Submit a request" CTA in the nav uses `{{#link 'new_request'}}` block form to force the anchor text (otherwise Zendesk would render localized default text).

## Brand

- Navy `#133254` (header, nav background)
- Cream `#FAF9F5` (page background)
- Orange `#F66724` (accent — CTAs, hover underlines, hub-card arrows). User specifically asked: orange should **pop, not dominate**. Use sparingly.
- Display: Poppins (italic weight used on hero "we" and chapter "?" punctuation)
- Body: Poppins regular/light

CSS variables in `style.css` `:root` and overridable per-instance via `manifest.json` color settings.

## CSS gotchas

The React form's Garden components use class-fragment names (`StyledInput`, `ProseMirror`, `EditorContainer`, `MenuBar`, `Toolbar`, `Dropzone`). Overrides in `style.css` use `[class*="..."]` attribute-prefix selectors with `!important` to skin them. If you scope-tighten or remove `!important`, the overrides will lose to Garden's inline styles.

The "Rich text editor" screen-reader-only label became visible at one point — fixed by visually-hiding any `<label>` inside `[class*="Editor"]`, `[class*="wysiwyg"]`, `[class*="MenuBar"]`, `[class*="Toolbar"]`, `[class*="ProseMirror"]`, or `[aria-hidden="true"]` containers (see `style.css` around the "Visually hide the 'Rich text editor'" comment). Don't broaden those selectors — they will start hiding visible labels.

Form-field labels are scoped to `> form > label` (top-level only) so the visually-hidden ones inside the editor stay hidden.

## Search

The hero and search-results forms post to `action="{{help_center.url}}/search"` (absolute). Relative `action="search"` was wrong on nested pages.

Search tokenization is Zendesk-side. Querying `i9` does not match articles titled "I-9" because Zendesk strips the hyphen during indexing but keeps the digit token separated. **This is not a theme bug.** Tell the customer to either retitle the articles, add `I9` as a label/keyword, or use full word ("I-9") in search.

## Footer

- Support email is `support@edoconboard.com` (not `help@`).
- Copyright auto-renders the current year via `{{date 'YYYY'}}`.

## Thumbnail

`thumbnail.png` (1024×768) is what shows in Zendesk's Theme Library. Hand-generated with PIL to mirror the live home hero (navy header, cream hero, "How can we help?" with italic-orange "we", search shell with ⌘K, two hub cards). If the home page redesigns, regenerate the thumbnail to match — it's the customer's first impression in admin.

## Settings (`manifest.json`)

The `settings` array declares admin-uploadable variables (logo, favicon, brand colors, hero toggle/title). Note: the `favicon` setting is **declared but not currently rendered** — `document_head.hbs` has no `<link rel="icon">`. If a favicon is needed, add `<link rel="icon" href="{{settings.favicon}}">` to the head.

## Things that look broken but probably aren't

- **Form shows "cannot be blank" with text in fields:** check the URL. Theme Library Preview mode in Zendesk admin does not run form submissions — it's a render-only sandbox. Test on the live URL.
- **Suggested articles don't appear:** depends on Subject input firing change events through React state. If the form is in preview mode, neither submission nor suggestions will work.
- **Manifest version not picked up:** Zendesk syncs from GitHub on version change. If you bumped locally but didn't push, Zendesk still sees the old version.

## Conventions

- One-line commit messages preferred, with `Co-Authored-By: Claude` trailer.
- Don't add backward-compat shims, "removed for X" comments, or feature flags. Just change the code.
- The `.git` repo is real (the env occasionally reports `Is a git repository: false` — ignore it).
