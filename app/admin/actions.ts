"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authenticateAdmin, createAdminSession, requireAdmin, revokeCurrentAdminSession } from "@/lib/auth/admin";
import { addItemImages, archiveArtist, archiveItem, createOrder, deleteDraftOrder, saveArtist, saveItem, type OrderStatus, type PaymentStatus, updateOrder } from "@/lib/admin/repository";
import { isChecked, optionalText, parseLinks, parseLines, parseNonNegativeInteger, parseOptionalUrl, parsePriceCents, parseSeoDescription, parseSeoTitle, parseSlug, requiredText } from "@/lib/admin/validation";
import { getStorageProvider } from "@/lib/storage/supabase-storage";

function asOptionalFile(value: FormDataEntryValue | null) {
  return typeof File !== "undefined" && value instanceof File && value.size > 0 ? value : null;
}

function parseArtistInput(formData: FormData, profileImagePath: string | null) {
  return {
    slug: parseSlug(formData.get("slug")),
    name: requiredText(formData.get("name"), "Name"),
    role: optionalText(formData.get("role")),
    description: optionalText(formData.get("description")),
    email: optionalText(formData.get("email")),
    websiteUrl: parseOptionalUrl(formData.get("websiteUrl"), "Website"),
    seoTitle: parseSeoTitle(formData.get("seoTitle")),
    seoDescription: parseSeoDescription(formData.get("seoDescription")),
    profileImagePath,
    profileImageAlt: optionalText(formData.get("profileImageAlt")),
    initiallyExpanded: isChecked(formData.get("initiallyExpanded")),
    isPublished: isChecked(formData.get("isPublished")),
    sortOrder: parseNonNegativeInteger(formData.get("sortOrder"), "Sort order"),
    links: parseLinks(formData.get("socialLinks"))
  };
}

function parseItemInput(formData: FormData) {
  const currency = (optionalText(formData.get("currency")) ?? "MYR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Currency must be a three-letter code.");
  return {
    artistId: requiredText(formData.get("artistId"), "Artist"),
    slug: parseSlug(formData.get("slug")),
    name: requiredText(formData.get("name"), "Name"),
    description: requiredText(formData.get("description"), "Description"),
    preview: parseLines(formData.get("preview")),
    specs: parseLines(formData.get("specs")),
    size: optionalText(formData.get("size")),
    category: optionalText(formData.get("category")),
    seoTitle: parseSeoTitle(formData.get("seoTitle")),
    seoDescription: parseSeoDescription(formData.get("seoDescription")),
    priceCents: parsePriceCents(formData.get("price")),
    currency,
    stockCount: parseNonNegativeInteger(formData.get("stockCount"), "Stock count"),
    orderMessage: optionalText(formData.get("orderMessage")),
    isPublished: isChecked(formData.get("isPublished")),
    sortOrder: parseNonNegativeInteger(formData.get("sortOrder"), "Sort order")
  };
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/artists/[slug]", "page");
}

export async function loginAction(formData: FormData) {
  const email = requiredText(formData.get("email"), "Email");
  const password = requiredText(formData.get("password"), "Password");
  const admin = await authenticateAdmin(email, password);
  if (!admin) redirect("/admin/login?error=invalid");
  await createAdminSession(admin);
  redirect("/admin");
}

export async function logoutAction() {
  await revokeCurrentAdminSession();
  redirect("/admin/login");
}

export async function createArtistAction(formData: FormData) {
  await requireAdmin();
  let imagePath: string | null = null;
  const file = asOptionalFile(formData.get("profileImage"));
  if (file) imagePath = (await getStorageProvider().uploadImage("artists", file)).path;
  const artistId = await saveArtist(parseArtistInput(formData, imagePath));
  revalidateCatalog();
  redirect(`/admin/artists/${artistId}`);
}

