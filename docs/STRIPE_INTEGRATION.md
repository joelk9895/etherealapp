# Stripe Payment Integration

This document explains how to set up and configure Stripe payments for the Ethereal Techno platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables

Copy the Stripe environment variables from `.env.stripe.example` to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URL (for Stripe redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Enable Stripe automatic tax
STRIPE_TAX_ENABLED=false
```

### 3. Stripe Dashboard Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:

   - Go to Developers > API Keys
   - Copy the Publishable key and Secret key
   - Use test keys for development (they start with `pk_test_` and `sk_test_`)

3. **Set up Webhooks**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret

### 4. Database Schema

The integration requires the following Prisma schema updates (already included):

```prisma
model Order {
  stripeSessionId String? // Stripe checkout session ID
  // ... other fields
}
```

## How It Works

### 1. Checkout Process

1. User adds items to cart (`/cart`)
2. User clicks "Proceed to Checkout"
3. System creates order in database (`/api/checkout`)
4. System creates Stripe checkout session with product metadata
5. User is redirected to Stripe's hosted checkout page
6. User completes payment on Stripe

### 2. Payment Completion (Webhook)

1. Stripe sends webhook to `/api/webhooks/stripe`
2. Webhook verifies signature and processes `checkout.session.completed` event
3. System updates order status to `COMPLETED`
4. System creates `PurchasedSample` records with unique download tokens
5. **For authenticated users**: Cart is automatically cleared
6. **For guest users**: Purchase is linked to email address
7. User is redirected to success page (`/checkout/success`)

### 3. Download Process

1. **Authenticated users**: Downloads appear automatically in dashboard
2. **Guest users**: Can enter email on success page to get download links
3. Download link format: `/api/download/[unique-token]`
4. System validates download token, limits, and expiration
5. System generates presigned S3 URL for actual file
6. System increments download count and redirects to S3 file
7. User receives actual signed audio file from S3

### 4. User Experience Flows

#### **Authenticated User Flow**

- ✅ Add items to cart
- ✅ Checkout with Stripe
- ✅ Automatic redirect to success page
- ✅ Downloads automatically appear in dashboard
- ✅ Cart is automatically cleared
- ✅ Purchase history tracked

#### **Guest User Flow**

- ✅ Add items to cart (stored in session)
- ✅ Checkout with Stripe (email collected during payment)
- ✅ Redirect to success page
- ✅ Enter email to get download links
- ✅ Option to create account to save purchases
- ✅ Downloads accessible via unique tokens

## API Endpoints

### `/api/checkout` (POST)

Creates Stripe checkout session and order record.

**Request Body:**

```json
{
  "cartItems": [
    {
      "id": "cart_item_id",
      "sampleId": "sample_id",
      "title": "Sample Title",
      "producer": "Producer Name",
      "price": 9.99,
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com" // Optional for guests
}
```

**Response:**

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_...",
  "orderId": "order_id",
  "sessionId": "cs_..."
}
```

### `/api/webhooks/stripe` (POST)

Handles Stripe webhook events.

### `/api/orders/[orderId]` (GET)

Fetches order details for success page.

**Query Parameters:**

- `session_id`: Stripe session ID for verification

### `/api/download/[token]` (GET)

Provides secure download for purchased samples.

## Security Features

1. **Webhook Signature Verification**: All webhook calls are verified using Stripe's signature
2. **Session Validation**: Order details are only accessible with valid Stripe session ID
3. **Download Tokens**: Unique tokens for each purchased sample
4. **Download Limits**: Configurable download count and expiration
5. **S3 Presigned URLs**: Temporary, secure download links

## Testing

### Test Cards

Use Stripe's test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Webhook Testing

Use Stripe CLI to forward webhooks to local development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Deployment

1. **Replace test keys** with live keys in production environment
2. **Update webhook endpoint** to production URL
3. **Configure CORS** for your domain in Stripe dashboard
4. **Set up monitoring** for webhook delivery and payment failures
5. **Test thoroughly** with small amounts before going live

## Error Handling

The system handles various error scenarios:

- Invalid cart items
- Payment failures
- Webhook signature verification failures
- Download token expiration
- Download limit exceeded
- S3 file access issues

All errors are logged and appropriate responses are sent to users.

## Cart Integration

The cart system automatically works with both:

- **Authenticated users**: Cart stored in database
- **Guest users**: Cart stored in cookies/session

Authentication is handled automatically in the checkout process.
