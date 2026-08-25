import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
	? new Stripe(process.env.STRIPE_SECRET_KEY)
	: null;

export async function createAppointmentPaymentLink(booking: {
	id: number;
	firstName: string;
	email: string;
	classType: string;
}) {
	if (!stripe) return process.env.STRIPE_PAYMENT_LINK_URL ?? "";
	const priceId =
		process.env[
			`STRIPE_PRICE_${booking.classType.toUpperCase().replaceAll("-", "_")}`
		];
	if (!priceId)
		throw new Error(`No Stripe price configured for ${booking.classType}`);
	const link = await stripe.paymentLinks.create({
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: { bookingId: String(booking.id) },
		customer_creation: "always",
		after_completion: {
			type: "redirect",
			redirect: { url: process.env.APP_URL ?? "http://localhost:5173" },
		},
	});
	return link.url;
}
