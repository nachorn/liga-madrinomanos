# Liga Madrinomanos en el iPhone (pantalla de inicio)

**Sí: los datos se guardan en el propio teléfono.** La app usa el almacenamiento del navegador (localStorage) del iPhone: participantes, partidos, pronósticos y clasificación quedan en el dispositivo. No hace falta ordenador ni cuenta en la nube.

Para poder usar “Añadir a la pantalla de inicio” en iOS, la app tiene que abrirse desde una **dirección web** (no desde un archivo local). La forma más sencilla y **independiente del ordenador** es subir la app una vez a un sitio gratuito y usar esa dirección en el iPhone.

---

## Opción recomendada: Subir la app y usar solo el móvil (sin ordenador)

Así el iPhone no depende de ningún PC/Mac. Los datos se guardan solo en el teléfono.

### Paso 1: Subir la app (solo una vez)

Elige una de estas dos (gratis, sin servidor propio):

#### A) Netlify Drop (muy rápido)

1. Entra en **https://app.netlify.com/drop**
2. Arrastra la **carpeta completa** del proyecto (“App 1 Real Madrid”) a la zona de soltar.
3. Netlify te dará una URL, por ejemplo:  
   `https://algo-random-123.netlify.app`
4. (Opcional) En Netlify puedes cambiar el nombre del sitio para una URL más corta.

#### B) GitHub Pages

1. Crea una cuenta en **GitHub** (github.com) si no tienes.
2. Crea un repositorio nuevo (por ejemplo `liga-madrinomanos`).
3. Sube a ese repo los archivos: `index.html`, `styles.css`, `app.js`, `manifest.json` (la carpeta del proyecto, sin `desktop/` ni `.md` si quieres).
4. En el repo: **Settings → Pages** → Source: “Deploy from a branch” → rama `main` → carpeta `/ (root)` → Save.
5. En unos minutos tendrás una URL:  
   `https://tu-usuario.github.io/liga-madrinomanos/`

### Paso 2: Añadir al iPhone (pantalla de inicio)

1. En el **iPhone**, abre **Safari** y escribe la URL que te dio Netlify o GitHub Pages.
2. Cuando cargue la app, pulsa el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Baja y elige **“Añadir a la pantalla de inicio”**.
4. Pon el nombre (ej. “Madrinomanos”) y **Añadir**.

Listo: tendrás el icono en el escritorio. **Todo se guarda en el iPhone**; no necesitas tener el ordenador encendido. Copiar para WhatsApp funciona igual.

---

## Opción alternativa: Servidor en tu ordenador (misma WiFi)

Solo si no quieres subir la app a internet y prefieres usar tu Mac/PC como servidor:

1. En el **Mac** (Terminal), dentro de la carpeta del proyecto:
   ```bash
   python3 -m http.server 8080
   ```
2. En el **iPhone** (misma WiFi), en Safari: `http://IP-DEL-MAC:8080` (ej. `http://192.168.1.100:8080`).
3. Compartir → “Añadir a la pantalla de inicio”.

En este caso los datos también se guardan en el iPhone, pero **solo podrás abrir la app cuando el ordenador esté encendido y el servidor corriendo**. Por eso la opción recomendada es subir la app (Netlify o GitHub Pages) y usar solo el móvil.

---

## Resumen

| Dónde abres la app | ¿Datos en el móvil? | ¿Dependes del ordenador? |
|--------------------|----------------------|---------------------------|
| URL de Netlify / GitHub Pages | Sí, en el iPhone | No |
| Servidor en tu PC/Mac (IP:8080) | Sí, en el iPhone | Sí (debe estar encendido) |

En ambos casos los datos viven en el **teléfono** (localStorage). La diferencia es si la “dirección” de la app es una web fija (recomendado) o el ordenador de casa.
