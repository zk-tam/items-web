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
    href: "https://instagram.com/itemsyouwant",
    external: true
  },
  {
    label: "Shipping +",
    href: "/shipping-returns"
  },
  {
    label: "Terms & Conditions +",
    href: "/shipping-returns"
  }
];

export const artistMenuItems: ArtistMenuItem[] = [
  {
    name: "ZZ Liu",
    href: "/artists/zz-liu"
  },
  {
    name: "Silas Oo",
    href: "/artists/silas-oo"
  },
  {
    name: "Yoki Ng",
    href: "/artists/yoki-ng"
  },
  {
    name: "WC Sin",
    href: "/artists/wc-sin"
  },
  {
    name: "Scifunk",
    href: "/artists/scifunk"
  },
  {
    name: "Kumorimon",
    href: "/artists/kumorimon"
  },
  {
    name: "Akaristore",
    href: "/artists/akaristore"
  },
  {
    name: "Edmund Li",
    href: "/artists/edmund-li"
  },
  {
    name: "Lie Kee",
    href: "/artists/lie-kee"
  },
  {
    name: "SpaceDawg",
    href: "/artists/spacedawg"
  },
  {
    name: "Burger Cham",
    href: "/artists/burger-cham"
  },
  {
    name: "Wengra Jaie",
    href: "/artists/wengra-jaie"
  },
  {
    name: "Jayson Liew",
    href: "/artists/jayson-liew"
  }
];
