// Fallback mock data — used automatically when the Azure backend is unavailable.

let nextOrderId = 8001
const sessionOrders: any[] = []
const sessionPredictions: any[] = []

export const CUSTOMERS = [
  { customerId: 1,  fullName: "Adeola Diallo",      email: "adeoladiallo20@example.com",  city: "Clayton",   state: "MI", loyaltyTier: "gold"   },
  { customerId: 2,  fullName: "Ahmed López",         email: "ahmedlopez235@example.com",   city: "Oxford",    state: "MA", loyaltyTier: "silver" },
  { customerId: 3,  fullName: "Aisha Sato",          email: "aishasato111@example.com",    city: "Clayton",   state: "MI", loyaltyTier: "none"   },
  { customerId: 4,  fullName: "James Kim",           email: "jameskim47@example.com",      city: "Denver",    state: "CO", loyaltyTier: "gold"   },
  { customerId: 5,  fullName: "Maria Garcia",        email: "mariagarcia88@example.com",   city: "Houston",   state: "TX", loyaltyTier: "silver" },
  { customerId: 6,  fullName: "Tariq Hassan",        email: "tariqhassan22@example.com",   city: "Phoenix",   state: "AZ", loyaltyTier: "none"   },
  { customerId: 7,  fullName: "Sarah Chen",          email: "sarahchen99@example.com",     city: "Seattle",   state: "WA", loyaltyTier: "gold"   },
  { customerId: 8,  fullName: "Omar Patel",          email: "omarpatel55@example.com",     city: "Chicago",   state: "IL", loyaltyTier: "silver" },
  { customerId: 9,  fullName: "Yuki Tanaka",         email: "yukitanaka33@example.com",    city: "Portland",  state: "OR", loyaltyTier: "gold"   },
  { customerId: 10, fullName: "Lily Johnson",        email: "lilyjohnson77@example.com",   city: "Austin",    state: "TX", loyaltyTier: "none"   },
  { customerId: 11, fullName: "Noah Williams",       email: "noahwilliams14@example.com",  city: "Boston",    state: "MA", loyaltyTier: "silver" },
  { customerId: 12, fullName: "Priya Sharma",        email: "priyasharma60@example.com",   city: "San Jose",  state: "CA", loyaltyTier: "gold"   },
  { customerId: 13, fullName: "Rafael Torres",       email: "rafaeltorres31@example.com",  city: "Miami",     state: "FL", loyaltyTier: "none"   },
  { customerId: 14, fullName: "Samantha Lee",        email: "samanthalee92@example.com",   city: "Atlanta",   state: "GA", loyaltyTier: "silver" },
  { customerId: 15, fullName: "Victor Nguyen",       email: "victornguyen18@example.com",  city: "Dallas",    state: "TX", loyaltyTier: "gold"   },
]

export const PRODUCTS = [
  { productId: 1,  productName: "Portable Tool Kit",      category: "Tools",       price: 49.01  },
  { productId: 2,  productName: "Premium Monitor",        category: "Electronics", price: 286.27 },
  { productId: 3,  productName: "Lightweight Flashlight", category: "Tools",       price: 31.12  },
  { productId: 4,  productName: "Wireless Headphones",    category: "Electronics", price: 149.99 },
  { productId: 5,  productName: "Running Shoes",          category: "Sports",      price: 89.95  },
  { productId: 6,  productName: "Coffee Maker",           category: "Kitchen",     price: 59.99  },
  { productId: 7,  productName: "Yoga Mat",               category: "Sports",      price: 34.99  },
  { productId: 8,  productName: "Smart Watch",            category: "Electronics", price: 299.99 },
  { productId: 9,  productName: "Desk Lamp",              category: "Office",      price: 44.99  },
  { productId: 10, productName: "Protein Powder",         category: "Health",      price: 54.99  },
  { productId: 11, productName: "Bluetooth Speaker",      category: "Electronics", price: 79.99  },
  { productId: 12, productName: "Garden Hose",            category: "Garden",      price: 29.99  },
]

