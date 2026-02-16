# Liga Madrinomanos – App de escritorio (Mac / Windows)

Misma app que al abrir `index.html` en el navegador, pero en una ventana propia, sin pestañas del navegador.

## Requisitos

- **Node.js** instalado (https://nodejs.org). Sirve para Mac y para Windows.

## Uso rápido (sin crear instalador)

1. Abre una terminal en esta carpeta (`desktop/`).
2. Instala dependencias (solo la primera vez):

   ```bash
   npm install
   ```

3. Arranca la app:

   ```bash
   npm start
   ```

Se abrirá una ventana con la Liga Madrinomanos. Los datos se guardan en el navegador interno (localStorage), igual que en la versión web. Copiar/pegar para WhatsApp funciona igual.

## Crear instalador (opcional)

Para generar un .exe (Windows) o .app / .dmg (Mac):

1. En esta carpeta:

   ```bash
   npm install
   npm run dist
   ```

2. Los instaladores quedarán en `desktop/dist/`:
   - **Windows:** `.exe` (instalador o portable).
   - **Mac:** `.dmg` o `.zip` con la app.

Puedes pasar la carpeta del proyecto (o solo los instaladores de `dist/`) al admin; en Mac ejecuta la app, en Windows el .exe. Misma app, mismo comportamiento local y mismo botón de copiar para WhatsApp.
