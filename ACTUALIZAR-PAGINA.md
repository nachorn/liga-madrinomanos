# La página no se actualiza después de un push

Sigue estos pasos en orden:

---

## Si abres la app desde el icono en el iPhone (PWA)

En la **cabecera de la app** (arriba a la derecha) hay un botón **🔄**. Pulsa ese botón para **actualizar** y cargar la última versión. Así puedes refrescar aunque no tengas la barra del navegador.

---

## 1. Forzar recarga en el navegador (lo más habitual)

El navegador suele guardar la versión antigua en caché.

- **Windows:** `Ctrl + F5` o `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

O abre la URL en una **ventana de incógnito/privada** (Ctrl+Shift+N en Chrome) para cargar la versión nueva.

**URL de la app:** https://nachorn.github.io/liga-madrinomanos/

---

## 2. Comprobar que GitHub tiene el último commit

1. Entra en https://github.com/nachorn/liga-madrinomanos
2. Mira la lista de archivos y la fecha del último commit (arriba).
3. Si acabas de hacer push, debería aparecer el commit de hace unos segundos/minutos.

Si el último commit no es el tuyo, haz de nuevo `git push` desde la carpeta del proyecto.

---

## 3. Tiempo de despliegue en GitHub Pages

Después de un push, GitHub Pages puede tardar **1–5 minutos** (a veces algo más) en servir la versión nueva. Si has hecho un hard refresh y sigue saliendo la versión antigua, espera 2–3 minutos y vuelve a probar con `Ctrl + F5`.

---

## 4. Comprobar la configuración de Pages

1. En el repo: **Settings** → **Pages** (menú izquierdo).
2. En **Build and deployment** → **Source** debe estar **Deploy from a branch**.
3. **Branch** debe ser `main` y la carpeta **/ (root)**.

Si algo estaba mal, corrígelo y guarda; el sitio puede tardar un par de minutos en actualizarse.

---

## 5. En el móvil (si la tienes en la pantalla de inicio)

Si abres la app desde el icono en el iPhone/Android, también puede estar usando caché. Cierra la pestaña o la “app” por completo y vuelve a abrir el icono. Si sigue igual, abre la misma URL en Safari/Chrome **dentro del navegador** (no desde el icono) y haz recarga forzada; luego vuelve a usar el icono.

---

**Resumen:** En la mayoría de casos basta con **Ctrl + F5** (o Cmd + Shift + R en Mac) en la URL https://nachorn.github.io/liga-madrinomanos/
