export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  artistName: string;
  artistSlug: string;
  description: string;
  preview?: string[];
  specs: string[];
  size: string;
  priceNote?: string;
  images: ProductImage[];
  orderMessage: string;
};

export const products: Product[] = [
  {
    slug: "thunder-vase",
    name: "Thunder Vase",
    artistName: "ZZ Liu",
    artistSlug: "zz-liu",
    description: "The THUNDER vase is a statement display to any ambient. Lightning strikes your table or any place of your choosing. Two display holes to elevate the display to your choice.",
    specs: ["Steel", "Rust texture", "One of one", "Acrylic Paintover", "Incense Holes x2"],
    size: "50 inches x 45 inches",
    images: [
      {
        src: "/assets/products/thunder-vase.png",
        alt: "Thunder Vase by ZZ Liu"
      }
    ],
    orderMessage: "Hello ITEMS, I want to order Thunder Vase by ZZ Liu."
  },
  {
    slug: "frames-chair",
    name: "Frames Chair",
    artistName: "ZZ Liu",
    artistSlug: "zz-liu",
    description: "Frames chair that could blend your according to your environment. Place any artwork to steez up your space. modular, adjustable. Just to your liking.",
    preview: [
      "Frames chair that could blend your according to your environment. Place any artwork to steez up your space.",
      "modular, adjustable. Just to your liking.",
      "Chair: 50 inches x 45 inches | Poster: A3"
    ],
    specs: ["Modular frame", "Adjustable display", "Poster-ready", "One of one"],
    size: "Chair: 50 inches x 45 inches | Poster: A3",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Frames Chair by ZZ Liu."
  },
  {
    slug: "ciggs-in-the-rain",
    name: "Ciggs In The Rain",
    artistName: "Jayson Liew",
    artistSlug: "jayson-liew",
    description: "A compact printed object carrying the mood of a small rainy-night scene.",
    specs: ["Print object", "Limited run", "Signed edition"],
    size: "A3",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Ciggs In The Rain by Jayson Liew."
  },
  {
    slug: "leather-chair",
    name: "Leather Chair",
    artistName: "JeBear Sci-Funk",
    artistSlug: "scifunk",
    description: "A compact seating object with a raw collectible finish.",
    specs: ["Leather surface", "Display object", "Limited item"],
    size: "Made to order",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Leather Chair by JeBear Sci-Funk."
  },
  {
    slug: "sci-funk-bear",
    name: "Bear",
    artistName: "Silas Oo",
    artistSlug: "silas-oo",
    description: "A sculptural bear object for shelves, tables, and corners that need a little odd charge.",
    specs: ["Collectible form", "Painted finish", "Limited item"],
    size: "Tabletop scale",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Bear by Silas Oo."
  },
  {
    slug: "crimp-blocks",
    name: "Crimp Blocks",
    artistName: "Burger Cham",
    artistSlug: "burger-cham",
    description: "Stackable blocks built as an expressive modular display object.",
    specs: ["Modular blocks", "Display-ready", "Limited item"],
    size: "Variable",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Crimp Blocks by Burger Cham."
  },
  {
    slug: "headgear",
    name: "Headgear",
    artistName: "Edmund Li",
    artistSlug: "edmund-li",
    description: "A wearable-looking object built for wall, shelf, or studio display.",
    specs: ["Mixed media", "One of one", "Display object"],
    size: "One size",
    images: [],
    orderMessage: "Hello ITEMS, I want to order Headgear by Edmund Li."
  },
  {
    slug: "kumoriblock",
    name: "KumoriBlock",
    artistName: "Tham Hoi Mun",
    artistSlug: "kumorimon",
    description: "A virtual-store character object shaped for playful physical collection.",
    specs: ["Toy object", "Character form", "Limited item"],
    size: "Tabletop scale",
    images: [],
    orderMessage: "Hello ITEMS, I want to order KumoriBlock by Tham Hoi Mun."
  }
];
