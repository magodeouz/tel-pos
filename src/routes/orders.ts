import { Hono } from 'hono'
import { html } from 'hono/html'
import { prisma } from '../db'

const orders = new Hono()

function buildOrderResponse(order: any) {
  const subtotal = order.items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  return {
    id: order.id,
    customer_id: order.customerId,
    status: order.status,
    payment_method: order.paymentMethod,
    discount_amount: order.discountAmount,
    discount_percent: order.discountPercent,
    note: order.note ?? '',
    created_at: order.createdAt.toISOString(),
    items: order.items.map((i: any) => ({
      id: i.id,
      product_id: i.productId,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
    total: subtotal,
  }
}

const orderInclude = {
  items: { include: { product: true }, orderBy: { id: 'asc' as const } }
}

orders.get('/', async (c) => {
  const status = c.req.query('status') ?? 'open'
  const list = await prisma.order.findMany({
    where: { status },
    include: orderInclude,
    orderBy: { createdAt: 'desc' }
  })
  return c.json(list.map(buildOrderResponse))
})

orders.get('/list/paginated', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const perPage = Number(c.req.query('per_page') ?? 10)
  const status = c.req.query('status') ?? undefined
  const where = status ? { status } : {}
  const total = await prisma.order.count({ where })
  const pages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), pages)
  const list = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
    skip: (safePage - 1) * perPage,
    take: perPage,
  })
  return c.json({ total, page: safePage, per_page: perPage, pages, orders: list.map(buildOrderResponse) })
})

orders.get('/:id/receipt', async (c) => {
  const id = Number(c.req.param('id'))
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude })
  if (!order) return c.json({ detail: 'Sipariş bulunamadı' }, 404)

  const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  let discountVal = order.discountAmount
  if (order.discountPercent) discountVal += subtotal * (order.discountPercent / 100)
  const total = Math.max(0, subtotal - discountVal)
  const paymentMap: Record<string, string> = { nakit: 'Nakit', kredi_karti: 'Kredi Kartı', cari: 'Cari', odenmes: 'Ödenmez', pending: '-' }
  const paymentLabel = paymentMap[order.paymentMethod] ?? order.paymentMethod

  const itemsHtml = order.items.map(i =>
    `<div class="item"><span>${i.product.name} x${i.quantity}</span><span>${(i.quantity * i.unitPrice).toFixed(2)} TL</span></div>`
  ).join('')

  const discountHtml = discountVal > 0
    ? `<div class="item" style="color:#c00"><span>İndirim</span><span>-${discountVal.toFixed(2)} TL</span></div>` : ''

  const noteHtml = order.note ? `<p style="font-size:0.8em;color:#666">Not: ${order.note}</p>` : ''
  const dateStr = order.createdAt.toLocaleDateString('tr-TR') + ' ' + order.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  return c.html(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Sipariş #${order.id}</title>
  <style>
    @media print { body { margin:0; } .no-print { display:none; } }
    body { font-family:monospace; width:80mm; max-width:80mm; margin:0 auto; padding:10px; font-size:13px; }
    h2 { text-align:center; margin:0 0 4px; font-size:16px; }
    .center { text-align:center; }
    hr { border:none; border-top:1px dashed #000; margin:6px 0; }
    .item { display:flex; justify-content:space-between; margin:2px 0; }
    .total { font-weight:bold; font-size:15px; }
    .btn { display:block; width:100%; padding:8px; background:#333; color:#fff; border:none; cursor:pointer; font-size:14px; margin-top:12px; border-radius:4px; }
  </style>
</head>
<body>
  <h2>EFE POS</h2>
  <p class="center" style="margin:2px 0;font-size:11px">Sipariş #${order.id} | ${dateStr}</p>
  <hr>
  ${itemsHtml}
  <hr>
  ${discountHtml}
  <div class="item total"><span>TOPLAM</span><span>${total.toFixed(2)} TL</span></div>
  <div class="item" style="font-size:11px;color:#555"><span>Ödeme</span><span>${paymentLabel}</span></div>
  ${noteHtml}
  <hr>
  <p class="center" style="font-size:11px">Teşekkür ederiz!</p>
  <div class="no-print"><button class="btn" onclick="window.print()">🖨️ Yazdır</button></div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
})

orders.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude })
  if (!order) return c.json({ detail: 'Sipariş bulunamadı' }, 404)
  return c.json(buildOrderResponse(order))
})

orders.post('/', async (c) => {
  const body = await c.req.json()
  const order = await prisma.order.create({
    data: { customerId: body.customer_id ?? null, note: body.note ?? '' },
    include: orderInclude
  })
  return c.json(buildOrderResponse(order), 201)
})

orders.post('/:id/items', async (c) => {
  const orderId = Number(c.req.param('id'))
  const body = await c.req.json()
  const product = await prisma.product.findUnique({ where: { id: body.product_id } })
  if (!product) return c.json({ detail: 'Ürün bulunamadı' }, 404)
  const item = await prisma.orderItem.create({
    data: { orderId, productId: body.product_id, quantity: body.quantity, unitPrice: product.price },
    include: { product: true }
  })
  return c.json({ id: item.id, product_id: item.productId, product_name: item.product.name, quantity: item.quantity, unit_price: item.unitPrice }, 201)
})

orders.delete('/:id/items/:itemId', async (c) => {
  const itemId = Number(c.req.param('itemId'))
  await prisma.orderItem.delete({ where: { id: itemId } })
  return c.json({ ok: true })
})

orders.patch('/:id/status', async (c) => {
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json()
  await prisma.order.update({ where: { id }, data: { status } })
  return c.json({ ok: true, status })
})

orders.patch('/:id/note', async (c) => {
  const id = Number(c.req.param('id'))
  const { note } = await c.req.json()
  await prisma.order.update({ where: { id }, data: { note } })
  return c.json({ ok: true, note })
})

orders.patch('/:id/payment', async (c) => {
  const id = Number(c.req.param('id'))
  const { payment_method } = await c.req.json()
  await prisma.order.update({ where: { id }, data: { paymentMethod: payment_method } })
  return c.json({ ok: true, payment_method })
})

orders.patch('/:id/discount', async (c) => {
  const id = Number(c.req.param('id'))
  const { discount_amount, discount_percent } = await c.req.json()
  await prisma.order.update({ where: { id }, data: { discountAmount: discount_amount ?? 0, discountPercent: discount_percent ?? 0 } })
  return c.json({ ok: true, discount_amount, discount_percent })
})

export default orders
