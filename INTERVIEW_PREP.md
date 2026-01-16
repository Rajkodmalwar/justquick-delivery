# JustQuick - Interview Prep Document

---

## 1. 60-SECOND PROJECT EXPLANATION (Technical Panel)

**"I built JustQuick, a hyperlocal 9-minute delivery platform. It's a three-sided marketplace with buyers, vendors, and delivery drivers.

The tech stack is Next.js 15 with TypeScript for the full-stack, Supabase for backend and authentication, and Tailwind CSS for UI. 

The architecture is straightforward: The buyer browses shops, adds items to a cart stored in React context, and places an order. That order goes into a PostgreSQL database and triggers a real-time notification to the nearest vendor. The vendor sees it, marks it ready, and the system auto-assigns a delivery driver based on proximity. We use a 6-digit login code for vendors and drivers—no passwords—which simplified onboarding. Payment is COD for MVP, but the schema supports online payments.

The backend is API routes handling order creation, shop/product CRUD, delivery assignment, and commission tracking. Authentication is Supabase Auth with role-based access control baked into row-level security policies.

The biggest technical challenge was real-time coordination without building a separate WebSocket server—we leveraged Supabase Realtime subscriptions so orders, notifications, and delivery updates sync instantly across users.

It's production-ready architecture for an MVP, not over-engineered, but extensible."**

---

## 2. 30-SECOND PROJECT EXPLANATION (HR / Non-Technical)

**"I built JustQuick, an app where people order groceries and snacks from local shops and get them delivered in 9 minutes.

Think of it like a mobile marketplace connecting three groups: customers who order online, local shop owners who accept and pack orders, and delivery drivers who bring them to customers. 

My role was designing and building the entire platform—the customer-facing app, the vendor dashboard, the backend APIs, and the delivery tracking system. It handles real-time order updates, payments tracking, and driver commissions, all working together automatically.

The whole system is built on modern cloud technology so it can scale, and it's ready to be put into production."**

---

## 3. TOP 15 TECHNICAL INTERVIEW QUESTIONS WITH ANSWERS

### **Q1: Walk me through a user's journey from browsing to receiving an order.**

**A:** "So a buyer lands on the home page, authenticated via Supabase Auth. They see a list of shops on `/shops`. They click into a shop, see products, and add items to their cart. The cart is stored in React Context on the client side—nothing persisted yet, so if they refresh, they lose it.

Once they checkout, the cart items get serialized into a JSON array and sent to `/api/orders` with their address, phone, and shop ID. My API validates:
- User is authenticated
- Shop exists
- All required fields are present

Then I generate a random OTP, create the order in Postgres with status 'pending', and return the order ID to the UI.

The vendor gets a real-time notification via Supabase subscriptions and sees it in their dashboard. They review the order, mark it 'ready' (which updates the database). Once marked ready, the system auto-assigns a delivery boy based on who's available or closest.

The buyer sees the order status change in real-time, gets an OTP to give the driver, and the driver uses that OTP to mark it delivered. At that point, the order closes and the commission is recorded."

**Why this answer works:** You demonstrated the full flow, mentioned specific technical pieces (JSON serialization, status transitions, OTP), showed awareness of real-time syncing, and didn't oversimplify. You also mentioned validations without being pedantic.

---

### **Q2: Why did you use a 6-digit login code for vendors and drivers instead of passwords?**

**A:** "Good question. For an MVP, we needed fast onboarding with zero friction. Vendors and drivers are often non-technical, and passwords create support burden: forgotten passwords, resets, lockouts. A 6-digit code is memorable, verbal—you can give it to someone over the phone. It's generated server-side as a unique code when the account is created, stored in the database, and never transmitted in plain text. 

Is it less secure than a password? Technically yes. But this is MVP phase where velocity matters. For production, I'd add passwords or OAuth, but keep the login code as a fallback since it's genuinely useful for this user base.

The tradeoff is acceptable for our stage because the sensitive operations—like marking orders ready or assigning deliveries—are tied to their role in Supabase RLS policies, not just the login code. Even if someone had the code, they can't see orders outside their region or modify someone else's commission."

**Why this answer works:** You acknowledged the security tradeoff honestly, explained the real business reason (UX, onboarding), and showed you've thought about compensating controls. Interviewers respect this maturity.

---

### **Q3: How does the order assignment to delivery drivers work?**

**A:** "Right now, it's simple. When a vendor marks an order as 'ready', the API looks at the delivery_boys table, filters by status or availability—we have a column for that—and picks one. There's a function called in the admin dashboard that can auto-assign based on proximity: we calculate the distance between the delivery boy's location and the buyer's location using their lat/lng coordinates, pick the closest free driver.

In the actual codebase, I store shop_lat, shop_lng, buyer_lat, buyer_lng for every order. I don't do the distance calculation in the database—it's simpler to fetch all available drivers and sort by distance in the API response. 

Ideally, for scale, this would be a background job that runs every few seconds, automatically assigning pending orders. Right now, it's manual or triggered via the admin UI. It works for MVP because order volume isn't crazy yet, but if we scale, I'd move to a queue system."

**Why this answer works:** You gave the real current implementation, acknowledged the limitation, and had a clear upgrade path. You didn't pretend to have built a sophisticated geo-dispatch system if you didn't.

---

### **Q4: What happens if a delivery driver goes offline mid-delivery?**

**A:** "The order status would stay as 'picked_up'. Right now, we don't have a timeout mechanism. In a real system, you'd want to detect this: if an order is stuck in 'picked_up' for longer than expected, reassign it to another driver.

Currently, that's a manual intervention—an admin would see it on the dashboard and reassign. For a production system, I'd add:
- A scheduled job that checks order age and status
- Rules like: if status is 'picked_up' for more than 5 minutes with no activity, flag it for admin review or auto-reassign
- Maybe a heartbeat system where the driver periodically sends location updates

But this wasn't a priority for MVP because:
1. Testing is harder
2. It requires handling incomplete payments if the driver abandons
3. It adds operational complexity

So I'm comfortable with the limitation, but it's definitely the next thing I'd build."

**Why this answer works:** You named the problem, showed awareness of edge cases, gave a concrete solution, and justified why it wasn't built for MVP. This is how real engineers talk—not defensive, just practical.

---

### **Q5: How is payment handled? What about failed payments or refunds?**

**A:** "For MVP, we only support COD—Cash on Delivery. So when an order is created, payment_type is set to 'COD' and payment_status is 'unpaid'. The driver collects cash from the buyer, and an admin manually marks it as 'paid' in the dashboard after reconciliation. 

