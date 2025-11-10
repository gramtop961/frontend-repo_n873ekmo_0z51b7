import { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [toys, setToys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchToys()
  }, [])

  const fetchToys = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (query) params.append('q', query)
      const res = await fetch(`${baseUrl}/api/toys?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load toys')
      const data = await res.json()
      setToys(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (toy) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === toy._id)
      if (existing) {
        return prev.map((i) => i._id === toy._id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...toy, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id))
  }

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shipping = subtotal > 0 ? 5 : 0
    const total = subtotal + shipping
    return { subtotal, shipping, total }
  }, [cart])

  const checkout = async () => {
    if (cart.length === 0) return
    const order = {
      customer_name: 'Guest',
      customer_email: 'guest@example.com',
      customer_address: '123 Demo St',
      items: cart.map((i) => ({
        toy_id: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal: Number(totals.subtotal.toFixed(2)),
      shipping: Number(totals.shipping.toFixed(2)),
      total: Number(totals.total.toFixed(2)),
    }
    try {
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Checkout failed')
      alert(`Order placed! ID: ${data.order_id}`)
      setCart([])
    } catch (e) {
      alert(e.message)
    }
  }

  const seed = async () => {
    try {
      await fetch(`${baseUrl}/api/seed`)
      fetchToys()
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧸</span>
            <h1 className="text-2xl font-bold">Toyland</h1>
          </div>
          <div className="flex-1 max-w-xl mx-6 hidden sm:block">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search toys..."
                className="w-full border rounded-lg px-3 py-2"
              />
              <button onClick={fetchToys} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Search</button>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative px-4 py-2 bg-blue-600 text-white rounded-lg">
            Cart ({cart.reduce((s,i)=>s+i.quantity,0)})
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">All Categories</option>
            <option value="Plush">Plush</option>
            <option value="Educational">Educational</option>
            <option value="STEM">STEM</option>
          </select>
          <button onClick={fetchToys} className="px-3 py-2 border rounded-lg">Filter</button>
          <button onClick={seed} className="ml-auto px-3 py-2 border rounded-lg">Seed sample toys</button>
        </div>

        {loading ? (
          <p>Loading toys...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : toys.length === 0 ? (
          <div className="text-center text-gray-600 py-16">
            <p>No toys found. Try seeding sample toys.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {toys.map((toy) => (
              <ProductCard key={toy._id} toy={toy} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {showCart && (
        <div className="fixed inset-0 bg-black/40 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="w-full max-w-md h-full bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={()=>setShowCart(false)} className="text-gray-500">✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 border rounded-lg p-3">
                    <img src={`${item.image}&auto=format&fit=crop&w=100&q=40`} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button className="px-2 border rounded" onClick={()=>updateQty(item._id,-1)}>-</button>
                        <span>{item.quantity}</span>
                        <button className="px-2 border rounded" onClick={()=>updateQty(item._id,1)}>+</button>
                      </div>
                    </div>
                    <button className="text-red-600" onClick={()=>removeFromCart(item._id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-4 space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${totals.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
              <button onClick={checkout} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Checkout</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-sm text-gray-500 py-6">© {new Date().getFullYear()} Toyland</footer>
    </div>
  )
}

export default App
