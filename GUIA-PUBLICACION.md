# 🚀 Guía de publicación — Calculadora de Costos
### Tu app de papelería en internet, paso a paso

**Tiempo estimado:** 30–45 minutos  
**Costo:** $0 (todos los servicios tienen plan gratuito)  
**Lo que necesitás:** una cuenta de Google y una computadora

---

## Resumen del proceso

```
Tu computadora → GitHub → Vercel (hosting gratis)
                              ↕ sincroniza datos
                          Firebase (base de datos)
```

Cuando termines, vas a tener:
- Una URL pública tipo `mi-papeleria.vercel.app` (gratis) o tu propio dominio
- Login con tu cuenta de Google
- Datos guardados en la nube, accesibles desde cualquier dispositivo
- HTTPS incluido automáticamente

---

## PARTE 1 — Instalar herramientas en tu computadora

### Paso 1 · Instalar Node.js

1. Abrí tu navegador y entrá a **https://nodejs.org**
2. Hacé clic en el botón verde grande que dice **"LTS"** (es la versión estable)
3. Descargá el instalador para tu sistema operativo (Windows o Mac)
4. Ejecutá el instalador y seguí los pasos — dejá todo por defecto, solo hacé clic en "Next" / "Continuar"
5. Cuando termine, **reiniciá tu computadora**

### Paso 2 · Verificar la instalación

1. En Windows: buscá "Command Prompt" o "PowerShell" en el menú inicio y abrilo  
   En Mac: buscá "Terminal" en Spotlight (⌘ + espacio)
2. Escribí esto y presioná Enter:
   ```
   node --version
   ```
3. Tendrías que ver algo como `v20.x.x` — eso significa que funcionó ✅

### Paso 3 · Instalar Git

1. Entrá a **https://git-scm.com/downloads**
2. Descargá e instalá para tu sistema operativo
3. Dejá todas las opciones por defecto durante la instalación

---

## PARTE 2 — Crear tu proyecto en GitHub

GitHub es donde va a vivir el código de tu app.

### Paso 4 · Crear cuenta en GitHub (si no tenés)

1. Entrá a **https://github.com**
2. Hacé clic en "Sign up"
3. Elegí un nombre de usuario, tu email y una contraseña
4. Verificá tu email cuando llegue el mensaje

### Paso 5 · Crear un repositorio nuevo

1. Una vez en GitHub, hacé clic en el botón verde **"New"** (arriba a la izquierda)
2. En "Repository name" escribí: `calculadora-papeleria`
3. Dejalo en **"Public"** (es necesario para el plan gratuito de Vercel)
4. NO marques ninguna casilla adicional
5. Hacé clic en **"Create repository"**
6. Vas a ver una pantalla con instrucciones — **dejala abierta**, la vas a necesitar en el Paso 8

### Paso 6 · Subir tu código

Abrí la Terminal (Mac) o PowerShell (Windows) y ejecutá estos comandos uno por uno.  
Después de cada línea, presioná Enter y esperá que termine antes de escribir la siguiente.

```bash
cd Desktop
```
*(esto te mueve al escritorio — podés elegir otra carpeta si querés)*

```bash
git init calculadora-papeleria
```

```bash
cd calculadora-papeleria
```

Ahora **copiá todos los archivos del proyecto** que te entregué en esta carpeta.  
Los archivos son:
- `package.json`
- `src/App.js`
- `src/index.js`
- `src/firebase.js`
- `public/index.html`
- `.gitignore`
- `firestore.rules`

Una vez copiados, continuá con:

```bash
git add .
```

```bash
git commit -m "Versión inicial calculadora papelería"
```

Ahora volvé a GitHub, copiá la línea que dice `git remote add origin https://github.com/TU_USUARIO/calculadora-papeleria.git` y pegala en la terminal:

```bash
git remote add origin https://github.com/TU_USUARIO/calculadora-papeleria.git
```
*(reemplazá TU_USUARIO con tu nombre de usuario de GitHub)*

```bash
git push -u origin main
```

Si te pide usuario y contraseña de GitHub, ingresalos.

✅ **Listo** — tu código ya está en GitHub.

---