It's not ideal, but it removes a blocker. Building payment gateway integration needs a separate service (Stripe, Razorpay), PCI compliance, webhook handling for confirmation, and refund logic. For MVP, I wanted to validate the core flow first.

For refunds: right now, there's no automated refund system. If something goes wrong, the admin manually adjusts the commission or marks it differently. 

Looking at the schema, there's a payment_type column and payment_status column, so the database structure is ready to support online payments—I'd add them without schema changes. I'd:
1. Integrate a payment gateway
2. Create an order with status 'payment_pending'
3. Return a payment URL to the client
4. Use webhooks to confirm payment and move status to 'accepted'
5. Handle timeouts and failed payments

But again, not built yet because cash-first lets us launch faster."

**Why this answer works:** You clearly distinguished between MVP choices and production needs, showed the database was future-proofed, and gave a realistic upgrade path. You didn't pretend to have built complex payment logic if you haven't.

---

### **Q6: How is sensitive data like passwords and OTPs stored?**

**A:** "Passwords are handled by Supabase Auth entirely. I don't touch password hashing—it's managed by their auth service. When a user signs up, Supabase stores the hashed password in auth.users, not in my schema.

For OTPs, they're generated as random 6-digit or 4-digit codes, stored in plain text in the orders table. They're not hashed because they're single-use, short-lived, and not reusable like passwords. An OTP is only valid for a few minutes and only for one order. The driver receives it from the app, reads it to the buyer, and enters it in the delivery screen. Once marked delivered, the order is closed and that OTP is useless.

The risk is low: if someone got the OTP out of the database, they'd need to be at the buyer's location at the exact moment the driver arrives. It's not a strong security measure, but for MVP it's fine.

For production:
- I'd move OTPs to a cache like Redis with expiration
- Add attempt limits so you can't brute force
- Log OTP generation and use for audit trails

But for now, the Postgres table is fine. It's simple and it works."

**Why this answer works:** You showed awareness of what Supabase handles (relieving you of password responsibility), explained why OTPs don't need hashing, assessed the real risk, and gave a realistic upgrade path. You're not claiming security practices you haven't actually implemented.

---

### **Q7: How do you prevent a user from modifying someone else's order?**

**A:** "Two layers: Supabase RLS policies and role-based checks in the API.

At the database level, we have RLS policies:
- A buyer can only SELECT orders where the user_id matches their authenticated user
- A vendor can only SELECT/UPDATE orders for their shop
- A delivery driver can only UPDATE orders assigned to them
- Admins bypass RLS

So even if someone figures out an order ID and sends a direct database query, the policy blocks it.

In the API routes, I also verify: when you try to update an order, I check if you're the owner or the assigned driver. If not, 401 Unauthorized. It's redundant, but defense in depth.

For the frontend, I'm relying on client-side checks: don't show the button to update if the user isn't authorized. But I never trust the frontend—the backend always validates.