const BASE_ORDERS: any[] = [
  { orderId: 1001, customerId: 1,  orderDatetime: "2026-01-15T14:23:00Z", orderTotal: 340.25, paymentMethod: "Credit Card", isShipped: true  },
  { orderId: 1002, customerId: 1,  orderDatetime: "2026-02-03T09:11:00Z", orderTotal: 99.98,  paymentMethod: "PayPal",      isShipped: true  },
  { orderId: 1003, customerId: 1,  orderDatetime: "2026-03-20T17:45:00Z", orderTotal: 164.97, paymentMethod: "Credit Card", isShipped: false },
  { orderId: 2001, customerId: 2,  orderDatetime: "2026-02-10T11:30:00Z", orderTotal: 449.98, paymentMethod: "Crypto",      isShipped: false },
  { orderId: 3001, customerId: 3,  orderDatetime: "2026-03-01T08:00:00Z", orderTotal: 59.99,  paymentMethod: "Credit Card", isShipped: true  },
  { orderId: 4001, customerId: 4,  orderDatetime: "2026-03-15T20:15:00Z", orderTotal: 329.97, paymentMethod: "Credit Card", isShipped: false },
  { orderId: 5001, customerId: 5,  orderDatetime: "2026-01-28T13:00:00Z", orderTotal: 89.95,  paymentMethod: "PayPal",      isShipped: true  },
  { orderId: 6001, customerId: 6,  orderDatetime: "2026-03-22T03:47:00Z", orderTotal: 599.97, paymentMethod: "Crypto",      isShipped: false },
  { orderId: 7001, customerId: 7,  orderDatetime: "2026-02-14T10:00:00Z", orderTotal: 194.98, paymentMethod: "Credit Card", isShipped: true  },
  { orderId: 8001, customerId: 13, orderDatetime: "2026-03-30T23:12:00Z", orderTotal: 748.25, paymentMethod: "Crypto",      isShipped: false },
]

const ORDER_ITEMS: Record<number, any[]> = {
  1001: [
    { productName: "Premium Monitor",     quantity: 1, unitPrice: 286.27, lineTotal: 286.27 },
    { productName: "Desk Lamp",           quantity: 1, unitPrice: 44.99,  lineTotal: 44.99  },
  ],
  1002: [
    { productName: "Yoga Mat",            quantity: 1, unitPrice: 34.99, lineTotal: 34.99 },
    { productName: "Protein Powder",      quantity: 1, unitPrice: 54.99, lineTotal: 54.99 },
  ],
  1003: [
    { productName: "Wireless Headphones", quantity: 1, unitPrice: 149.99, lineTotal: 149.99 },
    { productName: "Desk Lamp",           quantity: 1, unitPrice: 44.99,  lineTotal: 44.99  },
  ],
  2001: [
    { productName: "Smart Watch",         quantity: 1, unitPrice: 299.99, lineTotal: 299.99 },
    { productName: "Wireless Headphones", quantity: 1, unitPrice: 149.99, lineTotal: 149.99 },
  ],
  6001: [
    { productName: "Smart Watch",         quantity: 2, unitPrice: 299.99, lineTotal: 599.98 },
  ],
  8001: [
    { productName: "Premium Monitor",     quantity: 2, unitPrice: 286.27, lineTotal: 572.54 },
    { productName: "Smart Watch",         quantity: 1, unitPrice: 299.99, lineTotal: 299.99 },
  ],
}

const BASE_PREDICTIONS: any[] = [
  { orderId: 8001, orderDatetime: "2026-03-30T23:12:00Z", orderTotal: 748.25, customerId: 13, customerName: "Rafael Torres",  fraudProbability: 0.91, predictedFraud: true,  predictionTimestamp: "2026-04-01T00:00:00Z" },
  { orderId: 6001, orderDatetime: "2026-03-22T03:47:00Z", orderTotal: 599.97, customerId: 6,  customerName: "Tariq Hassan",   fraudProbability: 0.82, predictedFraud: true,  predictionTimestamp: "2026-04-01T00:00:00Z" },
  { orderId: 2001, orderDatetime: "2026-02-10T11:30:00Z", orderTotal: 449.98, customerId: 2,  customerName: "Ahmed López",    fraudProbability: 0.74, predictedFraud: true,  predictionTimestamp: "2026-04-01T00:00:00Z" },
  { orderId: 4001, orderDatetime: "2026-03-15T20:15:00Z", orderTotal: 329.97, customerId: 4,  customerName: "James Kim",      fraudProbability: 0.21, predictedFraud: false, predictionTimestamp: "2026-04-01T00:00:00Z" },
  { orderId: 1003, orderDatetime: "2026-03-20T17:45:00Z", orderTotal: 164.97, customerId: 1,  customerName: "Adeola Diallo",  fraudProbability: 0.08, predictedFraud: false, predictionTimestamp: "2026-04-01T00:00:00Z" },
]

function getAllPredictions() {
  return [...BASE_PREDICTIONS, ...sessionPredictions]
}

