# atharvbagade.com

Personal site of Atharv Bagade: one screen, laid out like a music app, doubling as a résumé.

Plain HTML, CSS and JavaScript. No framework and no build step: this folder is the site.

## Run it locally

The page loads its lists with `fetch()`, so open it through a local server rather than as a file:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

| Path | What it holds |
| --- | --- |
| `index.html` | All markup: top bar, the five sections, the phone tab bar |
| `styles.css` | Theme colours (light and dark), layout, tablet and phone breakpoints |
| `main.js` | Section switching by URL hash, theme toggle, Work and Music tabs, rendering the lists |
| `data/projects.json` | Work cards. `status` is `progress`, `upcoming` or `built` |
| `data/music.json` | Recommendations, currently listening to, all-time artists (Spotify IDs) |
| `img/` | The hero photo and the social preview image |
| `404.html` | Page shown for unknown URLs |
| `.github/workflows/deploy.yml` | Publishes to GitHub Pages on every push to `main` |

## Editing content

- **Projects:** edit `data/projects.json`. Leave `url` empty to hide the link.
- **Music:** edit `data/music.json`. Artist links are built from `spotifyArtistId`; a recommendation links to Spotify when `spotifyTrackId` is set.
- **Experience, stack and contact:** edit `index.html` directly.

## Deploying

Pages is set to deploy from GitHub Actions (**Settings → Pages → Source: GitHub Actions**). Merging to `main` runs `deploy.yml` and publishes the folder as it is.

## Fonts

Sentient and Chillax are loaded from [Fontshare](https://www.fontshare.com) under the ITF Free Font License, which does not allow the font files to be shared through a public repository. Keep the font files out of this repo. IBM Plex Sans and IBM Plex Mono come from Google Fonts.
