import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI, inventoryAPI, transactionsAPI, paymentMethodsAPI, promotionsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MainLayout from '../components/MainLayout'
import {
  RiSearchLine, RiCameraLine, RiCloseLine, RiAddLine, RiSubtractLine,
  RiDeleteBinLine, RiCheckboxCircleLine, RiAlertLine, RiPrinterLine,
  RiArrowGoBackLine, RiShoppingCartLine
} from 'react-icons/ri'
import { fmt, formatNumberInput, parseFormattedNumber } from '../utils/formatCurrency'

export default function KasirPOSPage() {
  const { user, business } = useAuth()
  const bCode = business?.code
  const queryClient = useQueryClient()
  const searchRef = useRef(null)

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(() => {
    // C2: Restore cart from localStorage on mount
    try {
      const saved = localStorage.getItem('pos_cart') || localStorage.getItem('pos_cart_backup')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) { /* ignore parse errors */ }
    return []
  })
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [amountPaid, setAmountPaid] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [showStockWarning, setShowStockWarning] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [error, setError] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [isValidatingStock, setIsValidatingStock] = useState(false)
  const [sessionRestoredNotice, setSessionRestoredNotice] = useState(false)
  const scannerRef = useRef(null)

  // C2: Persist cart to localStorage on every change
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('pos_cart', JSON.stringify(cart))
    } else {
      localStorage.removeItem('pos_cart')
      localStorage.removeItem('pos_cart_backup')
    }
  }, [cart])

  // Show notice if session was restored after expired
  useEffect(() => {
    if (localStorage.getItem('session_expired') === 'true' && cart.length > 0) {
      setSessionRestoredNotice(true)
      localStorage.removeItem('session_expired')
      localStorage.removeItem('pos_cart_backup')
      setTimeout(() => setSessionRestoredNotice(false), 5000)
    }
  }, [])

  // Fetch products
  const { data: prodData } = useQuery({
    queryKey: ['products-pos', bCode],
    queryFn: () => productsAPI.getProducts({ limit: 500 }),
  })
  const products = (Array.isArray(prodData) ? prodData : (prodData?.results || [])).filter(p => p.is_active)

  // Fetch stock (use batches list, not summary which returns an object)
  const { data: stockData } = useQuery({
    queryKey: ['stock-pos', bCode],
    queryFn: () => inventoryAPI.getBatches({ status: 'ACTIVE', limit: 1000 }),
  })
  const stockMap = {}
  const stockList = Array.isArray(stockData) ? stockData : (stockData?.results || [])
  // Exclude expired batches from stock count -- expired stock cannot be sold
  stockList.filter(s => !s.is_expired).forEach(s => {
    const pid = s.product_id || s.product
    stockMap[pid] = (stockMap[pid] || 0) + (s.quantity || 0)
  })

  // Fetch payment methods
  const { data: pmData } = useQuery({
    queryKey: ['payment-methods-pos', bCode],
    queryFn: paymentMethodsAPI.getMethods,
  })
  const paymentMethods = pmData?.methods || []
  const activeMethods = paymentMethods.filter(m => m.is_active && m.method_type !== 'CASH')
  // Cash selalu ada di posisi pertama (built-in, tidak dari backend)
  const methodOptions = [{ id: 0, method_type: 'CASH', name: 'Tunai' }, ...activeMethods]

  // Fetch active discounts
  const { data: discountsData } = useQuery({
    queryKey: ['active-discounts-pos', bCode],
    queryFn: promotionsAPI.getActiveDiscounts,
  })
  const activeDiscounts = discountsData || []

  // Search results
  const searchResults = search.length >= 1
    ? products.filter(p => {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q))
      }).slice(0, 10)
    : []

  // Barcode Scanner Auto-Add: When Enter is pressed in the search field,
  // attempt to find the product by exact barcode or code match first,
  // then fallback to the first search result. If found, add to cart immediately.
  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter' || !search.trim()) return
    e.preventDefault()

    const query = search.trim().toLowerCase()

    // Priority 1: Exact match on barcode field
    let match = products.find(p => p.barcode && p.barcode.toLowerCase() === query)

    // Priority 2: Exact match on product code
    if (!match) {
      match = products.find(p => p.code.toLowerCase() === query)
    }

    // Priority 3: First item from current search results
    if (!match && searchResults.length > 0) {
      match = searchResults[0]
    }

    if (match) {
      addToCart(match)
    } else {
      setError('Produk tidak ditemukan untuk kode: ' + search.trim())
      setTimeout(() => setError(''), 3000)
      setSearch('')
    }
  }

  // Get available stock for a product (total - already in cart)
  const getAvailableStock = (productId) => {
    const total = stockMap[productId] || 0
    const inCart = cart.find(c => c.product_id === productId)?.quantity || 0
    return total - inCart
  }

  // Add to cart
  const addToCart = (product) => {
    const available = getAvailableStock(product.id)
    if (available <= 0) {
      setError(`Stok ${product.name} sudah habis`)
      setTimeout(() => setError(''), 3000)
      return
    }
    const existing = cart.find(c => c.product_id === product.id)
    if (existing) {
      setCart(cart.map(c => c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, {
        product_id: product.id, name: product.name, price: parseFloat(product.selling_price),
        quantity: 1, unit: product.unit || 'pcs'
      }])
    }
    setSearch('')
    searchRef.current?.focus()
  }

  // Update qty with stock check
  const updateQty = (productId, newQty) => {
    if (newQty <= 0) return
    const totalStock = stockMap[productId] || 0
    if (newQty > totalStock) {
      const item = cart.find(c => c.product_id === productId)
      setShowStockWarning({ productId, productName: item?.name, available: totalStock, requested: newQty })
      return
    }
    setCart(cart.map(c => c.product_id === productId ? { ...c, quantity: newQty } : c))
  }

  // Confirm stock warning - set qty to max available
  const confirmStockWarning = () => {
    if (showStockWarning) {
      setCart(cart.map(c => c.product_id === showStockWarning.productId
        ? { ...c, quantity: showStockWarning.available } : c))
      setShowStockWarning(null)
    }
  }

  // Remove from cart with animation
  const removeFromCart = (productId) => { setShowDeleteConfirm(productId) }
  const confirmRemove = () => {
    setCart(cart.filter(c => c.product_id !== showDeleteConfirm))
    setShowDeleteConfirm(null)
  }

  const clearCart = () => {
    if (cart.length === 0) return
    setShowClearConfirm(true)
  }
  const confirmClearCart = () => {
    setCart([])
    setShowClearConfirm(false)
  }

  // Calculate Discounts
  const calculateItemDiscount = (item) => {
    let maxDiscountAmount = 0;
    activeDiscounts.forEach(promo => {
      const appliesToAll = !promo.products || promo.products.length === 0;
      const appliesToThis = appliesToAll || promo.products.includes(item.product_id);
      
      if (appliesToThis && item.quantity >= promo.min_quantity) {
        let discountAmt = 0;
        if (promo.discount_type === 'PERCENTAGE') {
          discountAmt = (item.price * item.quantity) * (promo.discount_value / 100);
        } else {
          // Nominal flat discount per line item
          discountAmt = Number(promo.discount_value);
        }
        if (discountAmt > maxDiscountAmount) maxDiscountAmount = discountAmt;
      }
    });
    return maxDiscountAmount;
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const totalDiscount = cart.reduce((s, c) => s + calculateItemDiscount(c), 0)
  const total = Math.max(0, subtotal - totalDiscount)
  const change = parseFloat(amountPaid || 0) - total

  // Checkout
  const checkoutMutation = useMutation({
    mutationFn: transactionsAPI.checkout,
    onSuccess: (data) => {
      const selectedMethod = methodOptions.find(m => m.id === paymentMethod)
      const methodType = selectedMethod?.method_type || 'CASH'
      setReceiptData({ ...data, cart, total, subtotal, totalDiscount, paymentMethod: methodType, paymentMethodName: selectedMethod?.name || methodType, amountPaid: parseFloat(amountPaid || 0), change: Math.max(0, change) })
      setShowReceipt(true)
      setCart([])
      setAmountPaid('')
      setPaymentMethod(null)
      queryClient.invalidateQueries(['stock-pos', bCode])
      queryClient.invalidateQueries(['products-pos', bCode])
    },
    onError: (err) => {
      const serverError = err.response?.data?.error
      const statusCode = err.response?.status
      let message = 'Checkout gagal'
      
      if (!err.response) {
        message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      } else if (statusCode === 429) {
        message = 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
      } else if (statusCode >= 500) {
        message = 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.'
      } else if (serverError) {
        message = serverError
      }
      
      setError(message)
      setTimeout(() => setError(''), 8000)
    }
  })

  const handleCheckout = async () => {
    setError('')
    if (cart.length === 0) { setError('Keranjang kosong'); return }
    const selectedMethod = methodOptions.find(m => m.id === paymentMethod)
    const methodType = selectedMethod?.method_type || 'CASH'
    if (methodType === 'CASH' && (!amountPaid || parseFloat(amountPaid) < total)) {
      setError(`Jumlah bayar harus >= Rp ${fmt(total)}`); return
    }

    // Double-validation: re-fetch latest stock before checkout
    setIsValidatingStock(true)
    try {
      const latestStockData = await inventoryAPI.getBatches({ status: 'ACTIVE', limit: 1000 })
      const latestStockList = Array.isArray(latestStockData) ? latestStockData : (latestStockData?.results || [])
      const latestStockMap = {}
      // Exclude expired batches -- same logic as main stock display
      latestStockList.filter(s => !s.is_expired).forEach(s => {
        const pid = s.product_id || s.product
        latestStockMap[pid] = (latestStockMap[pid] || 0) + (s.quantity || 0)
      })

      // Validate each cart item against latest stock
      const insufficientItems = []
      for (const item of cart) {
        const available = latestStockMap[item.product_id] || 0
        if (item.quantity > available) {
          insufficientItems.push({ name: item.name, requested: item.quantity, available })
        }
      }

      if (insufficientItems.length > 0) {
        const msgs = insufficientItems.map(i => `${i.name} (diminta: ${i.requested}, tersedia: ${i.available})`).join(', ')
        setError(`Stok tidak mencukupi: ${msgs}`)
        setIsValidatingStock(false)
        // Refresh local stock data
        queryClient.invalidateQueries(['stock-pos', bCode])
        return
      }
    } catch (err) {
      setError('Gagal memvalidasi stok. Coba lagi.')
      setIsValidatingStock(false)
      return
    }
    setIsValidatingStock(false)

    const items = cart.map(c => ({ product_id: c.product_id, quantity: c.quantity, price_per_unit: c.price, discount: calculateItemDiscount(c) }))
    checkoutMutation.mutate({
      items, payment_method: methodType,
      amount_paid: methodType === 'CASH' ? parseFloat(amountPaid) : total,
      discount_amount: totalDiscount, cashier_name: user?.full_name || user?.username || 'Kasir'
    })
  }

  const handleNewTransaction = () => { setShowReceipt(false); setReceiptData(null); searchRef.current?.focus() }

  const handlePrint = () => { window.print() }

  // Camera barcode scanner
  const startCamera = async () => {
    setShowCamera(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 },
        (decoded) => {
          scanner.stop().catch(() => {}); scannerRef.current = null; setShowCamera(false); setSearch(decoded)
          const found = products.find(p => p.barcode === decoded || p.code === decoded)
          if (found) addToCart(found)
        },
        () => {}
      )
    } catch (e) { scannerRef.current = null; setShowCamera(false); setError('Kamera tidak tersedia') }
  }

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setShowCamera(false)
  }

  // Resolve the currently selected payment method object by ID
  const selectedPaymentInfo = methodOptions.find(m => m.id === paymentMethod)
  const selectedMethodType = selectedPaymentInfo?.method_type || 'CASH'

  return (
    <MainLayout title="Kasir POS">
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 sm:-m-6">
      <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50 min-w-0">

        {/* Search */}
        <div className="bg-white px-5 py-3 border-b border-gray-200 shrink-0">
          {/* Session restored notice */}
          {sessionRestoredNotice && (
            <div className="mb-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Keranjang sebelumnya berhasil dipulihkan setelah sesi habis.
            </div>
          )}
          {error && (
            <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari nama produk, kode, atau scan barcode..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50" />
            </div>
            <button onClick={startCamera} className="px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors" title="Scan Barcode">
              <RiCameraLine size={18} />
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="px-5 py-3 space-y-2 overflow-y-auto max-h-[40vh] shrink-0">
            {searchResults.map(p => {
              const stock = stockMap[p.id] || 0
              const avail = getAvailableStock(p.id)
              const outOfStock = avail <= 0
              return (
                <div key={p.id} className={`bg-white border rounded-xl p-3 flex items-center justify-between transition ${outOfStock ? 'opacity-50 border-gray-200' : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'}`}
                  onClick={() => !outOfStock && addToCart(p)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <RiShoppingCartLine size={16} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">Stok: {stock} {p.unit || 'pcs'} {outOfStock && <span className="text-red-500 font-bold">- HABIS</span>}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-gray-800">Rp {fmt(p.selling_price)}</p>
                    {!outOfStock && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-lg">+ Tambah</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cart */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Keranjang ({cart.length} item)</h3>
            {cart.length > 0 && <button onClick={clearCart} className="text-red-500 text-xs hover:text-red-700 font-medium">Kosongkan</button>}
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Keranjang kosong. Cari dan tambahkan produk.</div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product_id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Rp {fmt(item.price)} / {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center">
                      <RiSubtractLine size={14} />
                    </button>
                    <input type="number" value={item.quantity} min={1}
                      onChange={e => updateQty(item.product_id, parseInt(e.target.value) || 1)}
                      className="w-12 text-center font-bold text-gray-800 text-sm border border-gray-200 rounded-lg py-1" />
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center">
                      <RiAddLine size={14} />
                    </button>
                  </div>
                  <p className="w-24 text-right font-bold text-gray-800 text-sm">Rp {fmt(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 p-1">
                    <RiCloseLine size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Product Grid - show when search is empty and cart is empty */}
          {/* Product Grid - show when search is empty */}
          {search.length === 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Semua Produk</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map(p => {
                  const stock = stockMap[p.id] || 0
                  const outOfStock = stock <= 0
                  return (
                    <div key={p.id} className={`bg-white border rounded-xl p-3 flex flex-col justify-between transition ${outOfStock ? 'opacity-50 border-gray-200' : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'}`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Stok: {stock} {p.unit || 'pcs'}</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">Rp {fmt(p.selling_price)}</p>
                      </div>
                      <button onClick={() => !outOfStock && addToCart(p)} disabled={outOfStock}
                        className="mt-2 w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                        <RiAddLine size={14} /> {outOfStock ? 'Habis' : 'Tambah'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Payment Summary */}
      <div className="w-72 bg-white flex flex-col shrink-0 shadow-lg">
        <div className="p-5 flex-1 overflow-y-auto">
          <h3 className="font-bold text-gray-800 text-base mb-4">Ringkasan Pembayaran</h3>
          {/* Item subtotals */}
          <div className="space-y-1.5 mb-4">
            {cart.map(c => (
              <div key={c.product_id} className="flex justify-between text-sm">
                <span className="text-gray-500 truncate mr-2">{c.name} x{c.quantity}</span>
                <span className="text-gray-700 shrink-0">Rp {fmt(c.price * c.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mb-5">
            <div className="flex justify-between items-center mb-1 text-sm text-gray-500">
              <span>Subtotal</span>
              <span>Rp {fmt(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-sm text-emerald-600 font-medium">
                <span>Total Diskon</span>
                <span>- Rp {fmt(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-base font-bold text-gray-800">Total Akhir</span>
              <span className="text-2xl font-bold text-emerald-600">Rp {fmt(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {methodOptions.map(m => (
                <button key={m.method_type + m.id} onClick={() => setPaymentMethod(m.id)}
                  className={`border-2 py-2 rounded-xl text-xs font-bold transition-colors ${paymentMethod === m.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-emerald-300'}`}>
                  {m.name || m.method_type_display || m.method_type}
                </button>
              ))}
            </div>
          </div>

          {/* QRIS Image */}
          {selectedMethodType === 'QRIS' && selectedPaymentInfo?.qris_image && (
            <div className="mb-4 text-center">
              <img src={selectedPaymentInfo.qris_image} alt="QRIS" className="w-40 h-40 object-contain mx-auto rounded-lg border border-gray-200" />
              <p className="text-xs text-gray-400 mt-1">Minta customer scan QR di atas</p>
            </div>
          )}

          {/* Transfer Info */}
          {selectedMethodType === 'TRANSFER' && selectedPaymentInfo && (
            <div className="mb-4 bg-purple-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-purple-700">{selectedPaymentInfo.name}</p>
              {selectedPaymentInfo.account_number && <p className="font-mono text-purple-600">{selectedPaymentInfo.account_number}</p>}
              {selectedPaymentInfo.account_name && <p className="text-purple-500 text-xs">a/n {selectedPaymentInfo.account_name}</p>}
            </div>
          )}

          {/* Cash Input */}
          {selectedMethodType === 'CASH' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Uang Diterima</label>
              <input type="text" inputMode="numeric" value={formatNumberInput(amountPaid)} onChange={e => setAmountPaid(parseFormattedNumber(e.target.value))}
                placeholder="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right" />
              {amountPaid !== '' && parseFloat(amountPaid) >= total && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Kembalian</span>
                  <span className="text-sm font-bold text-emerald-600">Rp {fmt(Math.max(0, change))}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button onClick={handleCheckout} disabled={cart.length === 0 || checkoutMutation.isPending || isValidatingStock}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg disabled:bg-gray-300 disabled:shadow-none">
            {isValidatingStock ? 'Memvalidasi stok...' : checkoutMutation.isPending ? 'Memproses...' : 'Proses Pembayaran'}
          </button>
          <button onClick={clearCart} disabled={cart.length === 0}
            className="w-full mt-2 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
            Batalkan Transaksi
          </button>
        </div>
      </div>

      {/* Stock Warning Modal */}
      {showStockWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RiAlertLine size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Peringatan Stok</h3>
            <p className="text-sm text-gray-600 mb-1">
              Stok <strong>{showStockWarning.productName}</strong> hanya tersisa <strong className="text-amber-600">{showStockWarning.available}</strong>.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Jika Anda klik "Lanjut", hanya <strong>{showStockWarning.available}</strong> yang akan ditambahkan dan stok akan habis.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowStockWarning(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={confirmStockWarning} className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700">
                Lanjut ({showStockWarning.available} unit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RiAlertLine size={20} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Kosongkan Keranjang?</h3>
            <p className="text-sm text-gray-600 mb-4">Semua item ({cart.length}) akan dihapus dari keranjang.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={confirmClearCart} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Kosongkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RiDeleteBinLine size={20} className="text-red-600" />
            </div>
            <p className="text-sm text-gray-700 mb-4">Hapus <strong>{cart.find(c => c.product_id === showDeleteConfirm)?.name}</strong> dari keranjang?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={confirmRemove} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full print:shadow-none">
            <div className="bg-emerald-600 rounded-t-2xl p-5 text-center text-white">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <RiCheckboxCircleLine size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold">Pembayaran Berhasil</h3>
            </div>
            <div className="p-5" id="receipt-content">
              <div className="text-center mb-3">
                <p className="font-bold text-sm">{business?.name || 'Toko'}</p>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-gray-400">{new Date().toLocaleTimeString('id-ID')}</p>
                <p className="font-mono font-bold text-blue-600 text-sm mt-1">{receiptData.transaction_code}</p>
              </div>
              <div className="border-t border-dashed border-gray-200 py-3 space-y-1">
                {receiptData.cart.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">{c.name} x{c.quantity}</span>
                    <span>Rp {fmt(c.price * c.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1">
                {receiptData.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>Rp {fmt(receiptData.subtotal)}</span></div>
                )}
                {receiptData.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Diskon</span><span className="text-emerald-600">-Rp {fmt(receiptData.totalDiscount)}</span></div>
                )}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Akhir</span><span className="font-bold">Rp {fmt(receiptData.total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Metode</span><span>{receiptData.paymentMethodName || receiptData.paymentMethod}</span></div>
                {receiptData.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Dibayar</span><span>Rp {fmt(receiptData.amountPaid)}</span></div>
                    <div className="flex justify-between text-sm font-bold text-emerald-600"><span>Kembalian</span><span>Rp {fmt(receiptData.change)}</span></div>
                  </>
                )}
                <div className="flex justify-between text-xs text-gray-400 mt-2"><span>Kasir</span><span>{user?.full_name || user?.username}</span></div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={handleNewTransaction} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center justify-center gap-2">
                <RiArrowGoBackLine size={14} /> Transaksi Baru
              </button>
              <button onClick={handlePrint} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <RiPrinterLine size={14} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Scan Barcode</h3>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700"><RiCloseLine size={20} /></button>
            </div>
            <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
            <p className="text-xs text-gray-400 mt-2 text-center">Arahkan kamera ke barcode produk</p>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  )
}
