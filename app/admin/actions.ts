"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authenticateAdmin, createAdminSession, requireAdmin, revokeCurrentAdminSession } from "@/lib/auth/admin";
import { archiveArtist, archiveItem, createOrder, deleteDraftOrder, listAttachedArtistMediaPaths, listAttachedItemMediaPaths, saveArtist, saveItem, synchronizeArtistMedia, synchronizeItemMedia, type OrderStatus, type PaymentStatus, updateOrder } from "@/lib/admin/repository";
import { isDirectCatalogMediaPath, MAX_ITEM_MEDIA, type CatalogMediaArea, type ItemMediaUploadRequest, validateItemMediaUploadRequest } from "@/lib/admin/item-media";
import { isChecked, optionalText, parseArtistMediaOrder, parseItemMediaOrder, parseLinks, parseLines, parseNonNegativeInteger, parseOptionalPriceCents, parseOptionalUrl, parseSeoDescription, parseSeoTitle, parseSlug, requiredText } from "@/lib/admin/validation";
import { getStorageProvider } from "@/lib/storage/supabase-storage";

function asOptionalFile(value: FormDataEntryValue | null) {
  return typeof File !== "undefined" && value instanceof File && value.size > 0 ? value : null;
}

function isManagedStoragePath(path: string | null) {
  return Boolean(path && !path.startsWith("/") && !path.startsWith("http://") && !path.startsWith("https://"));
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
  const myrPriceCents = parseOptionalPriceCents(formData.get("myrPrice"), "MYR price");
  const usdPriceCents = parseOptionalPriceCents(formData.get("usdPrice"), "USD price");
  if (myrPriceCents === null && usdPriceCents === null) {
    throw new Error("Add a MYR price, a USD price, or both.");
  }
  return {
    artistId: requiredText(formData.get("artistId"), "Artist"),
    slug: parseSlug(formData.get("slug")),
    name: requiredText(formData.get("name"), "Name"),
    description: requiredText(formData.get("description"), "Description"),
    shortDescription: optionalText(formData.get("shortDescription")),
    preview: parseLines(formData.get("preview")),
    specs: parseLines(formData.get("specs")),
    size: optionalText(formData.get("size")),
    category: optionalText(formData.get("category")),
    seoTitle: parseSeoTitle(formData.get("seoTitle")),
    seoDescription: parseSeoDescription(formData.get("seoDescription")),
    myrPriceCents,
    usdPriceCents,
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
  const storage = file ? getStorageProvider() : null;
  if (file) imagePath = (await storage!.uploadImage("artists", file)).path;
  let artistId: string;
  try {
    artistId = await saveArtist(parseArtistInput(formData, imagePath));
    await synchronizeArtistMediaFromForm(artistId, formData);
  } catch (error) {
    if (imagePath) await storage?.remove(imagePath).catch(() => undefined);
    throw error;
  }
  revalidateCatalog();
  redirect(`/admin/artists/${artistId}`);
}

export async function updateArtistAction(id: string, formData: FormData) {
  await requireAdmin();
  const previousImagePath = optionalText(formData.get("previousProfileImagePath"));
  let imagePath = optionalText(formData.get("existingProfileImagePath"));
  const file = asOptionalFile(formData.get("profileImage"));
  const storage = file || (isManagedStoragePath(previousImagePath) && previousImagePath !== imagePath) ? getStorageProvider() : null;
  if (file) imagePath = (await storage!.uploadImage("artists", file)).path;
  try {
    await saveArtist(parseArtistInput(formData, imagePath), id);
    await synchronizeArtistMediaFromForm(id, formData);
  } catch (error) {
    if (file && imagePath) await storage?.remove(imagePath).catch(() => undefined);
    throw error;
  }
  if (isManagedStoragePath(previousImagePath) && previousImagePath !== imagePath) {
    // The catalog record is already correct; avoid reporting a failed save if
    // best-effort cleanup of an old storage object is temporarily unavailable.
    await storage!.remove(previousImagePath!).catch(() => undefined);
  }
  revalidateCatalog();
  redirect("/admin/artists");
}

export async function archiveArtistAction(id: string) {
  await requireAdmin();
  await archiveArtist(id);
  revalidateCatalog();
  redirect("/admin/artists");
}

async function synchronizeItemMediaFromForm(itemId: string, formData: FormData) {
  const mediaOrder = parseItemMediaOrder(formData.get("mediaOrder"));
  if (!mediaOrder) return;

  const removedPaths = await synchronizeItemMedia(itemId, mediaOrder);
  const managedRemovedPaths = removedPaths.filter((path) => isManagedStoragePath(path));
  if (managedRemovedPaths.length > 0) {
    // Database metadata is authoritative. A transient cleanup failure leaves
    // only an unreachable object and must not make the catalog save fail.
    try {
      const storage = getStorageProvider();
      await Promise.all(managedRemovedPaths.map((path) => storage.remove(path)));
    } catch {
      // Best-effort cleanup is safe to retry outside this request.
    }
  }
}

async function synchronizeArtistMediaFromForm(artistId: string, formData: FormData) {
  const mediaOrder = parseArtistMediaOrder(formData.get("artistMediaOrder"));
  if (!mediaOrder) return;

  const removedPaths = await synchronizeArtistMedia(artistId, mediaOrder);
  const managedRemovedPaths = removedPaths.filter((path) => isManagedStoragePath(path));
  if (managedRemovedPaths.length > 0) {
    try {
      const storage = getStorageProvider();
      await Promise.all(managedRemovedPaths.map((path) => storage.remove(path)));
    } catch {
      // The row removal succeeded; storage cleanup can be retried safely.
    }
  }
}

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const itemId = await saveItem(parseItemInput(formData));
  await synchronizeItemMediaFromForm(itemId, formData);
  revalidateCatalog();
  redirect("/admin/items");
}

export async function updateItemAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveItem(parseItemInput(formData), id);
  await synchronizeItemMediaFromForm(id, formData);
  revalidateCatalog();
  redirect("/admin/items");
}

export async function requestCatalogMediaUploadAction(area: CatalogMediaArea, requests: ItemMediaUploadRequest[]) {
  await requireAdmin();
  if (area !== "artists" && area !== "items") throw new Error("Media area is invalid.");
  if (!Array.isArray(requests) || requests.length === 0 || requests.length > MAX_ITEM_MEDIA) {
    throw new Error(`Choose between 1 and ${MAX_ITEM_MEDIA} media files.`);
  }
  const normalizedRequests = requests.map(validateItemMediaUploadRequest);
  const storage = getStorageProvider();
  return Promise.all(normalizedRequests.map((request) => storage.createSignedCatalogMediaUpload(area, request.mimeType)));
}

export async function discardUnattachedCatalogMediaAction(area: CatalogMediaArea, paths: string[]) {
  await requireAdmin();
  if (area !== "artists" && area !== "items") return;
  if (!Array.isArray(paths)) return;
  const candidates = [...new Set(paths.filter((path): path is string => typeof path === "string" && isDirectCatalogMediaPath(area, path)))];
  if (candidates.length === 0) return;
  const attachedPaths = new Set(area === "artists" ? await listAttachedArtistMediaPaths(candidates) : await listAttachedItemMediaPaths(candidates));
  const unattachedPaths = candidates.filter((path) => !attachedPaths.has(path));
  if (unattachedPaths.length === 0) return;
  await Promise.all(unattachedPaths.map((path) => getStorageProvider().remove(path).catch(() => undefined)));
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
