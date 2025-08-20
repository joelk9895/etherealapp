import Stripe from 'stripe';

// Make sure we have the Stripe key before initializing
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-07-30.basil', // Using the latest API version compatible with stripe v18
});
