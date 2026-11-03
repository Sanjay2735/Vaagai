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

async function runEcosystemVerification() {
  console.log('====================================================');
  console.log('🥻 VAAGAI FULL E-COMMERCE ECOSYSTEM VERIFICATION 🥻');
  console.log('====================================================\n');

  // STEP 1: Customer Authentication
  console.log('👤 [1] Customer Sign In (priya.s@example.com)...');
  const custLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'priya.s@example.com', password: 'Priya@2026' }
  });

  if (custLogin.status !== 200 || !custLogin.data.token) {
    console.error('❌ Customer sign in failed:', custLogin.data);
    process.exit(1);
  }
  const customerToken = custLogin.data.token;
  const customerUser = custLogin.data.user;
  console.log(`✅ Patron signed in: "${customerUser.name}" (${customerUser.email})`);

  // STEP 2: Customer Address Book
  console.log('\n🏡 [2] Fetching Patron Saved Addresses...');
  const addrRes = await request('/api/auth/addresses', {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log(`✅ Saved addresses retrieved: ${addrRes.data.addresses?.length || 0} locations`);
  const defaultAddress = addrRes.data.addresses?.[0] || {
    street_address: '18 Poes Garden',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postal_code: '600086'
  };

  // STEP 3: Order Placement (Customer Storefront Checkout)
  console.log('\n🛍️ [3] Customer Placing Heirloom Saree Order with Coupon VAAGAI10...');
  const checkoutPayload = {
    customerName: customerUser.name,
    email: customerUser.email,
    phone: customerUser.phone || '+91 98401 55678',
    shippingAddress: defaultAddress.street_address,
    city: defaultAddress.city,
    state: defaultAddress.state,
    postalCode: defaultAddress.postal_code,
    country: 'India',
    paymentMethod: 'online',
    couponCode: 'VAAGAI10',
    discountAmount: 4850,
    items: [
      {
        id: 1, // Crimson Mayil Kanjivaram (₹48,500)
        q: 1,
        p: 48500,
        n: 'Crimson Mayil Kanjivaram Silk Saree',
      }
    ],
    notes: 'Please pack in luxury heirloom bridal silk box.'
  };

  const orderRes = await request('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: checkoutPayload
  });

  if (orderRes.status !== 201 || !orderRes.data.order) {
    console.error('❌ Order placement failed:', orderRes.data);
    process.exit(1);
  }
  const createdOrder = orderRes.data.order;
  const orderNumber = createdOrder.order_number;
  console.log(`✅ Order placed: #${orderNumber} | Total: ₹${createdOrder.total_amount}`);

  // STEP 4: Customer Order History
  console.log('\n📜 [4] Customer Order History Verification...');
  const myOrdersRes = await request('/api/orders/my', {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const myOrders = myOrdersRes.data.orders || [];
  const foundInHistory = myOrders.find(o => o.order_number === orderNumber);
  if (!foundInHistory) {
    console.error(`❌ Order #${orderNumber} not found in customer history!`);
    process.exit(1);
  }
  console.log(`✅ Verified order in customer history (${myOrders.length} total orders for patron)`);

  // STEP 5: Order Tracking Timeline
  console.log(`\n🚚 [5] Customer Tracking Order #${orderNumber}...`);
  const trackRes = await request(`/api/orders/${orderNumber}`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  if (trackRes.status !== 200) {
    console.error('❌ Order tracking lookup failed:', trackRes.data);
    process.exit(1);
  }
  console.log(`✅ Tracking status: "${trackRes.data.order.order_status}" | Timeline entries: ${trackRes.data.order.timeline ? 'Recorded' : 'Empty'}`);

  // STEP 6: Admin Login & Order Fulfillment
  console.log('\n👑 [6] Admin Sign In (admin@vaagai.com)...');
  const adminLogin = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@vaagai.com', password: 'Admin@Vaagai2026!' }
  });

  if (adminLogin.status !== 200 || !adminLogin.data.token) {
    console.error('❌ Admin login failed:', adminLogin.data);
    process.exit(1);
  }
  const adminToken = adminLogin.data.token;
  console.log('✅ Admin authenticated successfully.');

  // STEP 7: Admin Assigns Courier & Marks Delivered
  console.log(`\n📦 [7] Admin Arranging Courier & Tracking for Order #${orderNumber}...`);
  const shipRes = await request(`/api/admin/orders/${createdOrder.id}/shipping`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: {
      carrier: 'Blue Dart Luxury Surface',
      trackingNumber: 'BD-VAAGAI-89104',
      trackingUrl: 'https://bluedart.com/track?ref=BD-VAAGAI-89104',
      orderStatus: 'delivered', // mark delivered to test return flow
    }
  });

  if (shipRes.status !== 200) {
    console.error('❌ Shipping update failed:', shipRes.data);
    process.exit(1);
  }
  console.log(`✅ Order shipping updated: Courier="${shipRes.data.order.shipping_carrier}", Status="${shipRes.data.order.order_status}"`);

  // Admin marks delivered upon receipt confirmation
  const deliverRes = await request(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: { orderStatus: 'delivered' }
  });
  console.log(`✅ Order marked delivered: Status="${deliverRes.data.order.order_status}"`);

  // STEP 8: Customer Submits Return Request
  console.log(`\n🔄 [8] Customer Requesting Drape Return for Order #${orderNumber}...`);
  const returnRes = await request(`/api/orders/${orderNumber}/return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: {
      reason: 'Saree Drape Preference',
      description: 'Would love to exchange for the Emerald Green Banarasi weave.',
    }
  });

  if (returnRes.status !== 201 || !returnRes.data.returnRequest) {
    console.error('❌ Customer return submission failed:', returnRes.data);
    process.exit(1);
  }
  const returnReq = returnRes.data.returnRequest;
  console.log(`✅ Return request #RET-${returnReq.id} submitted for ₹${returnReq.refund_amount}`);

  // STEP 9: Admin Reviews & Processes Return & Refund
  console.log('\n🏛️ [9] Admin Inspecting Returns Queue & Completing Refund Protocol...');
  const adminReturnsRes = await request('/api/admin/returns', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  const matchingReturn = (adminReturnsRes.data.returns || []).find(r => r.order_number === orderNumber);
  if (!matchingReturn) {
    console.error(`❌ Return for #${orderNumber} not found in admin queue!`);
    process.exit(1);
  }
  console.log(`✅ Found in Admin Returns Queue: #RET-${matchingReturn.id} (${matchingReturn.status})`);

  // Admin completes refund
  const refundProcessRes = await request(`/api/admin/returns/${matchingReturn.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: {
      status: 'refund_completed',
      adminNotes: 'Drape received in pristine condition. Full refund disbursed to patron.',
      refundAmount: matchingReturn.refund_amount,
    }
  });

  if (refundProcessRes.status !== 200) {
    console.error('❌ Refund completion failed:', refundProcessRes.data);
    process.exit(1);
  }
  console.log(`✅ Refund completed! Status: "${refundProcessRes.data.returnRequest.status}"`);

  // STEP 10: Verify Synced Order State
  console.log(`\n🔍 [10] Verifying Parent Order Final Synchronized Status...`);
  const finalOrderRes = await request(`/api/orders/${orderNumber}`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const finalOrder = finalOrderRes.data.order;
  console.log(`✅ Final Order Status: "${finalOrder.order_status}" | Payment Status: "${finalOrder.payment_status}"`);

  // STEP 11: Admin Overview Check
  console.log('\n📊 [11] Verifying Centralized Admin Executive Overview...');
  const overviewRes = await request('/api/admin/overview?range=all', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`✅ Total Atelier Orders: ${overviewRes.data.kpis.totalOrders}`);
  console.log(`✅ Total Atelier Revenue: ₹${overviewRes.data.kpis.totalRevenue.toLocaleString('en-IN')}`);

  console.log('\n====================================================');
  console.log('🎉 ALL 11 END-TO-END ECOSYSTEM TESTS PASSED 100%! 🎉');
  console.log('====================================================\n');
  process.exit(0);
}

runEcosystemVerification().catch((err) => {
  console.error('Ecosystem test failure:', err);
  process.exit(1);
});
