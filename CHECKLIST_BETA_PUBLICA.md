# Checklist de Verificación - PetCare QR (Lanzamiento Público)

## Autenticación
- [ ] Crear usuario nuevo
- [ ] Iniciar sesión
- [ ] Cerrar sesión
- [ ] Validar que páginas privadas redirigen a login sin sesión

## Mascotas
- [ ] Crear mascota desde Onboarding
- [ ] Editar foto de mascota usando subida real (JPG/PNG)
- [ ] Cambiar mascota activa (si hay más de 1)
- [ ] Verificar aislamiento de datos (Data isolation - RLS)

## Tratamientos y Dosis
- [ ] Crear tratamiento
- [ ] Editar tratamiento
- [ ] Marcar dosis como dada
- [ ] Evitar duplicados (window de 80%)
- [ ] Verificar que descuenta el stock correctamente

## Alimento
- [ ] Registrar alimento
- [ ] Actualizar alimento
- [ ] Confirmar alerta de alimento bajo en Dashboard (< 7 días)

## Imágenes y Storage (Dual Bucket)
- [ ] Editar foto de perfil y verificar que sube a `petcare-public` (la URL empieza con http)
- [ ] Subir receta adjuntando una imagen y verificar que sube a `petcare-private`
- [ ] Verificar que la imagen de la receta se visualiza en la app (generación de Signed URL)
- [ ] Intentar acceder a la ruta privada de la receta sin autorización (debe dar error)
- [ ] Asociar receta a tratamiento

## Vacunas
- [ ] Crear vacuna
- [ ] Verificar que el estado (vencida/próxima/al día) se muestra bien

## QR Público
- [ ] Activar QR
- [ ] Leer QR en modo incógnito (verificar que se muestran datos públicos)
- [ ] Desactivar QR (verificar mensaje "Ficha no disponible")
- [ ] Regenerar Token (verificar que URL anterior devuelve 404, y nueva funciona)

## Privacidad y Seguridad
- [ ] RLS policies `WITH CHECK` activas en la BD
- [ ] Rutas públicas de términos de servicio y privacidad operativas
- [ ] Solo `public_qr_token` visible en las URLs compartidas

## Mobile UI
- [ ] Menú hamburguesa funciona
- [ ] Modales se ven bien y no desbordan
- [ ] Tablas sin scroll horizontal excesivo (responsive)
