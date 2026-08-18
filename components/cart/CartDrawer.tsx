"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { IconButton } from "@/components/ui/IconButton";
import { cartCheckoutWhatsappUrl } from "@/lib/cart/message";
import { useCartStore } from "@/lib/cart/store";

type CartContextValue = {
  openCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const openCart = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    setIsRendered(true);
    window.requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      closeTimerRef.current = null;
    }, 260);
  }, []);

  return (
    <CartContext.Provider value={{ openCart }}>
      {children}
      {isRendered && <CartDrawer isOpen={isOpen} onClose={closeCart} />}
    </CartContext.Provider>
  );
}

export function CartTrigger({ className, children }: { className?: string; children: ReactNode }) {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("CartTrigger must be used inside CartProvider");
  }

  return (
    <IconButton label="Cart" className={className} onClick={context.openCart}>
      {children}
    </IconButton>
  );
}

export function useCartDrawer() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartDrawer must be used inside CartProvider");
  }

  return context;
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const items = useCartStore((state) => state.items);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const checkoutUrl = items.length > 0 ? cartCheckoutWhatsappUrl(items) : undefined;

  return (
    <div
      aria-hidden={!isOpen}
      className={`items-cart-backdrop fixed inset-0 z-[110] transition-opacity duration-[260ms] ease-out ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onMouseDown={onClose}
    >
      <aside
        aria-label="Shopping cart"
        aria-modal="true"
        className={`items-cart-panel flex flex-col bg-items-blue p-4 text-items-white transition-transform duration-[260ms] ease-[cubic-bezier(.2,.85,.25,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            aria-label="Close cart"
            className="inline-flex h-7 w-7 items-center justify-center text-xl font-medium leading-none transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm font-medium text-items-white/80">Your cart is empty.</p>
          ) : (
            <ul className="space-y-5 pt-5">
              {items.map((item) => (
                <li key={item.slug} className="border-b border-items-white/75 pb-4">
                  <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
                    <div className="relative aspect-square overflow-hidden rounded-item bg-items-white/20">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.thumbnailAlt} fill sizes="76px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] font-black uppercase">ITEM</span>
                      )}
                    </div>
                    <div className="min-w-0 pt-1">
                      {item.priceLabels.length > 0 && <p className="text-[11px] font-heavy leading-tight">{item.priceLabels.join(" / ")}</p>}
                      <p className="mt-1 text-[12px] font-heavy leading-tight">{item.name}</p>
                      <p className="mt-1 text-[10px] font-medium leading-tight text-items-white/80">{item.artistName}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-4 text-[12px] font-medium">
                    <button aria-label={`Decrease ${item.name} quantity`} className="h-6 w-6 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-white" onClick={() => decrementItem(item.slug)} type="button">−</button>
                    <span aria-label={`${item.quantity} ${item.name}`}>{item.quantity}</span>
                    <button aria-label={`Increase ${item.name} quantity`} className="h-6 w-6 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-white" onClick={() => incrementItem(item.slug)} type="button">+</button>
                    <button aria-label={`Remove ${item.name} from cart`} className="ml-2 text-[10px] font-heavy uppercase underline hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-white" onClick={() => removeItem(item.slug)} type="button">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 border-t border-items-white/75 pt-4">
          {checkoutUrl ? (
            <a
              className="flex h-10 w-full items-center justify-center rounded-button bg-items-white px-4 text-[11px] font-heavy text-items-blue transition-colors hover:bg-items-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-white"
              href={checkoutUrl}
              rel="noreferrer"
              target="_blank"
            >
              Checkout
            </a>
          ) : (
            <button className="h-10 w-full rounded-button bg-items-white/50 px-4 text-[11px] font-heavy text-items-blue/70" disabled type="button">Checkout</button>
          )}
        </div>
      </aside>
    </div>
  );
}
