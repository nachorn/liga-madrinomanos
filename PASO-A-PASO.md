# Liga Madrinomanos – Paso a paso: repo + actualización automática

Sigue estos pasos en orden. Al terminar, cada vez que hagas cambios y los subas al repo, la web se actualizará sola.

---

## Paso 1: Tener Git instalado

1. Abre **PowerShell** (Windows) o **Terminal** (Mac).
2. Escribe: `git --version` y pulsa Enter.
3. **Si sale un número de versión** (ej. `git version 2.43.0`) → pasa al Paso 2.
4. **Si dice que el comando no existe** → instala Git:
   - **Windows:** https://git-scm.com/download/win → descarga, instala (siguiente, siguiente).
   - **Mac:** En Terminal: `xcode-select --install` o instala desde https://git-scm.com/download/mac.
5. Cierra y vuelve a abrir PowerShell/Terminal. Vuelve a probar `git --version`.

---

## Paso 2: Cuenta en GitHub

1. Entra en **https://github.com**.
2. Si no tienes cuenta: **Sign up** (email, contraseña, nombre de usuario).
3. Inicia sesión.

---

## Paso 3: Crear un repositorio nuevo en GitHub

1. Arriba a la derecha: clic en el **+** → **New repository**.
2. **Repository name:** por ejemplo `liga-madrinomanos` (todo junto, minúsculas).
3. **Description:** opcional, ej. “Pronósticos Real Madrid”.
4. Elige **Public**.
5. **No marques** “Add a README file” (el proyecto ya tiene archivos).
6. Clic en **Create repository**.
7. Dejarás esa página abierta; verás algo como “…or push an existing repository from the command line”. Lo usaremos en el Paso 5.

---

## Paso 4: Abrir la carpeta del proyecto en la terminal

1. Abre **PowerShell** (Windows) o **Terminal** (Mac).
2. Ve a la carpeta del proyecto. Pega **una** de estas líneas (ajusta la ruta si tu carpeta está en otro sitio):

   **Windows (PowerShell):**
   ```powershell
   cd "C:\Users\nacho\Desktop\Cursor Projects\App 1 Real Madrid"
   ```

   **Mac (Terminal):**
   ```bash
   cd "/Users/TuUsuario/Desktop/Cursor Projects/App 1 Real Madrid"
   ```
   (Cambia `TuUsuario` por tu nombre de usuario de Mac.)

3. Pulsa Enter. Comprueba que estás en la carpeta correcta:
   ```bash
   dir
   ```
   (Windows) o
   ```bash
   ls
   ```
   (Mac). Deberías ver `index.html`, `app.js`, `styles.css`, etc.

---

## Paso 5: Inicializar Git y subir el proyecto a GitHub

Copia y pega **cada bloque** en la terminal y pulsa Enter después de cada uno. Si te pide usuario/contraseña, usa tu cuenta de GitHub.

**5.1 – Inicializar el repo y añadir archivos**
```bash
git init
git add index.html styles.css app.js manifest.json
git add README.md HOSTING.md IOS-HOMESCREEN.md PLATFORMS.md PASO-A-PASO.md
git add desktop/
git add .gitignore
```

**5.2 – Primer commit**
```bash
git commit -m "Liga Madrinomanos - primera version"
```

**5.3 – Conectar con GitHub y subir**

Sustituye `TU-USUARIO` por tu nombre de usuario de GitHub y `liga-madrinomanos` por el nombre del repo si lo cambiaste:

```bash
git remote add origin https://github.com/TU-USUARIO/liga-madrinomanos.git
git branch -M main
git push -u origin main
```

- Si te pide **usuario y contraseña:** en “Password” no uses la contraseña de GitHub; usa un **Personal Access Token**. Para crearlo: GitHub → tu foto (arriba derecha) → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token** → nombre “liga” → marcar **repo** → Generate → **copia el token** y pégalo donde pide la contraseña.
- Si todo va bien, al final verás algo como “Branch 'main' set up to track remote branch 'main'”.

---

## Paso 6: Activar GitHub Pages (para que la app tenga URL y se actualice sola)

1. En el navegador, abre tu repo: `https://github.com/TU-USUARIO/liga-madrinomanos`.
2. Arriba: pestaña **Settings** (no “Code”).
3. En el menú de la izquierda, baja hasta **Pages** (en “Code and automation” o “Build and deployment”).
4. En **Source** (o “Build and deployment”): elige **Deploy from a branch**.
5. En **Branch:** elige `main` y carpeta **/ (root)**. Clic en **Save**.
6. Espera 1–2 minutos. Arriba de la sección Pages verás algo como: “Your site is live at **https://TU-USUARIO.github.io/liga-madrinomanos/**”.

Esa es la URL de tu app. Ábrela en el móvil y usa “Añadir a la pantalla de inicio” si quieres el icono.

---

## Paso 7: Cómo actualizar la web cuando cambies algo

Cada vez que edites archivos (en Cursor o donde sea) y quieras que la web se actualice:

1. Abre PowerShell/Terminal y ve a la carpeta del proyecto (como en Paso 4):
   ```powershell
   cd "C:\Users\nacho\Desktop\Cursor Projects\App 1 Real Madrid"
   ```
2. Ejecuta:
   ```bash
   git add index.html styles.css app.js
   ```
   (o `git add .` si cambiaste más archivos)
3. Luego:
   ```bash
   git commit -m "Descripcion del cambio"
   ```
4. Por último:
   ```bash
   git push
   ```
5. En 1–2 minutos la URL de GitHub Pages tendrá la nueva versión. Quien tenga la app en el móvil verá los cambios al volver a abrir el icono.

---

## Resumen rápido

| Paso | Qué haces |
|------|-----------|
| 1 | Comprobar/instalar Git |
| 2 | Tener cuenta en GitHub |
| 3 | Crear repo nuevo (sin README) |
| 4 | Abrir la carpeta del proyecto en la terminal |
| 5 | `git init` → `git add` → `git commit` → `git remote add origin` → `git push` |
| 6 | En GitHub: Settings → Pages → Deploy from branch `main` |
| 7 | Para actualizar: `git add` → `git commit` → `git push` |

Si en algún paso te sale un mensaje de error, cópialo y búscalo en Google o pégalo aquí y te ayudo a interpretarlo.
