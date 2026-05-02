export type ArtistLink = {
  label: string;
  href: string;
};

export type Artist = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  links: ArtistLink[];
  initiallyExpanded?: boolean;
};

const defaultLinks: ArtistLink[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/itemsyouwant"
  },
  {
    label: "Work",
    href: "/artists"
  },
  {
    label: "Email",
    href: "mailto:info@itemsyouwant.com"
  }
];

export const artists: Artist[] = [
  {
    slug: "kumorimon",
    name: "Kumorimon",
    role: "Concept Artist / Virtual Store",
    image: "/assets/artists/kumorimon.png",
    imageAlt: "Kumorimon artwork",
    links: defaultLinks
  },
  {
    slug: "zz-liu",
    name: "ZZ Liu",
    role: "Multi-disciplinary Creative",
    bio: "ZZ is a multi-disciplinary creative based in Petaling Jaya, Malaysia. Everything @ idle/ido. Minimalist Graphic Designer at heart. Lifelong Chelsea FC supporter. John Mayer's fanboy. Golden State Warrior for life. David Fincher's worshipper.",
    image: "/assets/artists/zz-liu.png",
    imageAlt: "ZZ Liu portrait",
    links: defaultLinks,
    initiallyExpanded: true
  },
  {
    slug: "silas-oo",
    name: "Silas Oo",
    role: "Artist / Illustrator",
    image: "/assets/artists/silas-oo.png",
    imageAlt: "Silas Oo artwork",
    links: defaultLinks
  },
  {
    slug: "yoki-ng",
    name: "Yoki Ng",
    role: "Musician / Artist",
    image: "/assets/artists/yoki-ng.png",
    imageAlt: "Yoki Ng portrait",
    links: defaultLinks
  },
  {
    slug: "wc-sin",
    name: "WC Sin",
    role: "Illustrator / Artist",
    bio: "WC is an experienced Illustrator. He also teaches the next generation of illustrators @ The One Academy. Recently published his personal book, he is an accomplished creative influencing many up and coming creatives.",
    image: "/assets/artists/wc-sin.png",
    imageAlt: "WC Sin illustration",
    links: defaultLinks,
    initiallyExpanded: true
  },
  {
    slug: "akaristore",
    name: "Akaristore",
    role: "Toy Store / Culture Curators",
    bio: "Akari is an influential entity promoting toy cultures right from the heart of KL, they actively work with like minded artists to improve the art and toy culture in Malaysia. In a short period of time since their GMBB's shop opening, they've been a mainstay eversince.",
    image: "/assets/artists/akaristore.png",
    imageAlt: "Akaristore toy figure",
    links: defaultLinks,
    initiallyExpanded: true
  },
  {
    slug: "lie-kee",
    name: "Lie Kee",
    role: "Interior Designer",
    image: "/assets/artists/lie-kee.png",
    imageAlt: "Lie Kee portrait",
    links: defaultLinks
  },
  {
    slug: "spacedawg",
    name: "SpaceDawg",
    role: "2D Animator / Artist",
    image: "/assets/artists/spacedawg.png",
    imageAlt: "SpaceDawg artwork",
    links: defaultLinks
  },
  {
    slug: "wengra-jaie",
    name: "Wengra Jaie",
    role: "Artist",
    image: "/assets/artists/wengra-jaie.png",
    imageAlt: "Wengra Jaie portrait",
    links: defaultLinks
  },
  {
    slug: "scifunk",
    name: "Scifunk",
    role: "Object Maker / Artist",
    links: defaultLinks
  },
  {
    slug: "edmund-li",
    name: "Edmund Li",
    role: "Artist",
    links: defaultLinks
  },
  {
    slug: "jayson-liew",
    name: "Jayson Liew",
    role: "Artist",
    links: defaultLinks
  },
  {
    slug: "burger-cham",
    name: "Burger Cham",
    role: "Artist",
    links: defaultLinks
  }
];