One thing I haven't done is rate limiting on the API routes. Someone could theoretically enumerate order IDs with GET requests. For production, I'd add rate limiting per user/IP and maybe obfuscate order IDs or use UUIDs (which I already do, so that's good)."

**Why this answer works:** You explained a real security mechanism you've implemented (RLS + API checks), acknowledged the layered approach, identified a limitation (rate limiting), and showed you know the difference between frontend checks and backend security. This is the right way to discuss authorization.

---

### **Q8: Walk me through your database schema. Why did you structure it this way?**

**A:** "The main tables are:

1. **shops**: shop_id (UUID), name, lat, lng, contact, address, owner info, login_code, photo. The login_code is unique per shop.

2. **products**: product_id, shop_id (foreign key), name, price, photo. Simple denormalization—I store the product name in the order, not just the ID, so if the product is deleted later, the order history is still readable.

3. **orders**: order_id, shop_id, buyer_id (the user who placed it), buyer_name, buyer_contact, buyer_lat, buyer_lng, buyer_address, products (stored as JSONB), total_price, status, payment_type, payment_status, delivery_boy_id, otp, created_at. The products column is JSON because order items are a snapshot—if a product's price changes, the order should reflect the old price.

4. **delivery_boys**: delivery_boy_id, name, contact, total_commission. Simple.

5. **commissions**: commission_id, delivery_boy_id, order_id, amount, paid_status. Ties each delivery to a payout.

6. **profiles**: user_id (foreign key to auth.users), role (admin, vendor, delivery, buyer), vendor_shop_id, delivery_boy_id, created_at. This is the bridge between Supabase Auth and our domain roles.

**Why JSONB for products?** Because an order is immutable once placed. The product name, price, quantity are fixed in time. Using JSONB instead of a junction table kept the queries simpler for reads and backups.

**Why separate commissions table?** So we can track what's paid, what's pending, and run accounting reports. Makes it easy to filter by paid_status = 'unpaid' and see how much is owed.

**What I'd change?** For scale, I'd add a user_activities or events table to log every order status change for audit trails. I'd also add geohash columns on shops and delivery_boys for faster spatial queries instead of doing lat/lng calculations in application code."

**Why this answer works:** You walked through the actual schema with reasoning, explained specific choices (JSONB, commissions table), and flagged what you'd improve. You didn't oversell the design, just explained the tradeoffs.

---

### **Q9: How do you handle real-time order updates across multiple devices?**

**A:** "Supabase has a Realtime feature built on Postgres LISTEN/NOTIFY. I subscribe to the orders table changes with a filter. So on the buyer's phone, I subscribe to orders where user_id = their ID. On the vendor's dashboard, they subscribe to orders where shop_id matches their shop. On the driver's app, they subscribe to orders where delivery_boy_id = theirs.

When an order status changes in the database, Postgres broadcasts it, and all connected clients get a message. I decode it and update the React state. This is handled in the API routes—when I do an order update, I don't manually broadcast; Supabase's Realtime subscription picks it up automatically.

The implementation is in components/notifications and the useEffect hooks in order-fetching code. We use SWR for regular polling too, so if the Realtime connection drops, we still have data freshness through SWR's background revalidation.

One limitation: Realtime doesn't guarantee ordering of events. If two updates happen very quickly, the client might apply them out of order. We handle this by always doing a full fetch on update, not just applying the delta. It's slightly wasteful but prevents bugs.

For production scale, if Realtime becomes a bottleneck, I'd move to a dedicated WebSocket server or Kafka for high-frequency updates."

**Why this answer works:** You named the actual technology (Supabase Realtime), explained how it works, showed awareness of a limitation (event ordering), and explained how you mitigate it. You also mentioned a backup (SWR polling) and a future upgrade path. This is honest technical discussion.

---

### **Q10: How do you test this? What's your test coverage?**

**A:** "I'll be honest—test coverage is pretty limited right now. For MVP, I focused on manual testing and integration testing.

What I've tested manually:
- Order creation flow: add to cart, checkout, order appears in vendor dashboard
- Status transitions: vendor marks ready, driver accepts, delivery completes
- Role-based access: a driver can't see or modify another driver's orders
- Payment status tracking: marking COD orders as paid

What I haven't done:
- Unit tests for utility functions
- API endpoint tests (no Jest/Vitest setup)
- Load testing—I don't know if this breaks at 100 concurrent orders
- Edge cases like what happens when two drivers accept the same order simultaneously

For a production system, I'd add:
1. Unit tests for critical functions: order validation, commission calculation
2. Integration tests for the full order flow using Supertest or similar
3. Database snapshot testing to catch schema migration bugs
4. End-to-end tests for the happy path and failure cases

I prioritized getting the features working over tests because it's MVP. But I know this is a debt I'm carrying."

**Why this answer works:** You admitted limitations instead of pretending. You showed what you did test, what you didn't, and acknowledged the cost. This maturity impresses interviewers more than false claims.

---

### **Q11: How do you handle errors when a shop is deleted?**

**A:** "Good edge case. In the database, products have a foreign key to shops with ON DELETE CASCADE, so deleting a shop automatically deletes all its products. Orders have the same—if a shop is deleted, all its orders cascade delete too.

This is fine for MVP, but in production it's destructive. You'd want to:
1. Mark shops as 'archived' or 'inactive' instead of deleting
2. Keep historical orders even if the shop is gone (for refunds, disputes, analytics)
3. Handle vendor requests to delete their account separately—soft delete the shop, keep the orders

Right now, I'm relying on the convention that we never hard-delete shops—we just never built a delete endpoint for them. But if an admin bypasses the UI and deletes directly, the cascade happens. It's a gap I'm aware of."

**Why this answer works:** You identified the risky behavior, explained why it's not a problem for MVP, and gave the right production behavior. You acknowledged it's relying on convention, which is a realistic limitation.

---

### **Q12: What's your latency for placing an order to it showing up in the vendor's dashboard?**

**A:** "In ideal case: < 1 second. The order POST request goes to the API, validates, inserts into Postgres, and returns. The Postgres insertion triggers a Realtime broadcast (through Postgres LISTEN/NOTIFY). If the vendor is subscribed, they get the event in milliseconds.

But latency varies:
- Network latency from buyer's phone to server: 50-200ms
- API processing: 50-100ms
- Database insert: 20-50ms
- Realtime broadcast: 50-100ms
- Client receiving and re-rendering: 0-100ms

Total worst case: ~600ms. If the vendor isn't subscribed (their tab is closed, stale connection), they won't see it until they refresh or re-open, which could be much longer.

For a 9-minute delivery service, sub-second is good. For truly critical systems, I'd add:
- Monitoring alerts if latency spikes above 2 seconds
- A fallback polling mechanism to detect stale orders every 10 seconds
- Database replication to read replicas for better performance

But I haven't measured actual latency in production because this is still MVP."

**Why this answer works:** You gave a realistic range instead of a number, broke down where time is spent, and explained the dependencies. You showed you've thought about monitoring and fallbacks without claiming to have built them.

---

### **Q13: If a vendor never marks an order ready, what happens?**

**A:** "Right now, nothing automatic. The order stays in 'pending' status indefinitely. The buyer would see it on their orders page as stuck. There's no timeout, no notification to the vendor, no escalation.

In production, you'd want:
1. A scheduled job that finds orders older than 10 minutes in 'pending' and marks them as 'rejected' or sends the vendor a reminder notification
2. Maybe a "claim" deadline—if the vendor doesn't claim within 5 minutes, the order is automatically offered to another nearby shop
3. Push notifications to the vendor's device with escalating urgency

But we didn't build this because:
- It requires background jobs (Bull, Temporal, or similar)
- Handling rejection/refund logic is complex
- For MVP, we're assuming vendors are responsive

It's a real problem at scale, but manageable with small order volumes. If we launch and see vendors are slow, this becomes a priority."

**Why this answer works:** You identified the problem, explained why it wasn't addressed, and gave a realistic upgrade path. You showed awareness that this would eventually be critical as the system scales.

---

### **Q14: How does commission calculation work?**

**A:** "When an order is delivered, a commission record is inserted into the commissions table. The amount is currently hardcoded in the API or passed from the frontend.

The schema supports it: commissions(commission_id, delivery_boy_id, order_id, amount, paid_status, created_at). So we can track which deliveries earned what commission and whether it's been paid.

In the admin dashboard, there's a commissions view where admins can see all commissions, filter by delivery boy, and mark them as paid. This is manual right now.

For production:
- Commission would be calculated by a business rule: e.g., 10% of total_price, or ₹20 per delivery, or distance-based
- That rule should be configurable per vendor or platform-wide
- There should be a weekly settlement process: aggregate all unpaid commissions for a driver, generate a report, initiate a payout

But for MVP, manually recording is fine. The data structure is there to support automation."

**Why this answer works:** You explained the current simple implementation, acknowledged it doesn't scale, and outlined what production looks like. You showed the schema was designed with the future in mind.

---

### **Q15: What would happen if the database goes down for 30 minutes?**

**A:** "Users can't place orders or check status. The API would return 500 errors because Supabase would be unavailable. The Realtime subscriptions would disconnect, so vendors wouldn't see live updates—the last thing they saw on screen is all they have.

Mitigation depends on what's available:
- If the database is read-only, I can serve cached data using SWR's fallback. The buyer would see stale orders, but at least they wouldn't see errors.
- If I had a replica, I could fail over to it.
- If I had a queue system (like Bull), in-flight orders could be persisted to Redis and replayed when the database recovers.

But I don't have any of these because:
1. Supabase has good uptime
2. Setting up replication adds complexity and cost
3. For MVP, we're okay with occasional downtime

If this was a critical service (like emergency delivery), I'd add:
- Database replication with automatic failover
- Distributed transaction logs (Kafka) to decouple order ingestion from database
- A circuit breaker in the API that fails gracefully

But we haven't, so it's a known limitation."

**Why this answer works:** You walked through the impact, explained what mitigations exist and why you didn't build them, and showed realistic thinking about tradeoffs between reliability and complexity for an MVP.

---

## 4. ARCHITECTURE & SYSTEM DESIGN QUESTIONS

### **Q: How would you scale this to handle 10x traffic?**

**A:** "A few bottlenecks to address:

1. **Database**: Supabase single instance can handle maybe 1000 concurrent connections. For 10x, I'd:
   - Set up read replicas for heavy queries (analytics, order history)
   - Shard data by region so each region has its own database
   - Move hot data (active orders) to Redis cache

2. **Realtime**: Supabase Realtime uses Postgres's LISTEN/NOTIFY under the hood, which doesn't scale to thousands of subscribers on the same table. I'd:
   - Use a proper pub/sub system like Redis Pub/Sub or Apache Kafka
   - Implement client-side backpressure: don't subscribe to all orders, only the ones relevant to you

3. **API layer**: Single Node.js process isn't enough. I'd:
   - Use a load balancer (AWS ELB)
   - Run multiple instances of the app on different servers
   - Add an API cache layer (Redis) in front to reduce database hits

4. **Background jobs**: Right now there are none. For 10x volume, I'd need:
   - Async order processing: validate and queue instead of synchronous inserts
   - Commission settlement jobs
   - Notification delivery jobs
   - Order timeout jobs

5. **Geolocation queries**: Currently calculating distance in code. At scale:
   - Index lat/lng with geohashing
   - Use spatial databases like PostGIS

**The hard part:** Realtime synchronization. If 10,000 vendors and drivers are watching 10,000 pending orders simultaneously, broadcasting every change is expensive. I'd implement:
- Hierarchical subscriptions: vendors only watch their region, orders only relevant to their shop
- Eventual consistency: accept that some clients see updates 2-5 seconds late

But the current architecture would need a rewrite, not just tuning."

---

### **Q: If you had to redesign this for a multi-city rollout, what would change?**

**A:** "Right now, the system assumes a single delivery area. To expand to multiple cities:

1. **Data isolation**: Add a city_id or region_id to every table. Shops belong to a city, orders belong to a city. This prevents vendors in Delhi seeing orders from Mumbai.

2. **Location tagging**: Make sure every entity (shop, delivery boy, order) has explicit city/region so queries filter by default.

3. **Separate databases per city**: For operational simplicity, I might spin up a separate Supabase instance per city. This avoids a complex multi-tenant architecture but increases operational overhead.

4. **Role changes**: An admin in one city shouldn't see or manage another city's data. Update RLS policies accordingly.

5. **Geolocation**: Instead of calculating distance to all drivers, implement geohashing or quadtrees so we only search drivers in the relevant region.

6. **Vendor onboarding**: Right now, lat/lng are optional. For multi-city, I'd make it mandatory and validate that the shop's location is within the city's delivery zone.

**Current gap:** We don't have a 'city' column in the schema, so it would require a migration. It's doable but not trivial. I'd add it sooner rather than later if expansion was on the roadmap."

---

### **Q: What's your disaster recovery plan?**

**A:** "For MVP, there isn't one. 

But if I had to build one:

1. **Database backups**: Supabase automatically backs up daily. I could restore from a backup if data is corrupted, but there's a recovery time objective (RTO) of hours.

2. **Application backups**: The code is on GitHub, so I can redeploy in minutes.

3. **Data recovery**: This is the hard part. If someone deletes all orders maliciously, the backup is the only recovery. I'd want:
   - Point-in-time recovery (restore to 1 hour ago)
   - Transaction logs so I can replay/undo specific changes
   - Immutable audit logs

4. **Failover strategy**: If the entire Supabase region is down:
   - Switch to a standby database in another region
   - Use DNS failover to route traffic
   - Accept a 30-minute RTO

5. **Monitoring**: Add alerts for:
   - Database latency spikes
   - Percentage of failed API requests
   - Unusual patterns (e.g., 10,000 orders from one IP)

**What I'm relying on:** Supabase's managed service. They handle database replication, backups, and uptime SLAs. If their service is down, we're down. For critical operations, I'd diversify: keep a shadow database or log stream elsewhere.

But for MVP, I'm comfortable depending on a managed service."

---

## 5. BACKEND & DATABASE QUESTIONS

### **Q: Walk me through the order creation API endpoint. What could go wrong?**

**A:** "POST /api/orders receives:
```json
{
  "shop_id": "uuid",
  "products": [{ "product_id", "name", "price", "quantity" }],
  "total_price": 450,
  "buyer_phone": "9876543210",
  "buyer_address": "123 Main St"
}
```

Steps:
1. **Auth check**: Verify user is authenticated. If not, 401.
2. **Parse body**: Try to JSON.parse. If malformed, 400.
3. **Validate fields**: shop_id, products array, total_price must exist. If not, 400.
4. **Verify shop exists**: Query shops table. If not found, 404.
5. **Generate OTP**: Random 4-digit code.
6. **Insert order**: Add to orders table. If duplicate shop_id + user_id + timestamp, might get unique constraint error.
7. **Return**: order_id, otp, status.

**What could go wrong:**

- **Negative total_price**: Client sends -1000. I should validate price > 0.
- **Empty products array**: Client sends products: []. I should reject it.
- **Product price mismatch**: Client sends product with name "Apple" but price 1 rupee. I'm not validating against the actual product in the database. They could undervalue everything.
- **Duplicate OTP**: The 6-digit code collides with an existing one (very unlikely, but possible). I'd hit a unique constraint error.
- **Concurrent inserts**: If two orders are placed for the same shop at the exact same nanosecond, there shouldn't be a problem. UUIDs are unique, timestamps are different.
- **Missing buyer_address**: I set it to empty string as default, but if it's required for delivery, orders are now impossible to fulfill.
- **Very large products array**: Sending 10,000 items. The API would time out or the database would reject a huge JSON payload.

**Fixes I'd add:**
```
- Validate total_price > 0 and < 10000 (cap)
- Validate products array is not empty
- Validate each product's price matches database
- Add idempotency key so retries don't create duplicate orders
- Add rate limiting per user per second
- Validate buyer_address is present
```

Current code doesn't all of these, so it's a real gap."

---

### **Q: How do you prevent overselling? What if all products have 0 quantity but someone orders?**

**A:** "Right now, I don't prevent overselling. There's no inventory system. The products table doesn't have a quantity column, so the database doesn't know if an item is in stock.

This is a deliberate MVP choice:
- For a grocery shop, inventory changes fast (multiple customers, restocking)
- Tracking it in real-time is complex and requires constant updates
- For MVP, we assume inventory is managed outside the system

But realistically, the order should fail if:
1. The shop doesn't have the product anymore
2. The quantity requested exceeds what's available

To prevent this:
1. Add an inventory table: product_id, current_quantity, reserved_quantity
2. When an order is placed, check inventory. If not available, return 400 with 'out_of_stock' error.
3. Reserve the quantity until the order is delivered
4. When the vendor marks 'ready', confirm the reservation or release it

But I haven't built this because:
- For MVP, we're assuming small shops that manage inventory manually
- Asking vendors to keep an online inventory is extra work
- It's better to launch with no inventory tracking and add it when vendors ask

It's a known limitation."

---

### **Q: Your order status flow is: pending → accepted → ready → picked_up → delivered. Why this design?**

**A:** "Good question. Let me walk through the flow:

1. **pending**: Order just created, waiting for the vendor to acknowledge. This is where errors happen (out of stock, wrong address, etc.). Vendor sees it and decides.

2. **accepted**: Vendor acknowledged the order, started preparing. No turning back now. Commission is now locked in.

3. **ready**: Vendor finished packing. Item is physically ready for pickup.

4. **picked_up**: Delivery driver picked up the package from the shop. This is when the driver 'claims' responsibility.

5. **delivered**: Buyer received the package and confirmed (via OTP).

Why this many states? To track progress. At each stage, different people have responsibility:
- **pending to accepted**: Vendor decides
- **accepted to ready**: Vendor prepares
- **ready to picked_up**: System assigns and driver claims
- **picked_up to delivered**: Driver's responsibility

**Alternative**: Collapse to fewer states (pending → ready → delivered). But then you lose visibility. The vendor and buyer don't know which stage the order is in.

**What I'm missing**: 
- A 'rejected' state. If the vendor can't fulfill, where does the order go? Right now it gets stuck.
- A 'delivery_failed' state. If the driver can't reach the address, what happens?
- A 'refunding' state if payment fails or customer disputes.

These are tracked elsewhere or handled manually. For a production system, I'd expand the status enum to handle error cases."

---

### **Q: Why did you use JSONB for the products field instead of a join table?**

**A:** "Good catch. In normalized design, you'd have:
```sql
CREATE TABLE order_items (
  id UUID,
  order_id UUID,
  product_id UUID,
  quantity INT,
  price NUMERIC
);
```

Then orders wouldn't have a products field; you'd join to get the items.

I used JSONB because:
1. **Immutability**: An order's items shouldn't change. Storing them as JSON makes it clear they're a snapshot. If a product's price changes, the order's copy is unaffected.
2. **Query simplicity**: I don't need to join for reads. A single query gets the full order. This is faster.
3. **No dependency**: If a product is deleted, the order still has its data. With a join, you'd have a foreign key constraint issue.

**Downsides**:
- Can't easily update items (though you shouldn't anyway)
- Can't query across all orders for "how many times was this product ordered" without parsing JSON
- Backup and restore is less granular

