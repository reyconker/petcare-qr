import { LayoutWrapper } from './LayoutWrapper';
import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let activeDogName = 'Mi Mascota';
  let activeDogPhotoUrl: string | null = null;
  let dogsCount = 1;

  if (user) {
    try {
      const activeDogId = await getDogId();
      const [{ data: dog }, { count }] = await Promise.all([
        supabase.from('dog_profiles').select('name, photo_url').eq('id', activeDogId).single(),
        supabase.from('dog_profiles').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (dog) {
        activeDogName = dog.name;
        activeDogPhotoUrl = dog.photo_url ?? null;
      }
      if (count) dogsCount = count;
    } catch {
      // User might not have a dog yet — handled by getDogId redirect
    }
  }

  return (
    <LayoutWrapper
      activeDogName={activeDogName}
      activeDogPhotoUrl={activeDogPhotoUrl}
      dogsCount={dogsCount}
    >
      {children}
    </LayoutWrapper>
  );
}
