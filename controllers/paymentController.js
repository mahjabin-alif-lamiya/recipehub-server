import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { getCollections } from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PREMIUM_PRICE_CENTS = 999; // $9.99 one-time premium membership

// POST /api/payments/create-checkout-session
// type: "recipe" (buy one recipe) | "premium" (unlock unlimited recipes)
export async function createCheckoutSession(req, res, next) {
  try {
    const { type, recipeId } = req.body;
    const { recipes } = getCollections();

    let lineItem;
    let metadata = { userId: req.user.id, userEmail: req.user.email, type };

    if (type === "recipe") {
      const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) });
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found." });
      }
      lineItem = {
        price_data: {
          currency: "usd",
          product_data: { name: `Recipe: ${recipe.recipeName}` },
          unit_amount: 199,
        },
        quantity: 1,
      };
      metadata.recipeId = recipeId;
    } else if (type === "premium") {
      lineItem = {
        price_data: {
          currency: "usd",
          product_data: { name: "RecipeHub Premium Membership" },
          unit_amount: PREMIUM_PRICE_CENTS,
        },
        quantity: 1,
      };
    } else {
      return res.status(400).json({ message: "Invalid payment type." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
      metadata,
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/recipe/${recipeId || ""}`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    next(error);
  }
}

// Stripe calls this after a successful payment. Must be mounted with
// express.raw() (see server.js) so the signature can be verified.
export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, userEmail, type, recipeId } = session.metadata;
    const { users, payments } = getCollections();

    await payments.insertOne({
      userEmail,
      userId,
      amount: session.amount_total / 100,
      recipeId: recipeId || null,
      transactionId: session.payment_intent,
      paymentStatus: "paid",
      paidAt: new Date(),
    });

    if (type === "premium") {
      await users.updateOne({ _id: new ObjectId(userId) }, { $set: { isPremium: true } });
    }
  }

  res.status(200).json({ received: true });
}

export async function getMyPayments(req, res, next) {
  try {
    const { payments, recipes } = getCollections();
    const paymentDocs = await payments
      .find({ userId: req.user.id, recipeId: { $ne: null } })
      .sort({ paidAt: -1 })
      .toArray();

    const recipeIds = paymentDocs.map((p) => new ObjectId(p.recipeId));
    const purchasedRecipes = await recipes.find({ _id: { $in: recipeIds } }).toArray();

    res.status(200).json({ recipes: purchasedRecipes });
  } catch (error) {
    next(error);
  }
}

export async function getAllPayments(req, res, next) {
  try {
    const { payments } = getCollections();
    const items = await payments.find().sort({ paidAt: -1 }).toArray();
    res.status(200).json({ payments: items });
  } catch (error) {
    next(error);
  }
}