For MVP, I chose simplicity. For production with complex analytics, I'd use both: store JSONB for the order record, but also maintain a join table for analytics queries."

---

## 6. AUTHENTICATION, SECURITY & ROLE-BASED ACCESS

### **Q: How does Supabase Auth actually secure this? Walk me through the flow.**

**A:** "When a user signs up with email and password:

1. Frontend sends email + password to Supabase Auth endpoint (HTTPS only)
2. Supabase hashes the password using bcrypt, stores in auth.users table
3. Supabase returns a JWT token + refresh token to the client
4. Client stores the JWT in localStorage or cookie
5. For every API request, the client sends the JWT in the Authorization header
6. My API endpoint calls `supabase.auth.getUser()`, which verifies the JWT signature using Supabase's public key
7. If valid, the request proceeds. If not, 401 Unauthorized.

The JWT contains:
- user_id
- email
- user_metadata (which I use to store the role: admin, vendor, buyer, delivery)
- exp (expiration time, usually 1 hour)

**What Supabase handles**: Password hashing, JWT generation, signature verification, token refresh logic. I don't touch any of this.

**What I handle**: Role extraction from user_metadata, RLS policies based on role, API authorization checks.

**Security gaps**:
- JWT is stored in localStorage, vulnerable to XSS. A stolen token can be used until expiration.
- No rate limiting on login attempts. Someone could brute force.
- No 2FA for critical accounts (admin).
- No session invalidation. If a user logs out, the JWT is still valid until it expires.

