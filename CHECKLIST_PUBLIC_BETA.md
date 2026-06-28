# CHECKLIST_PUBLIC_BETA.md — PetCare QR

## Lista de verificación para pruebas de beta pública

Marcar con [x] cada ítem antes de publicar o compartir el enlace de la app.

---

## 🔐 Auth

### Registro
- [ ] El formulario de registro acepta nombre, correo y contraseña
- [ ] La contraseña mínima es de 8 caracteres (validado en cliente y servidor)
- [ ] Si el correo ya existe, el mensaje dice: "Ya existe una cuenta con ese correo"
- [ ] El correo se guarda en minúsculas
- [ ] Después de registrarse, se redirige a `/onboarding`

### Login
- [ ] El login acepta correo y contraseña
- [ ] Si las credenciales son incorrectas, muestra: "Correo o contraseña incorrectos"
- [ ] Si hay demasiados intentos, muestra mensaje de espera
- [ ] Después de login exitoso, se redirige a `/hoy`
- [ ] El enlace "¿Olvidaste tu contraseña?" aparece en la pantalla de login

### Logout
- [ ] El botón "Salir" en el TopNav cierra la sesión
- [ ] Después de logout, se redirige a `/login`
- [ ] El usuario no puede volver a páginas privadas sin autenticarse

### Recuperación de contraseña
- [ ] En `/recuperar`, ingresar correo y enviar muestra pantalla de éxito (aunque no exista la cuenta — anti-enumeración)
- [ ] El correo de recuperación llega a la bandeja de entrada
- [ ] El enlace del correo redirige a `/nueva-contrasena`
- [ ] En `/nueva-contrasena`, la nueva contraseña se actualiza correctamente
- [ ] Si las contraseñas no coinciden, muestra error claro
- [ ] Si el enlace expiró, muestra: "El enlace ha expirado o ya fue utilizado"

### Sesión expirada
- [ ] Si la sesión expira, el usuario es redirigido a `/login` al intentar acceder a páginas privadas

---

## 🐾 Mascotas

### Crear mascota
- [ ] El formulario de onboarding crea una mascota correctamente
- [ ] Se puede agregar foto de mascota
- [ ] Todos los campos del perfil se guardan (nombre, raza, especie, peso, cumpleaños, esterilizado/a)

### Cambiar mascota activa
- [ ] Si el usuario tiene múltiples mascotas, puede cambiar entre ellas
- [ ] Al cambiar de mascota, los datos mostrados cambian correctamente
- [ ] Los datos de una mascota no se mezclan con los de otra

### Aislamiento de datos
- [ ] Crear dos cuentas de usuario distintas
- [ ] Agregar datos en la cuenta A
- [ ] Verificar que al iniciar sesión con la cuenta B, no se ven los datos de la cuenta A

---

## 💊 Tratamientos

- [ ] Crear tratamiento temporal (con fecha de fin)
- [ ] Crear tratamiento permanente (sin fecha de fin, muestra badge "Uso permanente")
- [ ] Marcar dosis como dada desde `/hoy`
- [ ] Si stock insuficiente, no permite marcar dosis y muestra error claro
- [ ] Editar tratamiento existente
- [ ] Eliminar tratamiento
- [ ] Filtrar por estado (activo / finalizado)
- [ ] Historial de dosis muestra registros correctamente

---

## 📄 Recetas

- [ ] Crear receta sin archivo (solo texto)
- [ ] Crear receta con imagen (JPG/PNG/WEBP ≤ 5 MB)
- [ ] Crear receta con PDF (≤ 10 MB)
- [ ] Si el archivo es muy grande, muestra error claro
- [ ] Si el tipo de archivo es inválido, muestra error claro
- [ ] Ver/descargar imagen o PDF desde la receta
- [ ] Eliminar receta

---

## 🍖 Alimento

- [ ] Registrar alimento con nombre, marca, tipo, precio
- [ ] Registrar cantidad total y restante con unidad (kg/g)
- [ ] Agregar horarios de comida (HH:MM)
- [ ] Barra de stock muestra porcentaje
- [ ] Alerta visual cuando el stock está bajo
- [ ] Estimación de días restantes es coherente
- [ ] Actualizar cantidad restante desde acción rápida

---