export async function updateArtistAction(id: string, formData: FormData) {
  await requireAdmin();
  let imagePath = optionalText(formData.get("existingProfileImagePath"));
  const file = asOptionalFile(formData.get("profileImage"));
  if (file) imagePath = (await getStorageProvider().uploadImage("artists", file)).path;
  await saveArtist(parseArtistInput(formData, imagePath), id);
  revalidateCatalog();
  redirect("/admin/artists");
}

export async function archiveArtistAction(id: string) {
  await requireAdmin();
  await archiveArtist(id);
  revalidateCatalog();
  redirect("/admin/artists");
}

async function uploadItemImages(itemId: string, formData: FormData) {
  const files = formData.getAll("images").map((value) => asOptionalFile(value)).filter((file): file is File => Boolean(file));
  if (files.length === 0) return;
  const storage = getStorageProvider();
  const altText = optionalText(formData.get("imageAlt"));
  const uploads = await Promise.all(files.map((file) => storage.uploadImage("items", file)));
  await addItemImages(itemId, uploads.map((upload) => ({ storagePath: upload.path, altText })));
}

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const itemId = await saveItem(parseItemInput(formData));
  await uploadItemImages(itemId, formData);
  revalidateCatalog();
  redirect("/admin/items");
}

export async function updateItemAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveItem(parseItemInput(formData), id);
  await uploadItemImages(id, formData);
  revalidateCatalog();
  redirect("/admin/items");
}

export async function archiveItemAction(id: string) {
  await requireAdmin();
  await archiveItem(id);
  revalidateCatalog();
  redirect("/admin/items");
}

function parseOrderStatus(value: FormDataEntryValue | null): OrderStatus {
  const allowed: OrderStatus[] = ["draft", "awaiting_payment", "processing", "shipped", "completed", "cancelled"];
  if (typeof value !== "string" || !allowed.includes(value as OrderStatus)) throw new Error("Invalid order status.");
  return value as OrderStatus;
}

function parsePaymentStatus(value: FormDataEntryValue | null): PaymentStatus {
  const allowed: PaymentStatus[] = ["unpaid", "paid", "refunded"];
  if (typeof value !== "string" || !allowed.includes(value as PaymentStatus)) throw new Error("Invalid payment status.");
  return value as PaymentStatus;
}

function parseOrderLines(formData: FormData) {
  const itemIds = formData.getAll("itemIds");
  const quantities = formData.getAll("quantities");
  if (itemIds.length !== quantities.length) throw new Error("Order line items are incomplete.");
  return itemIds.map((itemId, index) => ({
    itemId: requiredText(itemId, "Item"),
    quantity: parseNonNegativeInteger(quantities[index] ?? null, "Quantity", 0)
  })).filter((line) => line.quantity > 0);
}

export async function createOrderAction(formData: FormData) {
  await requireAdmin();
  const id = await createOrder({
    customerName: requiredText(formData.get("customerName"), "Customer name"),
    customerEmail: optionalText(formData.get("customerEmail")),
    customerPhone: optionalText(formData.get("customerPhone")),
    shippingAddress: optionalText(formData.get("shippingAddress")),
    notes: optionalText(formData.get("notes")),
    lines: parseOrderLines(formData)
  });
  redirect(`/admin/orders/${id}`);
}

export async function updateOrderAction(id: string, formData: FormData) {
  await requireAdmin();
  await updateOrder(id, {
    customerName: requiredText(formData.get("customerName"), "Customer name"),
    customerEmail: optionalText(formData.get("customerEmail")),
    customerPhone: optionalText(formData.get("customerPhone")),
    shippingAddress: optionalText(formData.get("shippingAddress")),
    status: parseOrderStatus(formData.get("status")),
    paymentStatus: parsePaymentStatus(formData.get("paymentStatus")),
    shipmentUrl: parseOptionalUrl(formData.get("shipmentUrl"), "Shipment URL"),
    notes: optionalText(formData.get("notes"))
  });
  redirect(`/admin/orders/${id}`);
}

export async function deleteDraftOrderAction(id: string) {
  await requireAdmin();
  await deleteDraftOrder(id);
  redirect("/admin/orders");
}
