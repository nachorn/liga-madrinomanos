# Subir Liga Madrinomanos para usarla sin ordenador (iOS/Android)

Si subes la app a un sitio gratuito, puedes abrirla desde el **móvil** con una URL fija y añadirla a la pantalla de inicio. **Todos los datos se guardan en el propio teléfono**; no hay base de datos en el servidor ni dependencia del ordenador.

---

## Qué archivos subir

Incluye solo estos archivos (en la raíz del proyecto):

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `logo.svg.png` (logo del Real Madrid en la cabecera)

No hace falta subir las carpetas `desktop/` ni los `.md` para que funcione la app en el navegador.

---

## Netlify Drop (lo más rápido)

1. Ve a **https://app.netlify.com/drop**
2. Arrastra la carpeta del proyecto (o una carpeta que contenga solo los 4 archivos de arriba) a la zona de “drop”.
3. Te darán una URL tipo `https://nombre-random.netlify.app`. Esa es la dirección de tu app.
4. En el iPhone/Android: abre esa URL en Safari/Chrome → Compartir → “Añadir a la pantalla de inicio”.

Opcional: en Netlify (si creas cuenta) puedes cambiar el nombre del sitio para una URL más corta.

---

## GitHub Pages

1. Crea un repositorio en GitHub (ej. `liga-madrinomanos`).
2. Sube `index.html`, `styles.css`, `app.js` y `manifest.json` a la **raíz** del repo (o en una carpeta; la URL cambiará).
3. En el repo: **Settings → Pages** → Source: “Deploy from a branch” → rama `main` (o `master`) → carpeta “/ (root)” → Save.
4. La URL será `https://tu-usuario.github.io/liga-madrinomanos/` (o con la carpeta que hayas usado).
5. En el móvil: abre esa URL → Añadir a la pantalla de inicio.

---

## Privacidad y datos

- El servidor (Netlify/GitHub) solo **sirve** los archivos (HTML/CSS/JS). No recoge ni guarda participantes, pronósticos ni resultados.
- Esos datos se guardan **solo en el navegador del dispositivo** (localStorage) que abras la URL. Cada móvil/ordenador tiene su propia copia.
- Si borras los datos del sitio en el navegador o desinstalas, se pierde esa copia local. No hay sincronización automática entre dispositivos.

Así la app queda **independiente del ordenador**: una vez subida, la usas desde el icono del móvil y todo permanece en el teléfono.

---

## Conectar un repo para que se actualice solo al hacer push

Si subes el proyecto a **GitHub** y conectas ese repo con Netlify o usas GitHub Pages, cada vez que hagas **push** (subir cambios) la web se desplegará de nuevo y la URL tendrá la versión actualizada.

### 1. Crear el repo y subir el proyecto

En la carpeta del proyecto (en la terminal):

```bash
git init
git add index.html styles.css app.js manifest.json
git add README.md HOSTING.md IOS-HOMESCREEN.md PLATFORMS.md
git add desktop/
git commit -m "Liga Madrinomanos – primera versión"
```

Crea un repositorio nuevo en **GitHub** (por ejemplo `liga-madrinomanos`), sin README. Luego:

```bash
git remote add origin https://github.com/TU-USUARIO/liga-madrinomanos.git
git branch -M main
git push -u origin main
```

(Si ya tienes repo y solo quieres conectar, usa `git remote add origin ...` y `git push`.)

### 2. Opción A: GitHub Pages (se actualiza con cada push)

1. En el repo de GitHub: **Settings → Pages**.
2. **Source:** “Deploy from a branch”.
3. **Branch:** `main` (o `master`) → carpeta **/ (root)** → Save.
4. En 1–2 minutos la URL `https://TU-USUARIO.github.io/liga-madrinomanos/` estará activa.
5. Cada vez que hagas `git push`, GitHub vuelve a desplegar y la web se actualiza sola.

### 2. Opción B: Netlify conectado al repo (se actualiza con cada push)

1. Entra en **https://app.netlify.com** e inicia sesión (puedes usar “Log in with GitHub”).
2. **Add new site → Import an existing project** → **Deploy with GitHub**.
3. Autoriza Netlify y elige el repo `liga-madrinomanos` (o el nombre que le hayas puesto).
4. **Build settings:**  
   - Build command: déjalo vacío (no hace falta compilar).  
   - Publish directory: `.` (raíz del repo).  
5. **Deploy site**.
6. Netlify te dará una URL (ej. `https://liga-madrinomanos.netlify.app`).  
7. A partir de ahora, cada **push** a la rama que hayas elegido (p. ej. `main`) hará que Netlify vuelva a desplegar y la web se actualice sola.

**Para "Cargar partidos desde la web":** Si usas **GitHub Pages**: entra en la app → Importar partidos → pega tu API key de [football-data.org](https://www.football-data.org/client/register) (gratis) y pulsa "Guardar key". Si usas **Netlify**: puedes poner la key en **Site configuration → Environment variables** (`FOOTBALL_DATA_API_KEY`) y la función en `netlify/functions/` la usará; así los usuarios no la ven.

### Resumen

| Dónde está desplegada | Qué hacer para actualizar |
|------------------------|---------------------------|
| **GitHub Pages**       | `git add ...` → `git commit` → `git push` → en 1–2 min la URL tiene la nueva versión. |
| **Netlify (repo conectado)** | Igual: `git push` → Netlify detecta el cambio y redespliega. |

Los usuarios que tengan la app en la pantalla de inicio del móvil verán la nueva versión la próxima vez que abran el icono (el navegador puede cachear; si no ven cambios, cerrar la pestaña y volver a abrir el icono).