## 🩺 Ficha Médica (Atenciones Veterinarias)

- [ ] Crear atención veterinaria con tipo, fecha, clínica
- [ ] Campo especialidad aparece solo cuando tipo = "Especialidad"
- [ ] Teléfono de clínica es clickeable en mobile (`tel:`)
- [ ] Agregar fecha de próximo control
- [ ] Banner de próximo control más cercano visible en la parte superior
- [ ] Editar atención existente
- [ ] Eliminar atención

---

## 🔬 Exámenes

- [ ] Crear examen sin archivo
- [ ] Crear examen con imagen (≤ 5 MB)
- [ ] Crear examen con PDF (≤ 10 MB)
- [ ] Preview de imagen antes de guardar
- [ ] Ver/descargar imagen o PDF desde el examen (signed URL)
- [ ] Eliminar examen

---

## 🏥 Centros Veterinarios

- [ ] Crear centro veterinario
- [ ] Teléfono es clickeable (`tel:`)
- [ ] Dirección visible
- [ ] Veterinario de referencia
- [ ] Editar centro
- [ ] Eliminar centro

---

## 💉 Vacunas / Desparasitaciones

- [ ] Agregar vacuna
- [ ] Estado correcto: "al día" / "próxima" / "vencida"
- [ ] Badge de color según estado
- [ ] Renovar vacuna
- [ ] Editar vacuna existente
- [ ] Eliminar vacuna

---

## 👤 Perfil de Mascota

- [ ] Todos los campos del perfil son editables
- [ ] Subir/cambiar foto de mascota
- [ ] Alergias, enfermedades crónicas, notas de emergencia se guardan
- [ ] Especie, esterilizado/a, fecha de esterilización visibles
- [ ] Cirugías se pueden agregar, editar y eliminar

---

## 📱 QR

### Activar y ver QR
- [ ] En `/qr-config`, el QR se genera y es visible
- [ ] El botón "Copiar enlace" copia la URL correcta
- [ ] El botón "Compartir" funciona en mobile (Web Share API)
- [ ] Abrir el enlace `/qr/[token]` sin estar logueado muestra la ficha pública

### Privacidad en QR
- [ ] Solo se muestran los datos que el tutor habilitó (alergias, tratamientos, etc.)
- [ ] Si QR está desactivado, la URL muestra: "Ficha no disponible"
- [ ] Los campos desactivados en configuración no aparecen en el QR público

### Regenerar token
- [ ] Regenerar token cambia la URL del QR
- [ ] El link antiguo deja de funcionar (muestra "Ficha no disponible" o 404)
- [ ] El nuevo token genera un QR diferente

---

## 🔒 Seguridad

- [ ] Intentar acceder a `/hoy` sin login redirige a `/login`
- [ ] Intentar acceder a `/dashboard` sin login redirige a `/login`
- [ ] Los datos de usuario A no son visibles para usuario B (RLS activo)
- [ ] El bucket `prescriptions` es privado (no accesible sin autenticación)
- [ ] El bucket `exams` es privado
- [ ] No hay claves privadas en el código del repositorio
- [ ] `.env.local` no está en Git
- [ ] La URL pública del QR usa `public_qr_token`, no el `id` interno de la mascota

---

## 📐 Responsive

### Celular 360px
- [ ] Sin scroll horizontal en ninguna página
- [ ] Botones grandes y fáciles de tocar
- [ ] Formularios en una columna
- [ ] Modales con scroll interno (teclado no tapa botones)
- [ ] Texto legible

### Celular 390px (iPhone)
- [ ] Grid de stats en 2 columnas
- [ ] Cards ordenadas verticalmente
- [ ] QR centrado y grande

### Tablet 768px
- [ ] Sidebar siempre visible
- [ ] Cards en 2 columnas

### Desktop 1366px+
- [ ] Layout de 3+ columnas donde aplica
- [ ] Sidebar visible y organizado por secciones
- [ ] TopNav muestra breadcrumb con nombre de página
- [ ] Contenido no excesivamente ancho (max-w-4xl / max-w-5xl)

---

## ✅ Resultado esperado

- Lint: 0 errores
- Build: exitoso
- Todas las rutas generadas correctamente
- Sin pantallas en blanco
- Sin errores técnicos visibles al usuario final
