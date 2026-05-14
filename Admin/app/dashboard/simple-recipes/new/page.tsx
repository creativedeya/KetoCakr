'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleRecipeForm from '../components/SimpleRecipeForm';

export default function NewSimpleRecipePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/simple-recipes"
            className="text-gray-400 hover:text-gray-600 text-sm">
            ← Simple Recipes
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">New Simple Recipe</h1>
        </div>

        <SimpleRecipeForm
          onSaved={(id) => router.push(`/dashboard/simple-recipes/${id}`)}
        />
      </div>
    </div>
  );
}