export function getMockResponse(url: string, options?: RequestInit): any {
  const path = url.replace(/^\/api\//i, '').toLowerCase()

  // POST Scoring/Run
  if (path.startsWith('scoring/run')) {
    const unscored = [...BASE_ORDERS, ...sessionOrders].filter(o =>
      !o.isShipped && !getAllPredictions().find((p: any) => p.orderId === o.orderId)
    )
    const now = new Date().toISOString()
    let flagged = 0
    unscored.forEach(o => {
      const isCrypto = (o.paymentMethod ?? '').toLowerCase() === 'crypto'
      const isHighValue = o.orderTotal > 300
      const prob = isCrypto
        ? 0.75 + Math.random() * 0.18
        : isHighValue
          ? 0.32 + Math.random() * 0.2
          : 0.05 + Math.random() * 0.15
      const predicted = prob >= 0.30
      if (predicted) flagged++
      const customer = CUSTOMERS.find(c => c.customerId === o.customerId)
      sessionPredictions.push({
        orderId: o.orderId, orderDatetime: o.orderDatetime, orderTotal: o.orderTotal,
        customerId: o.customerId, customerName: customer?.fullName ?? 'Unknown',
        fraudProbability: prob, predictedFraud: predicted, predictionTimestamp: now,
      })
    })
    return {
      success: true,
      message: unscored.length === 0
        ? 'No unscored unshipped orders found.'
        : `Scored ${unscored.length} orders — ${flagged} flagged as potentially fraudulent.`,
      timestamp: now,
    }
  }

  // POST Orders/Place
  if (path.startsWith('orders/place')) {
    const body = options?.body ? JSON.parse(options.body as string) : {}
    const items = (body.items ?? []).map((item: any) => {
      const product = PRODUCTS.find(p => p.productId === item.productId)
      const lineTotal = (product?.price ?? 0) * item.quantity
      return { productName: product?.productName, quantity: item.quantity, unitPrice: product?.price, lineTotal }
    })
    const subtotal = items.reduce((s: number, i: any) => s + i.lineTotal, 0)
    const orderId = nextOrderId++
    sessionOrders.push({
      orderId, customerId: body.customerId,
      orderDatetime: new Date().toISOString(),
      orderTotal: subtotal + 9.99 + subtotal * 0.08,
      paymentMethod: body.paymentMethod ?? 'Credit Card',
      isShipped: false, items,
    })
    return { success: true, orderId }
  }

  // GET Customers/Search
  if (path.startsWith('customers/search')) {
    const query = new URL(url, 'http://x').searchParams.get('query')?.toLowerCase() ?? ''
    return query
      ? CUSTOMERS.filter(c => c.fullName.toLowerCase().includes(query) || c.email.toLowerCase().includes(query))
      : CUSTOMERS
  }

  // GET Customers/{id}/Dashboard
  const dashMatch = path.match(/^customers\/(\d+)\/dashboard$/)
  if (dashMatch) {
    const id = parseInt(dashMatch[1])
    const customer = CUSTOMERS.find(c => c.customerId === id) ?? CUSTOMERS[0]
    const orders = [...BASE_ORDERS, ...sessionOrders].filter(o => o.customerId === id)
    const recentOrders = [...orders]
      .sort((a, b) => b.orderDatetime.localeCompare(a.orderDatetime))
      .slice(0, 5)
      .map(o => ({ orderId: o.orderId, orderDatetime: o.orderDatetime, orderTotal: o.orderTotal, isShipped: o.isShipped }))
    return {
      customer,
      totalOrders: orders.length,
      totalSpend: orders.reduce((s, o) => s + o.orderTotal, 0),
      recentOrders,
    }
  }

  // GET Orders/Customer/{id}
  const histMatch = path.match(/^orders\/customer\/(\d+)$/)
  if (histMatch) {
    const id = parseInt(histMatch[1])
    return [...BASE_ORDERS, ...sessionOrders]
      .filter(o => o.customerId === id)
      .sort((a, b) => b.orderDatetime.localeCompare(a.orderDatetime))
      .map(o => ({ orderId: o.orderId, orderDatetime: o.orderDatetime, orderTotal: o.orderTotal, isShipped: o.isShipped }))
  }

  // GET Orders/{id}/Items
  const itemsMatch = path.match(/^orders\/(\d+)\/items$/)
  if (itemsMatch) {
    const id = parseInt(itemsMatch[1])
    const order = [...BASE_ORDERS, ...sessionOrders].find(o => o.orderId === id)
    return {
      orderId: id,
      orderDatetime: order?.orderDatetime ?? new Date().toISOString(),
      orderTotal: order?.orderTotal ?? 0,
      paymentMethod: order?.paymentMethod ?? 'Credit Card',
      items: ORDER_ITEMS[id] ?? order?.items ?? [],
    }
  }

  // GET Products/Active
  if (path.startsWith('products/active')) return PRODUCTS

  // GET Warehouse/PriorityQueue
  if (path.startsWith('warehouse/priorityqueue'))
    return getAllPredictions().sort((a: any, b: any) => b.fraudProbability - a.fraudProbability)

  // GET Warehouse/Customer/{id}/Predictions
  const predMatch = path.match(/^warehouse\/customer\/(\d+)\/predictions$/)
  if (predMatch) {
    const id = parseInt(predMatch[1])
    return getAllPredictions()
      .filter((p: any) => p.customerId === id)
      .sort((a: any, b: any) => b.fraudProbability - a.fraudProbability)
  }

  return []
}