## PARTE 3 — Configurar Firebase (base de datos y login)

### Paso 7 · Crear proyecto en Firebase

1. Entrá a **https://console.firebase.google.com**
2. Hacé clic en **"Crear un proyecto"**
3. Nombre del proyecto: `calculadora-papeleria` (o el nombre que quieras)
4. Desactivá Google Analytics (no lo necesitamos) → Crear proyecto
5. Esperá que cargue y hacé clic en **"Continuar"**

### Paso 8 · Crear la app web en Firebase

1. En la pantalla principal de tu proyecto, hacé clic en el ícono **`</>`** (Web)
2. En "Nombre de la app" escribí: `calculadora`
3. **NO** marques "Firebase Hosting"
4. Hacé clic en **"Registrar app"**
5. Vas a ver un bloque de código con `firebaseConfig`. **Copiá ese bloque completo** — lo necesitás en el siguiente paso

### Paso 9 · Pegar la configuración en tu código

1. Abrí el archivo `src/firebase.js` con cualquier editor de texto (Bloc de Notas en Windows, TextEdit en Mac)
2. Buscá esta sección al inicio:
   ```javascript
   const firebaseConfig = {
     apiKey:            "PEGAR_AQUI_TU_apiKey",
     authDomain:        "PEGAR_AQUI_TU_authDomain",
     ...
   ```
3. Reemplazá cada `"PEGAR_AQUI_..."` con los valores reales que copiaste de Firebase. Tiene que quedar así (con tus propios valores):
   ```javascript
   const firebaseConfig = {
     apiKey:            "AIzaSyABC123...",
     authDomain:        "calculadora-papeleria.firebaseapp.com",
     projectId:         "calculadora-papeleria",
     storageBucket:     "calculadora-papeleria.appspot.com",
     messagingSenderId: "123456789",
     appId:             "1:123456789:web:abc123",
   };
   ```
4. Guardá el archivo

### Paso 10 · Activar Firestore (la base de datos)

1. En Firebase Console, en el menú izquierdo hacé clic en **"Firestore Database"**
2. Hacé clic en **"Crear base de datos"**
3. Elegí **"Comenzar en modo de producción"**
4. Elegí la ubicación más cercana: `southamerica-east1` (São Paulo, la más cercana a Argentina)
5. Hacé clic en **"Habilitar"**

### Paso 11 · Configurar las reglas de seguridad de Firestore

1. En Firestore, hacé clic en la pestaña **"Reglas"**
2. Borrá todo el contenido que hay
3. Copiá y pegá esto exactamente:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarios/{userId}/datos/{document} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. Hacé clic en **"Publicar"**

Esto garantiza que **solo vos** podés leer y escribir tus propios datos.

### Paso 12 · Activar el login con Google

1. En Firebase Console, en el menú izquierdo hacé clic en **"Authentication"**
2. Hacé clic en **"Comenzar"**
3. En la pestaña **"Sign-in method"**, buscá **"Google"** y hacé clic
4. Activá el interruptor para habilitarlo
5. En "Email de soporte del proyecto" poné tu email
6. Hacé clic en **"Guardar"**

---

## PARTE 4 — Publicar la app con Vercel

Vercel es el servicio que convierte tu código en una página web accesible desde cualquier lugar.

### Paso 13 · Crear cuenta en Vercel

1. Entrá a **https://vercel.com**
2. Hacé clic en **"Sign Up"**
3. Elegí **"Continue with GitHub"** — esto conecta automáticamente tus proyectos

### Paso 14 · Importar tu proyecto

1. Una vez en Vercel, hacé clic en **"Add New..."** → **"Project"**
2. Buscá `calculadora-papeleria` en la lista y hacé clic en **"Import"**
3. Vercel detecta automáticamente que es un proyecto React — no cambiés nada
4. Hacé clic en **"Deploy"**
5. Esperá 2-3 minutos mientras construye la app
6. Cuando aparezca la pantalla con ✅ y un preview, ¡tu app está en línea!

### Paso 15 · Anotar tu URL

Vercel te da una URL del tipo `calculadora-papeleria.vercel.app`.  
Hacé clic en **"Visit"** para abrirla — deberías ver la pantalla de login.

