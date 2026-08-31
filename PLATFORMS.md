# Liga Madrinomanos – Mac, Windows, iOS y Android

La app es solo HTML/CSS/JS y guarda todo en el navegador (localStorage). Así que **copiar/pegar para WhatsApp** funciona igual en todos los sitios.

---

## Mac y Windows (ordenador)

### Opción A: Abrir en el navegador (ya lo tienes)

- **Windows:** doble clic en `index.html` (se abre en Edge/Chrome por defecto).
- **Mac:** doble clic en `index.html` (se abre en Safari o el navegador por defecto).

Misma carpeta, mismo comportamiento en ambos. No hace falta instalar nada.

### Opción B: App de escritorio (Electron)

Si quieres un “programa” con su icono y ventana (sin barra del navegador):

- En la carpeta del proyecto puedes usar **Electron**: una ventana que muestra tu `index.html`.
- Se puede empaquetar para **Windows** (.exe) y para **Mac** (.app) desde el mismo código.
- Sigue siendo todo local; copiar/pegar para WhatsApp igual.

En el proyecto hay una carpeta `desktop/` con instrucciones para ejecutar o empaquetar con Electron.

---

## iOS y Android (móvil)

Sigue siendo posible mantener todo local y usar copiar/pegar.

### Opción 1: Mismo archivo en el móvil

- **Android:** puedes copiar la carpeta al móvil (Google Drive, USB, etc.) y abrir `index.html` con Chrome. Los datos se guardan en ese navegador (localStorage). Copiar/pegar funciona.
- **iOS:** abrir un `index.html` local es más limitado (seguridad del navegador). Lo más práctico suele ser la opción 2 o 3.

### Opción 2: PWA (“Añadir a la pantalla de inicio”)

La app incluye un **manifest**, icono y service worker para “Añadir a la pantalla de inicio” y volver a abrirla sin conexión. Si la subes a un sitio (GitHub Pages, Netlify, tu propio servidor, etc.):

- En **Android:** entras con Chrome, “Añadir a la pantalla de inicio” → se abre como app, sin barra de direcciones. Sigue siendo tu misma app, localStorage en el móvil, copiar/pegar igual.
- En **iOS:** Safari → Compartir → “Añadir a la pantalla de inicio”. Mismo comportamiento.

Seguiría siendo “local” en el sentido de que los datos están en el navegador del dispositivo; solo necesitas que la URL sea accesible (no hace falta base de datos en servidor).

### Opción 3: App nativa (Capacitor/React Native, etc.)

Se puede empaquetar la misma lógica como app nativa para iOS y Android (tiendas o instalación directa). Es más trabajo (cuentas de desarrollador, builds, etc.) y para tu caso (admin local + copiar/pegar) suele ser suficiente **navegador en escritorio** y, en móvil, **PWA** o **abrir el HTML** en Android.

---

## Resumen

| Plataforma | Recomendación | Copiar/pegar |
|------------|----------------|--------------|
| **Windows** | Abrir `index.html` en el navegador (o app Electron si quieres ventana propia). | Sí |
| **Mac** | Igual que Windows. | Sí |
| **Android** | Abrir `index.html` con Chrome (carpeta en el dispositivo) o PWA si la hosteas. | Sí |
| **iOS** | PWA (“Añadir a pantalla de inicio”) si hosteas la app; o usar la app en un Mac/Windows y pegar en WhatsApp desde ahí. | Sí (en PWA o navegador) |

Todo se puede mantener **local** (datos en el navegador del dispositivo); la única decisión es si el admin usa solo el ordenador (Mac o Windows) o también el móvil, y si quieres o no una “ventana” de escritorio con Electron.
