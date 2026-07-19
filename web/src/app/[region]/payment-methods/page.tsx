import { getPaymentMethods } from "../_lib/api";

export default async function RegionPaymentMethodsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const paymentMethods = await getPaymentMethods(region);

  if (paymentMethods.length === 0) {
    return (
      <div id="region-payment-methods-page" className="region-payment-methods">
        <h2 className="mb-4 text-xl font-semibold text-primary-900">Payment Methods</h2>
        <p className="region-payment-methods__empty text-sm text-primary-500">
          No payment methods available for this region yet.
        </p>
      </div>
    );
  }

  return (
    <div id="region-payment-methods-page" className="region-payment-methods flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-primary-900">Payment Methods</h2>

      <div className="region-payment-methods__grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((method) => (
          <article
            key={method.id}
            className="region-payment-method-card flex flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-6"
          >
            <h3 className="region-payment-method-card__name text-base font-semibold text-primary-900">
              {method.name}
            </h3>
            <p className="region-payment-method-card__description text-sm text-primary-600">
              {method.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
