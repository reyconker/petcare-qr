# DEPLOY.md — PetCare QR

## Guía de despliegue a producción

---

## 1. Prerequisitos

- Cuenta en [Supabase](https://supabase.com) con proyecto creado
- Cuenta en [Vercel](https://vercel.com) con repositorio conectado
- Node.js 18+ / npm

---

## 2. Variables de entorno

Copia `.env.local.example` como `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública (ANON key) | Supabase → Project Settings → API |
| `NEXT_PUBLIC_APP_URL` | URL base de la app | Tu dominio de Vercel o `http://localhost:3000` |

> **NUNCA** uses la `service_role` key en el frontend. Solo usa la `anon` key.

En Vercel: **Project → Settings → Environment Variables**

---

## 3. Migraciones SQL — Ejecutar en Supabase SQL Editor

Ejecuta en orden:

### 3.1 `supabase/migrations/phase1_quick_wins.sql`
- `treatments.is_permanent`
- `dog_profiles.species`, `is_neutered`, `neuter_date`, `surgeries`, `emergency_notes`
- `dog_profiles.qr_show_food`

### 3.2 `supabase/migrations/phase2_veterinary_feedback.sql`
- Columnas nuevas de `food_control`
- Tabla `veterinary_visits` + RLS
- Tabla `exams` + RLS
- Tabla `veterinary_centers` + RLS

### 3.3 `supabase/migrations/security_rls_review.sql`
- Habilitar RLS en todas las tablas
- Políticas de acceso por usuario

---

## 4. Supabase Storage — Buckets necesarios

Crear en **Supabase → Storage → New Bucket**:

### Bucket: `prescriptions`
- **Public:** OFF (privado)
- **Límite:** 10 MB
- **MIME types:** `image/jpeg, image/png, image/webp, application/pdf`

### Bucket: `exams`
- **Public:** OFF (privado)
- **Límite:** 10 MB
- **MIME types:** `image/jpeg, image/png, image/webp, application/pdf`

#### Storage Policies (agregar en Supabase → Storage → Policies):

```sql
-- Para cada bucket (reemplaza BUCKET_NAME por 'prescriptions' o 'exams'):

CREATE POLICY "Owner upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'BUCKET_NAME' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'BUCKET_NAME' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'BUCKET_NAME' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 5. Configuración de Supabase Auth

### 5.1 Recovery URL (recuperación de contraseña) — OBLIGATORIO

En **Supabase → Authentication → URL Configuration**:

```
Site URL:      https://tu-app.vercel.app
Redirect URLs: https://tu-app.vercel.app/auth/callback
               https://tu-app.vercel.app/nueva-contrasena
```

> Sin esto, los enlaces de recuperación de contraseña no funcionarán.

### 5.2 Configuración mínima

| Opción | Valor |
|---|---|
| Enable email signup | ON |
| Minimum password length | 8 |
| JWT expiry | 3600 (1 hora) |

---

## 6. Deploy en Vercel

```bash
npm install
npm run build      # Verificar sin errores
npx vercel --prod  # Deploy
```

Una vez conectado el repositorio, cada push a `main` dispara deploy automático.

---

## 7. Verificación post-deploy

- [ ] Login / Register funcionan
- [ ] Recuperar contraseña envía correo (requiere configurar Site URL)
- [ ] El enlace del email redirige a `/nueva-contrasena`
- [ ] El QR público funciona (`/qr/[token]`)
- [ ] Subir imagen/PDF en Recetas funciona
- [ ] Subir imagen/PDF en Exámenes funciona
- [ ] Los datos de un usuario NO son visibles para otro

---

## 8. Comandos útiles

```bash
npm run lint     # Verificar código
npm run build    # Build de producción
npm run dev      # Desarrollo local
```

---

## 9. Estructura de archivos

```
petcare-qr/
├── .env.local              # Privado — NO subir a Git
├── .env.local.example      # Plantilla pública
├── .gitignore              # Incluye .env*
├── DEPLOY.md               # Esta guía
├── CHECKLIST_PUBLIC_BETA.md
└── supabase/migrations/
    ├── phase1_quick_wins.sql
    ├── phase2_veterinary_feedback.sql
    └── security_rls_review.sql
```
