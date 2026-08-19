import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerOrderDetails } from "@/components/orders/CustomerOrderDetails";
import { getPublicOrder } from "@/lib/admin/repository";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Customer order | ITEMS",
  robots: { index: false, follow: false }
};

type CustomerOrderPageProps = {
  params: Promise<{ token: string }>;
};

export default async function CustomerOrderPage({ params }: CustomerOrderPageProps) {
  const { token } = await params;
  const detail = await getPublicOrder(token);
  if (!detail) notFound();
  return <CustomerOrderDetails order={detail.order} lines={detail.lines} token={token} />;
}
