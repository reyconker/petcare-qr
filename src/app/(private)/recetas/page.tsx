import { getDbData } from '@/lib/db';
import { Image as ImageIcon, FileText, Calendar, User, Trash2 } from 'lucide-react';
import { AddRecipeButton, EditRecipeButton, ViewRecipeButton } from './RecipeForms';
import { deleteRecipe } from '@/app/actions/recipes';

export default async function RecetasPage() {
  const data = await getDbData();
  const recipes = data.recipes;
  const treatments = data.treatments.filter(t => t.state === 'activo');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-teal-600" /> Recetas y Órdenes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Imágenes de recetas veterinarias para fácil acceso.</p>
        </div>
        <AddRecipeButton treatments={treatments} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gray-100 relative w-full">
              {recipe.imageUrl ? (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{recipe.title}</h3>
                <div className="flex items-center gap-1">
                  <EditRecipeButton recipe={recipe} treatments={treatments} />
                  <form action={async () => {
                    'use server';
                    await deleteRecipe(recipe.id);
                  }}>
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-teal-600 text-sm font-medium mb-3">{recipe.diagnosis}</p>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {recipe.date}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {recipe.vetName} - {recipe.clinic}
                </div>
                <div className="mt-3 bg-gray-50 p-3 rounded text-xs border border-gray-100">
                  <strong>Indicaciones:</strong><br/>
                  <span className="line-clamp-2">{recipe.instructions}</span>
                </div>
              </div>
              
              <ViewRecipeButton recipe={recipe} />
            </div>
          </div>
        ))}
        
        {recipes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aún no hay recetas guardadas</h3>
            <p className="text-gray-500 mb-6 max-w-md">Digitaliza las órdenes veterinarias tomando una foto o subiéndola para tenerlas siempre a mano.</p>
            <div className="scale-110">
              <AddRecipeButton treatments={treatments} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