For production:
- Store JWT in httpOnly cookies to prevent XSS
- Add rate limiting on login endpoint
- Implement 2FA for admin accounts
- Add a logout endpoint that invalidates tokens (requires a token blacklist in Redis)"

---

### **Q: How does the role-based access control (RBAC) work in your RLS policies?**

**A:** "I use Supabase's Row Level Security (RLS), which is a Postgres feature. Every table has policies.

Example, the orders table:

```sql
-- Buyer can only see their own orders
CREATE POLICY "Users can see own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Vendor can see orders for their shop
CREATE POLICY "Vendors see their shop orders"
  ON orders
  FOR SELECT
  USING (
    shop_id IN (
      SELECT vendor_shop_id FROM profiles 
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

-- Delivery driver can see assigned orders
CREATE POLICY "Drivers see assigned orders"
  ON orders
  FOR SELECT
  USING (delivery_boy_id = auth.uid());

-- Service role (admin via backend) can see everything
CREATE POLICY "Admins see all"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

So if a vendor tries to SELECT from orders, Postgres automatically filters to only rows where their shop owns the order. The filter happens at the database layer, not in application code. This is strong because even if I have a bug in my API, the database protects the data.

**How it works**: When a request comes in with a JWT, Supabase sets `auth.uid()` to the user's ID. Postgres uses that in the policies.

**Limitation**: This works for Supabase client-side libraries. For my Next.js API routes, I use the service role key (admin key), which bypasses RLS. So I have to manually check permissions in the API code. It's not as foolproof as RLS, but it works if my code is correct."

---

### **Q: What would happen if an admin accidentally gave a buyer the 'admin' role?**

**A:** "If I set user.user_metadata.role = 'admin' for a buyer:

1. That user's JWT would now contain role: admin
2. In the API, I'd check `if (user.role === 'admin')` and grant access
3. They'd see the admin dashboard and could view all orders, modify commissions, etc.

This is bad. To prevent it:

1. **Don't let users modify roles**: Role assignment should be a separate restricted endpoint that requires admin authentication.
2. **Audit logs**: Log every role change with who made it, when, and why.
3. **Approval workflow**: Role changes should require multi-person approval, especially for admin.
4. **Least privilege**: Use JWT scopes or fine-grained roles. Instead of just 'admin', have 'admin_orders', 'admin_shop', 'admin_payments'. An account might be admin_orders but not admin_payments.

Right now, I'm not doing any of this. Role assignment is manual or happens once during signup. It's a gap I'm aware of."

---

### **Q: How do you prevent a vendor from seeing another vendor's shop orders?**

**A:** "Two mechanisms:

1. **RLS Policy** (database level):
```sql
CREATE POLICY "Vendors see only their shop orders"
  ON orders
  FOR SELECT
  USING (
    shop_id = (
      SELECT vendor_shop_id FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

2. **API check** (application level):
```typescript
// In the vendor dashboard API
const vendorProfile = await supabase
  .from('profiles')
  .select('vendor_shop_id')
  .eq('id', user.id)
  .single();

if (order.shop_id !== vendorProfile.vendor_shop_id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

So if a vendor tries to fetch another shop's orders, either:
- The RLS policy blocks it (if they use the client SDK)
- The API returns 401 (if they use the API directly)

It's defense in depth. The RLS is the primary control, the API check is a sanity check."

---

## 7. REAL-WORLD EDGE CASES & FAILURE SCENARIOS

### **Q: What happens if a buyer places two orders to the same shop while the first one is still pending?**

**A:** "No technical prevention. They'd create two separate orders, both with status 'pending'. The vendor would see both. If they accept both, the vendor needs to prepare two separate batches. The system allows it.

This is actually fine—customers do order multiple times. But there are edge cases:

1. **Both orders at the same time**: The delivery driver gets assigned to both. They pick up both packages at once.
2. **Race condition**: If the orders are submitted at the exact same nanosecond, do they both get unique OTPs? Yes, because OTP generation is random and the orders have different UUIDs.

**What could be a problem**: If I had a 'per-shop-per-user' unique constraint (only one pending order per shop), multiple orders would fail. But I don't have that, so it's allowed.

For production, I might want to:
- Warn the customer: 'You already have a pending order from this shop. Continue?'
- Merge orders: Automatically combine into one if both are placed within 30 seconds
- But these are optimizations, not requirements"

---

### **Q: The order has status 'ready', but the vendor changes the product's price. Does the order reflect the new price?**

**A:** "No. The order has a JSONB field with the product name and price baked in. If the vendor updates the product row, the order data is unchanged.

This is by design. An order is a contract: 'You're paying ₹100 for 2 oranges'. If the price changes after order creation, the old price holds.

But what if the vendor deletes the product entirely? The order still references product_id in the JSON. On the frontend, when rendering the order, I'd look up the product. If it's deleted, I'd show '(Product Unavailable)' or just use the name from the JSON.

**Edge case**: What if the vendor reuses a deleted product's ID (UUID collision)? Extremely unlikely, but theoretically possible. The order would show the new product, which is wrong. This is why immutable product snapshots matter—storing the name and price, not just the ID."

---

### **Q: A delivery driver marks an order as delivered, but the buyer says they never received it. How do you handle the dispute?**

**A:** "Right now, no built-in dispute system. The order is closed, commission is paid.

To handle this manually:
1. Customer contacts support (via phone, we don't have in-app chat)
2. Admin looks at the order, checks the OTP (did the driver actually get it?)
3. Admin manually reverses the commission, marks the order as 'disputed'
4. Decides who's at fault and refunds accordingly

For a production system:
1. **Proof of delivery**: The driver takes a photo of the package at the delivery location with timestamp.
2. **Dispute window**: If the buyer doesn't confirm within 2 hours of marking delivered, flag it as suspicious.
3. **Arbitration**: Show both sides evidence (photo, OTP, GPS location), decide on refund.
4. **Chargeback protection**: Track drivers with high dispute rates.

This is complex and requires trust, photo storage, and a process to decide fairly. It's not built yet."

---

### **Q: What if a shop creates 100 products but only 5 are actually available? Customers order the unavailable ones.**

**A:** "This is the inventory problem I mentioned. Without stock tracking:
- Customer orders 'Milk' for ₹50
- Shop accepts, marks ready
- Driver arrives and shop says 'Milk is finished'
- Now what?

Options:
1. Driver refuses to pick up, order is cancelled, customer is refunded (COD, so manual)
2. Driver gets a different item as substitution
3. Driver returns to the shop, shop immediately refunds

None of these are automated. It's a customer service issue.

To fix:
- Implement real inventory with stock levels
- When stock = 0, mark the product as 'unavailable', hide from customers
- When an order is placed, reserve stock (so two customers can't order the last item)
- When delivered, deduct stock

But again, this requires vendors to keep inventory updated in real-time, which is a new operational burden."

---

### **Q: The database is in Mumbai region, but you want to expand to Delhi. What breaks?**

**A:** "Many things:

1. **Latency**: Queries from Delhi hit Mumbai database, ~100ms added latency. Okay, but not ideal.

2. **Regulatory**: If India requires data residency (data for Delhi customers must be in Delhi), this violates compliance.

3. **RLS doesn't know regions**: The RLS policies don't have geofencing. A Delhi vendor could theoretically see Mumbai orders if I made a mistake.

4. **Realtime broadcasts**: Supabase Realtime would broadcast order changes to all cities, creating unnecessary noise.

5. **Backups**: Backup is in one region. If the region goes down, both cities are affected.

To fix:
- Spin up a separate Supabase instance in Delhi
- Duplicate the schema
- Add logic in the app to route requests to the right database based on the user's city
- This means deploying multiple instances, more operational overhead

Or:
- Keep one database but add explicit city filtering to every query
- Accept some latency as a tradeoff for simplicity

For MVP in one city, it's fine. For multi-city, this becomes important."

---

## 8. TRAP / BLUFF-KILLER QUESTIONS INTERVIEWERS ASK

### **Q: Can I just store passwords in plain text in the database if I don't care about security?**

**A:** "No, you shouldn't. Even if you don't care now, it's a bad habit. If the database is ever breached, passwords are immediately compromised. Also, password reuse is common—someone might use the same password for your app and their bank.

But more pragmatically: I'm using Supabase Auth, so I don't store passwords at all. They handle it. If you're building from scratch, use bcrypt or scrypt. Don't reinvent hashing.

For this project, password storage isn't my concern."

---

### **Q: You're using Supabase. What if they shut down? Your whole app is toast, right?**

**A:** "That's a real risk, yes. Supabase is a managed service. If they go out of business or deprecate a feature I depend on, I'd need to migrate.

But the tradeoff is:
- **Supabase route**: I get Auth, Database, Realtime, Storage for free/cheap. I build faster. Risk is vendor lock-in.
- **Self-hosted route**: I run Postgres, build my own Auth service, my own Realtime system. More control, but more work and operational overhead.

For MVP, betting on Supabase makes sense. For production with millions of users, I might migrate to a self-hosted setup or a larger provider like AWS RDS.

The code is designed to be somewhat portable: all database calls go through the Supabase client. If I replaced Supabase with raw Postgres, I'd rewrite the client calls but the API logic would be similar.

So it's not completely locked in, but there's a cost to migrating."

---

### **Q: You're not encrypting payment data. Doesn't that violate PCI DSS?**

**A:** "Yes, but we're not handling payment data. We're using COD (Cash on Delivery), so no card numbers or payment details are stored in our database. The payment is cash, handled offline.

If we integrated a payment gateway like Stripe, Stripe handles PCI compliance. They encrypt card data, we never see it. Our API would just forward the data to Stripe and trust their responses.

So currently, we're not subject to PCI DSS because we don't touch payment data. Once we add online payments, we'd ensure Stripe or a similar PCI-compliant processor handles the data."

---

### **Q: What's the difference between authentication and authorization in your system?**

**A:** "Good question.

**Authentication**: Verifying who you are. 'You claim to be user@example.com with password 'xyz'. Let me verify.' This is Supabase Auth. They confirm your identity and return a JWT.

**Authorization**: Verifying what you're allowed to do. 'You're authenticated as user@example.com. Are you allowed to view this order?' This is RLS policies + API checks.

In my system:
- **Auth**: Supabase handles completely. I don't write auth code.
- **Authz**: I write with RLS policies (database level) and permission checks in API routes (application level).

If someone asks 'How do you prevent unauthorized access?', they're asking about authz. If they ask 'How do you know who the user is?', they're asking about auth."

---

### **Q: You're using UUIDs for primary keys. Why not auto-increment integers?**

**A:** "UUIDs are globally unique and can be generated client-side. Auto-increment integers are simpler and smaller (4 bytes vs 16 bytes).

I chose UUIDs because:
1. I'm not coordinating across databases yet. With auto-increment, if I have replica databases, ID collisions are possible.
2. It's easier to merge data from different sources without reindexing.
3. UUIDs are standard for distributed systems.

Downside: UUIDs take more storage and are slower to index. For a single-instance database, auto-increment would be fine.

But UUIDs are a safe default for a distributed system, and it's not a bottleneck at MVP scale."

---

### **Q: How do you prevent SQL injection in your queries?**

**A:** "I'm not writing raw SQL. I'm using Supabase's client library, which uses parameterized queries under the hood.

Example:
```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId);
```

This generates:
```sql
SELECT * FROM orders WHERE id = $1;
```
with `orderId` as a parameter, not string interpolation.

If a user passes `orderId = "abc'; DROP TABLE orders; --"`, it's treated as a literal string, not SQL code.

So injection is not a risk in my system. But I'm relying on Supabase's client to do this correctly. If I ever write raw SQL (which I haven't), I'd need to use parameterized queries or an ORM."

---

### **Q: You generate OTPs randomly. What if two orders get the same OTP?**

**A:** "UUIDs for orders have unique constraints, so each order is unique. For OTPs, I generate a random 6-digit code. 

Probability of collision: 1 in 1,000,000 if there are a million orders. For MVP, this is extremely unlikely. But technically possible.

To fix:
```sql
ALTER TABLE orders ADD CONSTRAINT unique_otp UNIQUE (otp);
```

Then if a collision happens, the insert fails, and I regenerate and retry. But this adds a loop and complexity.

For MVP, I'm not doing this. If it becomes a problem (which it won't at our scale), I'd add it.

A better approach: instead of random 6-digit, use a hash of (order_id + secret) to make them deterministic and unique by definition. But a random code is simpler and works fine."

---

## 9. "WHAT WOULD YOU IMPROVE?" QUESTIONS (Safe Answers)

### **Q: What's the first thing you'd build after MVP is proven?**

**A:** "Three things are tied for first:

1. **Inventory management**: Right now, there's no way to track stock. Vendors need to manually update availability, or customers order items that are out of stock. This causes friction. I'd add:
   - Stock level per product
   - Automatic hide/show products based on availability
   - Reservation system so two customers can't order the last item

2. **Dispute resolution**: If a buyer says they didn't receive an order, there's no built-in way to handle it. I'd add:
   - Photo proof of delivery
   - Dispute form for customers
   - Refund workflow for vendors/admins

3. **Payment integration**: COD works, but online payments remove friction. I'd integrate Razorpay or Stripe so customers can pay instantly instead of paying cash.

Whichever problem customers complain about most, I'd fix first. For now, it's unclear. If I had to guess, inventory is most annoying because it causes cancellations."

---

### **Q: How would you improve the real-time system?**

**A:** "Three improvements:

1. **Event ordering**: Right now, updates can arrive out of order. If an order goes pending → accepted → ready, the client might apply them as pending → ready → accepted if the network reorders them. I'd add a version number to each order, and the client only applies updates if the version is higher than what they have.

2. **Offline support**: If the Realtime connection drops, the client has stale data. I'd persist the last state to local storage and queue updates when reconnected.

3. **Subscription filtering**: Right now, you subscribe to all changes in a table. For 10,000 vendors and 100,000 orders, that's excessive. I'd implement per-shop subscriptions or region-based subscriptions so each vendor only gets updates relevant to them.

These are optimizations, not blockers. The current system works fine for MVP."

---

### **Q: How would you add customer support/chat?**

**A:** "Right now, there's no in-app communication. If a customer has a question, they'd call the vendor or contact support via phone.

To add chat:
1. **Chat table**: messages(id, order_id, user_id, text, created_at, read_at)
2. **Real-time subscriptions**: Each user subscribes to messages for their orders. When a new message arrives, they see it instantly.
3. **Notifications**: Ping the other party that they have a new message.
4. **Escalation**: If a vendor doesn't respond within 10 minutes, auto-escalate to support.

Implementation is straightforward—it's similar to the notification system I already have. The hard part is customer support operations: who answers when there's a problem?

For MVP, I'd skip this and just put a phone number for support. Once there are 100+ daily orders, chat becomes valuable."

---

### **Q: How would you optimize for slow networks?**

**A:** "Right now, the API returns full order objects which can be several KB. For users on 2G networks, this is slow.

1. **Pagination**: Instead of fetching all orders at once, fetch 10 at a time. Implement cursor-based pagination.
2. **Compression**: Already done by HTTP layer (gzip).
3. **Selective fields**: Let the client request only the fields they need. Instead of returning the full order JSON, maybe just return order_id, status, total_price.
4. **Local caching**: Cache orders on the client so repeated fetches are instant.
5. **Image optimization**: Compress shop photos and product photos before uploading.

I'm doing some of this (SWR has caching). The others are nice-to-haves."

---

### **Q: How would you handle a surge in orders (e.g., flash sale)?**

**A:** "If 1000 orders hit the API in 30 seconds:

1. **Queue them**: Instead of synchronous inserts, push them to a queue (Redis, Bull). The API returns 202 Accepted immediately. Background workers process orders at a sustainable rate.

2. **Rate limit**: Limit each user to 5 orders/minute so one person can't spam.

3. **Database**: Postgres can handle 1000 inserts/sec, so it's fine. But disk I/O might spike. Add read replicas to distribute load.

4. **Frontend**: The homepage might load slowly if it's fetching shop lists. Cache shop data aggressively.

Currently, there's no queue. Requests are synchronous. For MVP, we don't expect flash sales. But if a sale happens and breaks the system, adding a queue is the first fix."

---

## 10. WEAKNESSES & LIMITATIONS (Framed Professionally)

### **Current Architecture Limitations**

1. **No inventory system**
   - Impact: Customers order out-of-stock items
   - Risk: Order cancellations, customer frustration
   - Mitigation: For now, assuming small shops with limited SKUs; easy to add later
   - Timeline: Would add if vendors request

2. **Synchronous order processing**
   - Impact: API blocks while inserting into database; if database is slow, user waits
   - Risk: Timeouts during traffic spikes
   - Mitigation: For MVP volumes, acceptable
   - Timeline: Would add queue system if avg response time exceeds 500ms

3. **No automated dispute resolution**
   - Impact: Customer claims non-delivery; manual support process required
   - Risk: Support team bottleneck, angry customers
   - Mitigation: For MVP, low order volume means support is manageable
   - Timeline: Would add after 1000+ daily orders

4. **Single database instance**
   - Impact: Cannot scale beyond one region without latency
   - Risk: Cannot expand to multiple cities easily
   - Mitigation: For MVP, focused on one city
   - Timeline: When expanding, would shard or multi-tenant design

5. **No end-to-end encryption for sensitive data**
   - Impact: Support staff can view all customer addresses and phone numbers
   - Risk: Privacy issue
   - Mitigation: Access logs, restricted admin access
   - Timeline: Would add field-level encryption if customers demand privacy

6. **Limited test coverage**
   - Impact: Edge cases might break in production
   - Risk: Bugs discovered after launch
   - Mitigation: Manual testing before launch, monitoring post-launch
   - Timeline: Would add automated tests once architecture stabilizes

7. **No rate limiting**
   - Impact: Someone could spam the API with fake orders
   - Risk: DOS attack
   - Mitigation: For MVP with small user base, low risk
   - Timeline: Would add before opening to public

8. **OTP stored in plain text**
   - Impact: Database breach = OTPs compromised
   - Risk: Low (OTPs are single-use and time-limited)
   - Mitigation: OTPs expire in 30 minutes, so window is narrow
   - Timeline: If OTP is ever leaked, would hash them

### **How to Frame These in an Interview**

**Wrong way**: "Oh, we have a lot of issues... inventory system is broken, payment processing is sketchy, security is weak..."

**Right way**: "The current system is optimized for MVP: fast to build, easy to understand. As we scale, we've identified the constraints: inventory tracking, distributed deployments, and rate limiting. These are intentional tradeoffs—we chose velocity over perfection for the initial phase. The architecture is designed to accommodate these improvements without major rewrites."

**Example answer to 'What are your biggest risks?':**

"Our biggest technical risk is the single-database architecture. If we expand to 3+ cities simultaneously, latency becomes unacceptable. Our mitigation is to launch in one city first, validate the business model, then plan a multi-region deployment.

Our operational risk is vendor/driver onboarding. Right now, a lot is manual: generating login codes, adding shops, assigning delivery boys. As we scale, this becomes a bottleneck. Solution: build an admin portal for self-service onboarding.

Our customer risk is the inventory problem. If vendors don't update stock in real-time, customers order unavailable items. We're mitigating this by starting with well-stocked shops and implementing inventory tracking in V2."

---

## BONUS: Questions You SHOULD Ask Interviewers

If they ask 'Do you have any questions for us?', show depth:

1. **"How does this product get monetized? I designed the system assuming COD, but if you're considering marketplace fees or subscription, that affects the commission structure."**

2. **"What's your scale expectation for the first year? That informs whether we keep Supabase or need a custom backend."**

3. **"Are there regulatory requirements I should know about? Data residency, payment compliance, labor laws for delivery partners?"**

4. **"How do you handle vendor disputes? If a vendor claims they never received a commission, what's the process?"**

5. **"What's your customer support strategy? Are we building in-app chat, phone support, WhatsApp integration?"**

These show you're thinking beyond just code—about business, operations, and user experience.

---

## FINAL REMINDERS

✅ **Do**: Explain tradeoffs, show awareness of limitations, discuss how you'd improve

✅ **Do**: Reference actual code and architecture you built

✅ **Do**: Speak like an engineer who ships, not a student who memorized textbooks

✅ **Do**: Use numbers (6-digit OTP, <1 second latency, 10,000 concurrent connections)

✅ **Don't**: Claim features you didn't build or security you didn't implement

✅ **Don't**: Pretend everything is optimized and perfect

✅ **Don't**: Blame the tech stack or framework for your design choices

✅ **Don't**: Answer questions you don't know with vague jargon—say "That's a good question, I haven't built that yet, but here's how I'd approach it"

---

**Good luck!**