### Paso 16 · Autorizar tu dominio en Firebase

Para que el login con Google funcione en tu URL de Vercel, necesitás autorizarla en Firebase.

1. Volvé a **Firebase Console** → **Authentication** → **Sign-in method**
2. Al final de la página buscá **"Dominios autorizados"**
3. Hacé clic en **"Agregar dominio"**
4. Pegá tu URL de Vercel (sin el `https://`), por ejemplo: `calculadora-papeleria.vercel.app`
5. Hacé clic en **"Agregar"**

✅ **¡Tu app está publicada y funcionando!**

---

## PARTE 5 — Dominio propio (opcional)

Si querés una URL personalizada tipo `www.mipapaleria.com` en lugar de `.vercel.app`.

### Paso 17 · Comprar el dominio

**Recomendamos Namecheap** por su precio y simplicidad:

1. Entrá a **https://www.namecheap.com**
2. Buscá el nombre que querés (ej: `mipapeleria`, `costospapeleria`, el nombre de tu marca)
3. Los dominios `.com` cuestan alrededor de USD 10–15 por año
4. Compralo y anotá tus credenciales

### Paso 18 · Conectar el dominio a Vercel

1. En Vercel, entrá a tu proyecto y hacé clic en **"Settings"** → **"Domains"**
2. Escribí tu dominio (ej: `mipapeleria.com`) y hacé clic en **"Add"**
3. Vercel te va a dar dos registros DNS para configurar en Namecheap

### Paso 19 · Configurar los DNS en Namecheap

1. En Namecheap, entrá a tu cuenta → **Domain List** → **Manage** (en tu dominio)
2. Hacé clic en **"Advanced DNS"**
3. Agregá los dos registros que te dio Vercel (tipo A y tipo CNAME)
4. Esperá 15-30 minutos para que se propaguen

### Paso 20 · Agregar el dominio propio a Firebase Auth

Igual que en el Paso 16, agregá tu dominio propio a los dominios autorizados de Firebase Authentication.

---

## PARTE 6 — Actualizaciones futuras

Cada vez que quieras actualizar la app (después de que hagamos mejoras juntas):

1. Copiá los archivos nuevos en tu carpeta del proyecto
2. Abrí la terminal y ejecutá:
   ```bash
   cd Desktop/calculadora-papeleria
   git add .
   git commit -m "Actualización"
   git push
   ```
3. Vercel detecta el cambio automáticamente y publica la nueva versión en 2-3 minutos

---

## 🆘 Problemas frecuentes

**"La pantalla de login aparece pero al hacer clic en Google da error"**  
→ Verificá que hayas completado el Paso 16 (agregar tu URL a dominios autorizados en Firebase)

**"La app carga pero los datos no se guardan"**  
→ Verificá que hayas creado Firestore (Paso 10) y publicado las reglas (Paso 11)

**"git push me pide contraseña y no acepta la de GitHub"**  
→ GitHub ya no acepta contraseñas directas. Creá un "Personal Access Token":  
GitHub → Settings → Developer Settings → Personal access tokens → Generate new token

**"Vercel muestra error en el deploy"**  
→ Verificá que todos los archivos estén en la carpeta correcta y que `firebase.js` tenga tus valores reales (sin los `"PEGAR_AQUI..."`)

---

## 📋 Resumen de servicios y costos

| Servicio | Para qué | Costo |
|----------|----------|-------|
| GitHub | Guardar el código | Gratis |
| Firebase (Spark) | Base de datos + login | Gratis hasta 1GB |
| Vercel (Hobby) | Hosting de la app | Gratis |
| Namecheap | Dominio propio | ~USD 12/año (opcional) |

**El plan gratuito de Firebase es más que suficiente** para el uso personal de esta calculadora. Si algún día superás los límites (muy improbable), el costo es mínimo.

---

## 📞 ¿Necesitás ayuda?

Si en algún paso te trabás, podés volver a esta conversación con Claude y describir exactamente en qué paso estás y qué mensaje de error aparece. Con esa información podemos resolverlo rápido.

---

*Guía generada para la Calculadora de Costos de Papelería — Mayo 2026*
