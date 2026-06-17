# troveski.github.io

Meu blog pessoal, no estilo minimalista dos ensaios do Paul Graham.
Hospedado de graça no GitHub Pages em **https://troveski.github.io**.

## Estrutura

```
index.html        -> página inicial (lista de posts)
sobre.html        -> página "sobre"
style.css         -> todo o visual do site
posts/            -> cada post é um arquivo .html aqui dentro
.nojekyll         -> diz ao GitHub para servir o HTML como está
```

## Como escrever um post novo

1. Copie `posts/o-comeco.html` e renomeie (ex: `posts/minha-ideia.html`).
   Use só letras minúsculas e hífens no nome do arquivo.
2. Abra o arquivo novo e troque o `<title>`, o `<h1>`, a data e o texto.
3. Abra `index.html` e adicione uma linha no topo da lista `<ul class="posts">`:

   ```html
   <li>
     <span class="data-lista">Jul 2026</span>
     <a href="posts/minha-ideia.html">Título do post</a>
   </li>
   ```

4. Publique as mudanças:

   ```bash
   git add .
   git commit -m "novo post: minha ideia"
   git push
   ```

   Em ~1 minuto o site atualiza sozinho.

## Ver o site no seu computador antes de publicar

É só abrir o `index.html` no navegador (clicar duas vezes nele).
Nenhum servidor é necessário.
