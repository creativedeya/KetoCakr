export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">KetoCakR Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Manage recipes, ingredients, and lab notes
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/dashboard/ingredients" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🥑</div>
          <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
          <p className="text-gray-600 text-sm">Manage ingredient database with nutrition data</p>
        </a>

        <a href="/dashboard/base-recipes" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🎂</div>
          <h3 className="text-xl font-semibold mb-2">Base Recipes</h3>
          <p className="text-gray-600 text-sm">Create and edit recipe components</p>
        </a>

        <a href="/dashboard/equipment" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-xl font-semibold mb-2">Equipment Manager</h3>
          <p className="text-gray-600 text-sm">Manage kitchen tools and reference images</p>
        </a>

        <a href="/dashboard/sweeteners" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🍬</div>
          <h3 className="text-xl font-semibold mb-2">Sweeteners</h3>
          <p className="text-gray-600 text-sm">Manage sweetener comparison tool data</p>
        </a>

        <a href="/dashboard/lab-notes" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🧪</div>
          <h3 className="text-xl font-semibold mb-2">Lab Notes</h3>
          <p className="text-gray-600 text-sm">Manage scientific knowledge base</p>
        </a>

        <a href="/dashboard/ingredients/usda-import" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold mb-2">USDA Import</h3>
          <p className="text-gray-600 text-sm">Import nutrition data from FatSecret &amp; USDA</p>
        </a>

        <a href="/dashboard/simple-recipes" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🍩</div>
          <h3 className="text-xl font-semibold mb-2">Simple Recipes</h3>
          <p className="text-gray-600 text-sm">Manage standalone simple recipes with steps</p>
        </a>

        <a href="/dashboard/users" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-xl font-semibold mb-2">User Recipes</h3>
          <p className="text-gray-600 text-sm">View and manage user-created combinations</p>
        </a>

        <a href="/dashboard/settings" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="text-xl font-semibold mb-2">Settings</h3>
          <p className="text-gray-600 text-sm">Configure admin panel settings</p>
        </a>

        <a href="/dashboard/ready-recipes" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🎂</div>
          <h3 className="text-xl font-semibold mb-2">Ready Recipes</h3>
          <p className="text-gray-600 text-sm">Manage assembled ready-to-publish recipes</p>
        </a>

        <a href="/dashboard/dessert-types" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🏷️</div>
          <h3 className="text-xl font-semibold mb-2">Dessert Types</h3>
          <p className="text-gray-600 text-sm">Manage dessert categories and types</p>
        </a>

        <a href="/dashboard/assembly-templates" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-xl font-semibold mb-2">Assembly Templates</h3>
          <p className="text-gray-600 text-sm">Manage step-by-step assembly instructions</p>
        </a>

        <a href="/dashboard/pdf-importer" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-xl font-semibold mb-2">PDF Importer</h3>
          <p className="text-gray-600 text-sm">Import recipes from PDF documents</p>
        </a>

        <a href="/dashboard/analytics" className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">📈</div>
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm">View app usage and recipe statistics</p>
        </a>
      </div>
    </div>
  );
}
