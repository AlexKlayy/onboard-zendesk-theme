# Onboard Help Center — Custom Zendesk Guide Theme

Custom Zendesk Guide theme for the Onboard help center. Editorial layout, Poppins type, navy as the dominant brand color with orange used sparingly as the accent.

## Brand Tokens

| Token | Value | Usage |
|---|---|---|
| `--brand` | `#133254` | Navy — dominant brand color (nav, links, structural) |
| `--brand-hover` | `#0f2847` | Brand hover |
| `--accent` | `#F66724` | Orange — sparingly used for pop moments only |
| `--accent-hover` | `#E55A1D` | Accent hover |
| `--bg-page` | `#FAF9F5` | Warm off-white page background |
| `--text-primary` | `#141413` | Body text |
| Font | Poppins (300–700) | All text |

### Where orange shows up (the only places)

- Hero italic word ("How can *we* help?")
- Article drop cap (first letter of long ledes)
- The `::before` dot on H2 section headings inside articles
- The "Email support" CTA pill in the article-footer "stuck" block
- Featured chapter wash on the home accordion
- Search hit highlights (`<em>` matches in result snippets)

Everywhere else is navy or neutral.

## How to Upload to Zendesk

### GitHub Integration (recommended)

1. In Zendesk Guide, go to **Customize design → Add theme → Add from GitHub**.
2. Authorize and select this repo.
3. Zendesk syncs from the `main` branch on every push (manifest version must bump).

### ZIP upload

1. Zip the repo contents.
2. **Guide → Customize design → Add theme → Import theme**.
3. Publish.

## Customization

Theme settings live in `manifest.json` and are editable from Guide's theme editor without code changes:

- Brand color / hover (navy)
- Accent color / hover (orange)
- Nav background (defaults to brand navy)
- Text color, background color
- Hero title text, show/hide hero
