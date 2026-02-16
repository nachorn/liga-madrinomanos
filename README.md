# Liga Madrinomanos

App local para el grupo de WhatsApp **Madrinomanos**: pronósticos de **resultado final**, **resultado al descanso** y **1.º / 2.º / 3.º goleador** en cada partido del Real Madrid. Los puntos los configura el admin en cada partido.

## Cómo usar (sin instalar nada)

1. **Abrir la app**  
   Haz doble clic en `index.html` o ábrelo con el navegador.  
   Todo funciona en el navegador y los datos se guardan en **localStorage** (como un Excel local).

2. **Participantes**  
   En la primera pestaña, pega un nombre por línea (~30 personas del grupo) y pulsa **Guardar participantes**.

3. **Añadir partido**  
   En **Partidos y puntos**, rellena:
   - Rival (ej. Barcelona)
   - Fecha
   - Puntos por cada acierto (final, descanso, 1.º, 2.º, 3.º goleador).  
   Puedes cambiar estos valores en cada partido.  
   Pulsa **Añadir partido**.

4. **Introducir pronósticos**  
   En **Pronósticos**, elige el partido y rellena la tabla (resultado final RM–Rival, descanso, goleadores).  
   Pulsa **Guardar pronósticos**.

5. **Poner resultado**  
   En **Poner resultado**, elige el partido e introduce el resultado real (final, descanso y goleadores).  
   Pulsa **Guardar resultado y calcular puntos**.  
   Los puntos se calculan solos con los valores que hayas puesto para ese partido.

6. **Clasificación**  
   En **Clasificación** ves los puntos totales. En el desplegable puedes ver **Todos los partidos** o uno solo.

## Datos

- **Se guardan solo en el dispositivo** donde abres la app (ordenador o móvil): en el navegador (localStorage). No se envían a ningún servidor ni hace falta cuenta.
- En el **iPhone** (o Android), si abres la app desde una URL y la añades a la pantalla de inicio, los datos quedan **en el propio teléfono**; no dependes del ordenador. Ver **IOS-HOMESCREEN.md** y **HOSTING.md**.
- Para hacer copia de seguridad en el PC: herramientas de desarrollador del navegador → Application → Local Storage.

## Detalles

- Los nombres de goleadores se comparan sin importar mayúsculas.
- Puedes borrar un partido en **Partidos y puntos** (se borran también sus pronósticos y resultado).

## Mac, Windows, móvil (iOS/Android)

La misma app funciona en **Mac y Windows** (abriendo `index.html` en el navegador). Si quieres una ventana de escritorio con icono, en la carpeta `desktop/` tienes una versión con Electron (Mac + Windows). Para **móvil** y más opciones, mira **PLATFORMS.md**.  
**¿Quieres el icono en el iPhone y que todo quede guardado en el móvil sin depender del ordenador?** → Sube la app una vez (ver **HOSTING.md**) y luego **IOS-HOMESCREEN.md** para añadirla a la pantalla de inicio.  
**¿Quieres que la web se actualice sola cuando cambies el código?** → Conecta el proyecto a un repo de GitHub y despliega con GitHub Pages o Netlify; cada `git push` actualizará la URL. Guía paso a paso: **PASO-A-PASO.md** (ver **HOSTING.md**, sección “Conectar un repo”).

¡A disfrutar la temporada! Hala Madrid.
