export type PaymentSheetResult = 'paid' | 'canceled' | 'failed' | 'unavailable';

interface PaymentSheetRequest {
  /** Clave pública de Stripe que entrega la API junto al cobro. */
  publishableKey: string;
  /** Cuenta de Stripe del centro: el cobro vive en ella (cobro directo) y la hoja debe abrirse en ella. */
  connectedAccountId: string;
  /** Secreto del cobro; vive solo mientras la hoja está abierta. */
  clientSecret: string;
  /** El nombre del centro, que es quien cobra. */
  merchantName: string;
}

/**
 * El módulo nativo de Stripe se carga al pagar y no al abrir la app: en una app de desarrollo
 * anterior a Stripe todo lo demás sigue funcionando y solo el pago avisa (`unavailable`).
 */
function loadStripeModule(): typeof import('@stripe/stripe-react-native') | null {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-require-imports -- carga diferida a propósito (arriba) */
    return require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');
  } catch {
    return null;
  }
}

/** Abre la hoja de pago de Stripe y dice cómo terminó; nunca guarda ni ve datos de la tarjeta. */
export async function presentPaymentSheet(
  request: PaymentSheetRequest,
): Promise<PaymentSheetResult> {
  const stripe = loadStripeModule();
  if (stripe === null) return 'unavailable';
  try {
    await stripe.initStripe({
      publishableKey: request.publishableKey,
      stripeAccountId: request.connectedAccountId,
    });
    const initialization = await stripe.initPaymentSheet({
      paymentIntentClientSecret: request.clientSecret,
      merchantDisplayName: request.merchantName,
      allowsDelayedPaymentMethods: false,
    });
    if (initialization.error) return 'failed';
    const { error } = await stripe.presentPaymentSheet();
    if (error === undefined) return 'paid';
    return error.code === stripe.PaymentSheetError.Canceled ? 'canceled' : 'failed';
  } catch {
    return 'unavailable';
  }
}
