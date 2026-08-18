export type PrimaryRoute = "shop" | "artists" | "about" | "shipping";

export type NavigationItem = {
  label: string;
  href: string;
  route: PrimaryRoute;
};

export type ArtistMenuItem = {
  name: string;
  href: string;
};

export type ProductMenuItem = {
  name: string;
  href: string;
};

export const itemsInstagramUrl = "https://www.instagram.com/items.art/";

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Shop All",
    href: "/",
    route: "shop"
  },
  {
    label: "Artists",
    href: "/artists",
    route: "artists"
  },
  {
    label: "About Us",
    href: "/about",
    route: "about"
  },
  {
    label: "Shipping & Returns",
    href: "/shipping-returns",
    route: "shipping"
  }
];

export const footerLinks = [
  {
    label: "Instagram +",
    href: itemsInstagramUrl,
    external: true
  },
  {
    label: "Shipping +",
    href: "/shipping-returns"
  },
  {
    label: "Terms & Conditions +",
    href: "/shipping-returns"
  },
  {
    label: "Privacy & Analytics +",
    href: "/privacy"
  }
];
