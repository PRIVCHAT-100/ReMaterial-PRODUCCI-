export function getProductTitle(p: any): string {
  return (p?.title ?? p?.name ?? p?.product_title ?? "").toString();
}
