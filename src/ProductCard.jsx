import React from 'react'

function ProductCard({ toy, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col">
      <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
        {toy.image ? (
          <img src={`${toy.image}&auto=format&fit=crop&w=600&q=60`} alt={toy.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{toy.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">{toy.description || 'A great toy for kids of all ages.'}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-blue-600 font-bold text-lg">${toy.price.toFixed(2)}</span>
        <span className="text-yellow-500">{'★'.repeat(Math.round(toy.rating || 4))}</span>
      </div>
      <button
        onClick={() => onAdd(toy)}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        disabled={!toy.in_stock}
      >
        {toy.in_stock ? 'Add to cart' : 'Out of stock'}
      </button>
    </div>
  )
}

export default ProductCard
