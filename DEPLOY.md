# PetCare QR - Guía de Despliegue en Vercel

## 1. Configuración de Supabase

1. Crear un proyecto nuevo en [Supabase](https://supabase.com).
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`.
   * Esto creará todas las tablas (`dog_profiles`, `treatments`, `dose_history`, `vaccines`, `recipes`, `food_control`).
   * Activará **Row Level Security (RLS)** y sus políticas protectoras.
   * Configurará la tabla `storage.buckets` con dos buckets:
     * `petcare-public` (Público): Para las fotos de perfil de las mascotas.
     * `petcare-private` (Privado): Para las recetas médicas y documentos sensibles (solo accesibles por el dueño usando URLs firmadas temporales).
3. Obtener las credenciales del proyecto:
   * **Project URL**: `https://<PROJECT_ID>.supabase.co`
   * **Anon/Public Key**: `eyJhbG...`
   * (NUNCA exponer la `service_role key` en el cliente ni en Vercel si no es estrictamente necesario en el backend, la app actual solo usa la `anon key`).

## 2. Preparación Local

Asegúrate de que el archivo `.env.local` luzca así y funcione localmente antes de desplegar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_LLAVE_ANONIMA
```

> **IMPORTANTE:** No debes subir `.env.local` al repositorio git.

## 3. Despliegue en Vercel

1. Entra a [Vercel](https://vercel.com) e inicia sesión.
2. Haz click en **Add New... > Project**.
3. Selecciona tu repositorio de GitHub `petcare-qr`.
4. En **Environment Variables**, añade:
   * `NEXT_PUBLIC_SUPABASE_URL` = (tu URL)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu KEY)
5. Haz click en **Deploy**.
6. Espera a que termine la compilación y prueba tu nueva URL (ej: `petcare-qr.vercel.app`).

## 4. Pruebas Post-Despliegue

Sigue el archivo `CHECKLIST_BETA_PUBLICA.md` para probar:
* Creación de usuario y mascota
* Subida de fotos (verifica que el Storage funcione correctamente)
* Generación del link del QR público y escaneo desde un dispositivo móvil.
