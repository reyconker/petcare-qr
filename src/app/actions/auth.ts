'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ── Helpers ────────────────────────────────────────────────────────────────────

function friendlyLoginError(message: string): string {
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos. Verifica tus datos.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.';
  }
  if (message.includes('too many requests') || message.includes('Too many')) {
    return 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.';
  }
  return 'No se pudo iniciar sesión. Intenta nuevamente.';
}

function friendlyRegisterError(message: string): string {
  if (message.includes('already registered') || message.includes('User already registered')) {
    return 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?';
  }
  if (message.includes('Password should be at least') || message.includes('weak_password')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (message.includes('Invalid email') || message.includes('invalid_email')) {
    return 'Ingresa un correo electrónico válido.';
  }
  if (message.includes('Signups not allowed')) {
    return 'El registro de nuevas cuentas está temporalmente desactivado.';
  }
  return message;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Completa todos los campos.'));
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(friendlyLoginError(error.message)));
  }

  revalidatePath('/', 'layout');
  redirect('/hoy');
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('name') ?? '').trim();

  if (!email || !password || !fullName) {
    return redirect('/register?error=' + encodeURIComponent('Completa todos los campos.'));
  }

  if (password.length < 8) {
    return redirect('/register?error=' + encodeURIComponent('La contraseña debe tener al menos 8 caracteres.'));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(friendlyRegisterError(error.message)));
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!email) {
    return redirect('/recuperar?error=' + encodeURIComponent('Ingresa tu correo electrónico.'));
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/nueva-contrasena`,
  });

  if (error) {
    // Don't reveal if email exists — generic success always
    console.error('Password reset error:', error.message);
  }

  // Always redirect to success to avoid email enumeration
  redirect('/recuperar?sent=1');
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!password || password.length < 8) {
    return redirect('/nueva-contrasena?error=' + encodeURIComponent('La contraseña debe tener al menos 8 caracteres.'));
  }

  if (password !== confirm) {
    return redirect('/nueva-contrasena?error=' + encodeURIComponent('Las contraseñas no coinciden.'));
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect('/nueva-contrasena?error=' + encodeURIComponent('No se pudo actualizar la contraseña. El enlace puede haber expirado.'));
  }

  revalidatePath('/', 'layout');
  redirect('/hoy?msg=Contraseña actualizada exitosamente.');
}
