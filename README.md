# Webora 3D Portfolio

Sito portfolio personale in HTML, CSS e JavaScript con hero 3D, particelle, animazioni scroll, pagine caso studio e integrazione Vercel.

## Struttura

```txt
webora-3d/
├─ index.html
├─ locanda-tabina.html
├─ la-femme.html
├─ verdepro.html
├─ style.css
├─ script.js
├─ vercel.json
├─ IMMAGINI/
│  ├─ tabina.jpg
│  ├─ la-femme.png
│  └─ verdepro.png
└─ videos/
   ├─ tabina-prima.mp4
   ├─ tabina-dopo.mp4
   ├─ la-femme-prima.mp4
   ├─ la-femme-dopo.mp4
   └─ verdepro.mp4
```

## Asset da aggiungere

Inserisci le immagini in `IMMAGINI/`:

- `tabina.jpg`
- `la-femme.png`
- `verdepro.png`

Inserisci i video in `videos/`:

- `tabina-prima.mp4`
- `tabina-dopo.mp4`
- `la-femme-prima.mp4`
- `la-femme-dopo.mp4`
- `verdepro.mp4`

## Deploy su GitHub

```bash
git init -b main
git add .
git commit -m "Initial Webora 3D portfolio"
git remote add origin https://github.com/USERNAME/webora-3d.git
git push -u origin main
```

Sostituisci `USERNAME` con il tuo username GitHub e `webora-3d` con il nome reale del repository.

## Deploy su Vercel

1. Accedi a Vercel.
2. Importa il repository GitHub.
3. Lascia il Framework Preset su `Other` o static project.
4. Build Command: vuoto.
5. Output Directory: `.`.
6. Deploy.

Il file `vercel.json` abilita URL puliti, quindi le pagine possono funzionare anche come `/locanda-tabina`, `/la-femme` e `/verdepro`.
