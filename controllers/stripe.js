const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { recipeId, title, image, origin } = req.body;
    

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              images: [image],
            },
            unit_amount: 499, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?recipeId=${recipeId}`,

      cancel_url: `${origin}/payment-cancel`,  
      metadata: {
        recipeId,
        userId: req.userId,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Checkout error:', err);
    res.status(500).json({ error: 'Checkout session creation failed' });
  }
};

module.exports = { createCheckoutSession };
