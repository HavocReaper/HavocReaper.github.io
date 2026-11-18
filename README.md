# Love Pratap — Security Analyst Portfolio

A clean, responsive, single-page portfolio built from Love Pratap's resume. Pure HTML, CSS and JavaScript — no build step, no dependencies. Deploy it free with GitHub Pages.

## What's inside

```
love-pratap-portfolio/
├── index.html          # All page content and sections
├── css/style.css       # Design system, layout, responsive rules
├── js/main.js          # Typing effect, scroll reveals, nav, copy-to-clipboard
├── assets/profile.jpg  # Profile photo (swap with your own)
└── README.md
```

## Sections

- Hero with animated role text and terminal-style profile card
- About + areas of expertise
- Skills grouped by tooling, domains, languages and vulnerability focus
- Experience timeline (3 roles + internship)
- Projects and certifications
- Education
- Contact with copy-to-clipboard email
- Print-friendly stylesheet

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
cd love-pratap-portfolio
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy to GitHub Pages

1. Create a new repository on GitHub, e.g. `love-pratap-portfolio`.
2. Push this folder to the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git remote add origin https://github.com/<your-username>/love-pratap-portfolio.git
   git branch -M main
   git push -u origin main
   ```

3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
5. Save. Your site will be live at `https://<your-username>.github.io/love-pratap-portfolio/`.

> Tip: name the repository `<your-username>.github.io` to publish at the root domain instead.

## Customize

- **Content**: edit the text directly in `index.html`. All resume data is in plain HTML.
- **Colors**: change the CSS variables at the top of `css/style.css` (`--accent`, `--accent-2`, etc.).
- **Photo**: replace `assets/profile.jpg` with your own square image (600×600 or larger).
- **Links**: update the LinkedIn, GitHub and email URLs in `index.html` (search for `linkedin.com`, `github.com`, `mailto:`).

## License

Feel free to use this as a starting point for your own portfolio.
