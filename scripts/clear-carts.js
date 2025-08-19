const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearCarts() {
  try {
    console.log('Clearing cart items...');
    await prisma.cartItem.deleteMany({});
    console.log('Cart items cleared.');
    
    console.log('Clearing guest cart items...');
    await prisma.guestCart.deleteMany({});
    console.log('Guest cart items cleared.');
    
    console.log('All cart data cleared successfully!');
  } catch (error) {
    console.error('Error clearing carts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCarts();
