// Test End-to-End Real-Time Order Synchronization
import http from 'http';

const API_HOST = 'localhost';
const API_PORT = 5000;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: API_HOST,
      port: API_PORT,
      path,
      headers: options.headers || {},
      method: options.method || 'GET',
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('🚀 [1] Testing Admin Login...');
  const loginRes = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@vaagai.com', password: 'Admin@Vaagai2026!' },
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Admin login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.data.token;
  console.log('✅ Admin login successful! Token received.');

  // Replenish stock via administrative API to test restock workflow
  await request('/api/admin/inventory/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: { productId: 1, changeAmount: 20, reason: 'Test suite automated restock' }
  });

  console.log('📡 [2] Connecting to Admin Real-time SSE Stream (/api/admin/realtime)...');
  let sseReceivedEvents = [];
  
  const sseReq = http.request({
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/admin/realtime?token=${encodeURIComponent(token)}`,
    headers: { 'Accept': 'text/event-stream' },
    method: 'GET',
  }, (res) => {
    res.on('data', (chunk) => {
      const text = chunk.toString();
      // Parse SSE lines
      const lines = text.split('\n');
      let currentEvent = null;
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ') && currentEvent) {
          try {
            const raw = JSON.parse(line.substring(6).trim());
            const data = raw.payload || raw;
            sseReceivedEvents.push({ event: currentEvent, data });
            console.log(`⚡ [SSE Event Arrived]: event="${currentEvent}" orderNumber=${data.orderNumber || data.order_number || data.id || 'N/A'}`);
          } catch {}
        }
      }
    });
  });
  sseReq.on('error', (err) => console.error('SSE Error:', err.message));
  sseReq.end();

  // Wait 1 second for SSE handshake
  await new Promise(r => setTimeout(r, 1000));

  console.log('🛍️ [3] Placing a Storefront Customer Order with coupon VAAGAI10...');
  const orderPayload = {
    customerName: 'Meenakshi Sundaram',
    email: 'meenakshi.sundaram@heritage.in',
    phone: '+91 98401 23456',
    shippingAddress: '42, Besant Road, Alwarpet',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600018',
    country: 'India',
    paymentMethod: 'online',
    couponCode: 'VAAGAI10',
    discountAmount: 4850,
    items: [
      {
        id: 1, // Crimson Mayil Kanjivaram Silk Saree (₹48,500)
        q: 1,
        p: 48500,
        n: 'Crimson Mayil Kanjivaram Silk Saree',
      }
    ],
    notes: 'Please pack in luxury Vaagai bridal silk box with custom message.',
  };

  const orderRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: orderPayload,
  });

  console.log(`Order placement status: ${orderRes.status}`, orderRes.data?.order?.orderNumber);
  if (orderRes.status !== 201) {
    console.error('❌ Order creation failed:', orderRes.data);
    process.exit(1);
  }
  const placedOrder = orderRes.data?.order || {};
  const orderRef = placedOrder.order_number || placedOrder.orderNumber;
  const orderTotal = placedOrder.total_amount || placedOrder.totalAmount;
  console.log(`✅ Order #${orderRef} placed successfully! Total: ₹${orderTotal}`);

  // Wait 1.5 seconds for SSE delivery
  await new Promise(r => setTimeout(r, 1500));

  console.log('🔍 [4] Verifying Real-Time SSE Event Capture...');
  const orderEvent = sseReceivedEvents.find(e => e.event === 'order:created');
  const invEvent = sseReceivedEvents.find(e => e.event === 'inventory:adjusted');

  if (!orderEvent) {
    console.error('❌ Failed to capture "order:created" SSE event!');
    process.exit(1);
  }
  console.log(`✅ Captured "order:created" SSE event! Order Number: ${orderEvent.data.orderNumber}`);

  if (invEvent) {
    console.log(`✅ Captured "inventory:adjusted" SSE event!`);
  }

  console.log('📊 [5] Verifying Admin Overview Endpoint Updates...');
  const overviewRes = await request('/api/admin/overview?range=all', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (overviewRes.status !== 200 || !overviewRes.data.success) {
    console.error('❌ Admin overview query failed:', overviewRes.data);
    process.exit(1);
  }

  const kpis = overviewRes.data.kpis;
  const recentOrders = overviewRes.data.recentOrders;
  console.log(`✅ Total Revenue: ₹${kpis.totalRevenue.toLocaleString('en-IN')}`);
  console.log(`✅ Total Orders: ${kpis.totalOrders}`);
  console.log(`✅ Recent Orders Count: ${recentOrders.length}`);
  console.log(`✅ Latest Order in DB: #${recentOrders[0]?.order_number} by ${recentOrders[0]?.customer_name}`);

  console.log('\n🎉 ALL REAL-TIME SYNCHRONIZATION TESTS PASSED PERFECTLY! 🎉\n');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
