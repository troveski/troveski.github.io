# troveski.github.io

*Meditations* — a personal blog of short reflections on modern life,
in the minimalist spirit of Paul Graham's essays.
Hosted for free on GitHub Pages at **https://troveski.github.io**.

## Structure

```
index.html        -> home page (list of writing)
about.html        -> the "about" page
style.css         -> all the styling
posts/            -> each piece is one .html file in here
.nojekyll         -> tells GitHub to serve the HTML as-is
```

## How to write a new piece

1. Copy `posts/on-attention.html` and rename it
   (e.g. `posts/on-solitude.html`). Use lowercase and hyphens.
2. Open the new file and change the `<title>`, the `<h1>`, the date,
   and the text.
3. Open `index.html` and add a line at the top of the
   `<ul class="posts">` list:

   ```html
   <li>
     <span class="data-lista">Jul 2026</span>
     <a href="posts/on-solitude.html">On Solitude</a>
   </li>
   ```

4. Publish:

   ```bash
   git add .
   git commit -m "new piece: on solitude"
   git push
   ```

   The site updates itself in about a minute.

## Preview locally

Just open `index.html` in your browser (double-click it).
No server needed.
