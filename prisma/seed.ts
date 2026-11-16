import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const categories = [
  {
    name: "Audio",
    slug: "audio",
    description:
      "Immersive sound and considered design — headphones and speakers tuned for everyday listening.",
    imageUrl: img("photo-1505740420928-5e560c06d30e"),
    sortOrder: 1,
  },
  {
    name: "Timepieces",
    slug: "watches",
    description:
      "Quiet precision. Automatic movements and restrained dials, made to be worn for decades.",
    imageUrl: img("photo-1523275335684-37898b6baf30"),
    sortOrder: 2,
  },
  {
    name: "Bags",
    slug: "bags",
    description:
      "Full-grain leather and technical canvas, built for the daily commute and the long way home.",
    imageUrl: img("photo-1553062407-98eeb64c6a62"),
    sortOrder: 3,
  },
  {
    name: "Footwear",
    slug: "footwear",
    description:
      "Engineered comfort and premium finishes, from city courts to unpaved trails.",
    imageUrl: img("photo-1542291026-7eec264c27ff"),
    sortOrder: 4,
  },
  {
    name: "Eyewear",
    slug: "eyewear",
    description:
      "Hand-finished frames with polarized and optical lenses for clear, considered days.",
    imageUrl: img("photo-1511499767150-a48a237f0083"),
    sortOrder: 5,
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Objects that bring warmth, texture and order to the modern interior.",
    imageUrl: img("photo-1503602642458-232111445657"),
    sortOrder: 6,
  },
  {
    name: "Desk & Tech",
    slug: "desk-tech",
    description:
      "Tools for focused work — tactile keyboards, sculpted lighting, quiet peripherals.",
    imageUrl: img("photo-1587829741301-dc798b83add3"),
    sortOrder: 7,
  },
  {
    name: "Fragrance",
    slug: "fragrance",
    description:
      "Layered, long-wearing scents composed in small batches from natural materials.",
    imageUrl: img("photo-1541643600914-78b084683601"),
    sortOrder: 8,
  },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  description: string;
  details: string;
  images: string[];
};

const products: SeedProduct[] = [
  {
    name: "Aurora Wireless Headphones",
    slug: "aurora-wireless-headphones",
    sku: "VLR-AUD-001",
    category: "audio",
    price: 28900,
    compareAtPrice: 34900,
    stock: 24,
    rating: 4.8,
    reviewCount: 214,
    isFeatured: true,
    description:
      "A reference-grade wireless headphone with adaptive noise cancellation and a warm, wide soundstage. Memory-foam earcups and a machined aluminium yoke keep long listening sessions comfortable.",
    details:
      "40-hour battery · USB-C fast charge\nAdaptive ANC with transparency mode\nAluminium, memory foam and vegan leather\nTwo-year limited warranty",
    images: [
      "photo-1505740420928-5e560c06d30e",
      "photo-1546435770-a3e426bf472b",
      "photo-1484704849700-f032a568e944",
    ],
  },
  {
    name: "Halo Studio Headphones",
    slug: "halo-studio-headphones",
    sku: "VLR-AUD-002",
    category: "audio",
    price: 19900,
    stock: 18,
    rating: 4.6,
    reviewCount: 128,
    description:
      "An open, natural tuning for mixing and long-form listening. The Halo pairs a lightweight steel frame with breathable knit pads and a detachable braided cable.",
    details:
      "Detachable 1.8 m braided cable\n40 mm beryllium-coated drivers\nSteel frame · knit ear pads\nTwo-year limited warranty",
    images: [
      "photo-1583394838336-acd977736f90",
      "photo-1487215078519-e21cc028cb29",
      "photo-1606220945770-b5b6c2c55bf1",
    ],
  },
  {
    name: "Pulse Portable Speaker",
    slug: "pulse-portable-speaker",
    sku: "VLR-AUD-003",
    category: "audio",
    price: 12900,
    compareAtPrice: 15900,
    stock: 32,
    rating: 4.5,
    reviewCount: 96,
    isNew: true,
    description:
      "A palm-sized speaker with surprising low end and a woven, weather-resistant shell. Designed to move from the kitchen counter to the balcony without fuss.",
    details:
      "IPX6 water resistance · 18-hour battery\nStereo pairing across two units\nRecycled aluminium grille\nUSB-C charging cable included",
    images: [
      "photo-1545454675-3531b543be5d",
      "photo-1608043152269-423dbba4e7e1",
      "photo-1589003077984-894e133dabab",
    ],
  },
  {
    name: "Echo Wireless Earbuds",
    slug: "echo-wireless-earbuds",
    sku: "VLR-AUD-004",
    category: "audio",
    price: 15900,
    stock: 40,
    rating: 4.4,
    reviewCount: 311,
    description:
      "Compact earbuds with a secure, low-profile fit and clear call quality. The charging case is machined from a single block of aluminium.",
    details:
      "6-hour playback · 24 hours with case\nDual-mic call clarity\nAluminium charging case\nWireless charging supported",
    images: [
      "photo-1572569511254-d8f925fe2cbb",
      "photo-1606220945770-b5b6c2c55bf1",
      "photo-1595225476474-87563907a212",
    ],
  },
  {
    name: "Meridian Automatic",
    slug: "meridian-automatic",
    sku: "VLR-WAT-001",
    category: "watches",
    price: 42000,
    stock: 12,
    rating: 4.9,
    reviewCount: 87,
    isFeatured: true,
    description:
      "A 38 mm automatic with a brushed steel case, sapphire crystal and a dial that reads cleanly in any light. The movement is visible through the exhibition case back.",
    details:
      "38 mm brushed 316L steel case\nAutomatic movement · 42-hour reserve\nSapphire crystal · 100 m water resistance\nItalian leather strap",
    images: [
      "photo-1523275335684-37898b6baf30",
      "photo-1524805444758-089113d48a6d",
      "photo-1434056886845-dac89ffe9b56",
    ],
  },
  {
    name: "Atlas Chronograph",
    slug: "atlas-chronograph",
    sku: "VLR-WAT-002",
    category: "watches",
    price: 54000,
    compareAtPrice: 62000,
    stock: 8,
    rating: 4.7,
    reviewCount: 64,
    description:
      "A precise three-register chronograph inspired by mid-century instrument panels. Subtle sunburst finishing and a tapered bracelet keep it versatile.",
    details:
      "40 mm steel case · sapphire crystal\nQuartz chronograph · 1/10 second\nScrew-down crown · 50 m water resistance\nIntegrated steel bracelet",
    images: [
      "photo-1523170335258-f5ed11844a49",
      "photo-1434056886845-dac89ffe9b56",
      "photo-1524805444758-089113d48a6d",
    ],
  },
  {
    name: "Lune Slim Watch",
    slug: "lune-slim-watch",
    sku: "VLR-WAT-003",
    category: "watches",
    price: 25500,
    stock: 20,
    rating: 4.6,
    reviewCount: 142,
    isNew: true,
    description:
      "An ultra-thin dress watch with a pale sand dial and applied indices. At 6.8 mm, the Lune slips under a shirt cuff without a second thought.",
    details:
      "36 mm case · 6.8 mm profile\nSwiss quartz movement\nDomed sapphire crystal\nInterchangeable suede strap",
    images: [
      "photo-1524805444758-089113d48a6d",
      "photo-1523275335684-37898b6baf30",
      "photo-1523170335258-f5ed11844a49",
    ],
  },
  {
    name: "Voyager Weekender",
    slug: "voyager-weekender",
    sku: "VLR-BAG-001",
    category: "bags",
    price: 31000,
    stock: 15,
    rating: 4.8,
    reviewCount: 73,
    isFeatured: true,
    description:
      "A structured weekender in full-grain leather with a waxed canvas body. Designed to fit a carry-on allowance and a three-day trip with equal ease.",
    details:
      "42 L capacity · cabin friendly\nFull-grain leather trim · waxed canvas\nSolid brass hardware · YKK zips\nDetachable shoulder strap",
    images: [
      "photo-1553062407-98eeb64c6a62",
      "photo-1548036328-c9fa89d128fa",
      "photo-1590874103328-eac38a683ce7",
    ],
  },
  {
    name: "Slate Leather Tote",
    slug: "slate-leather-tote",
    sku: "VLR-BAG-002",
    category: "bags",
    price: 18500,
    compareAtPrice: 22500,
    stock: 22,
    rating: 4.7,
    reviewCount: 188,
    description:
      "An unlined, vegetable-tanned tote that softens with use. Wide enough for a 16-inch laptop, clean enough for a dinner reservation.",
    details:
      "Vegetable-tanned Italian leather\nFits a 16-inch laptop\nMagnetic closure · interior pocket\nHand-finished edges",
    images: [
      "photo-1584917865442-de89df76afd3",
      "photo-1594633312681-425c7b97ccd1",
      "photo-1548036328-c9fa89d128fa",
    ],
  },
  {
    name: "Ridge Daypack",
    slug: "ridge-daypack",
    sku: "VLR-BAG-003",
    category: "bags",
    price: 21000,
    stock: 3,
    rating: 4.5,
    reviewCount: 102,
    isNew: true,
    description:
      "A technical daypack with a weatherproof shell and a considered interior. The clamshell opening lays flat for easy packing.",
    details:
      "22 L capacity · 900 g\nRecycled ripstop · water-resistant coating\nPadded 16-inch laptop sleeve\nLuggage pass-through",
    images: [
      "photo-1622560480605-d83c853bc5c3",
      "photo-1553062407-98eeb64c6a62",
      "photo-1585386959984-a4155224a1ad",
    ],
  },
  {
    name: "Drift Runner",
    slug: "drift-runner",
    sku: "VLR-FTW-001",
    category: "footwear",
    price: 16500,
    stock: 30,
    rating: 4.6,
    reviewCount: 204,
    isFeatured: true,
    description:
      "A lightweight daily runner built on a responsive foam midsole. Engineered mesh keeps the upper breathable without losing structure.",
    details:
      "Responsive EVA foam midsole\nEngineered mesh upper\nRecycled rubber outsole\nTrue to size · unisex fit",
    images: [
      "photo-1542291026-7eec264c27ff",
      "photo-1549298916-b41d501d3772",
      "photo-1600185365483-26d7a4cc7519",
    ],
  },
  {
    name: "Court Leather Sneaker",
    slug: "court-leather-sneaker",
    sku: "VLR-FTW-002",
    category: "footwear",
    price: 19000,
    stock: 26,
    rating: 4.8,
    reviewCount: 167,
    description:
      "A minimal court sneaker in soft Italian leather with a tonal sole. The kind of shoe that quietly improves everything you wear it with.",
    details:
      "Full-grain Italian leather upper\nNatural rubber cupsole\nCalfskin lining · memory-foam insole\nHandmade in Portugal",
    images: [
      "photo-1600185365926-3a2ce3cdb9eb",
      "photo-1560343090-f0409e92791a",
      "photo-1595950653106-6c9ebd614d3a",
    ],
  },
  {
    name: "Atlas Trail Boot",
    slug: "atlas-trail-boot",
    sku: "VLR-FTW-003",
    category: "footwear",
    price: 24000,
    compareAtPrice: 28000,
    stock: 14,
    rating: 4.4,
    reviewCount: 58,
    isNew: true,
    description:
      "A capable trail boot with a waterproof membrane and a grippy lugged outsole. Built for wet weekends and uneven ground.",
    details:
      "Waterproof breathable membrane\nVibram® Megagrip outsole\nNubuck leather · suede collar\nResoleable construction",
    images: [
      "photo-1560769629-975ec94e6a86",
      "photo-1549298916-b41d501d3772",
      "photo-1595950653106-6c9ebd614d3a",
    ],
  },
  {
    name: "Terra Low Sneaker",
    slug: "terra-low-sneaker",
    sku: "VLR-FTW-004",
    category: "footwear",
    price: 14500,
    stock: 2,
    rating: 4.3,
    reviewCount: 91,
    description:
      "A relaxed low-top in washed canvas with a cork-blend footbed. Designed to be worn barefoot in summer and paired with wool socks in autumn.",
    details:
      "Washed organic canvas upper\nCork-blend footbed\nVulcanised rubber sole\nMachine washable at 30°C",
    images: [
      "photo-1579338559194-a162d19bf842",
      "photo-1543163521-1bf539c55dd2",
      "photo-1491553895911-0055eca6402d",
    ],
  },
  {
    name: "Mirage Sunglasses",
    slug: "mirage-sunglasses",
    sku: "VLR-EYE-001",
    category: "eyewear",
    price: 14500,
    stock: 34,
    rating: 4.5,
    reviewCount: 76,
    description:
      "A softly angular frame in bio-acetate with polarized lenses. Light on the face, generous in coverage.",
    details:
      "Bio-acetate frame · 5-barrel hinges\nPolarized CR-39 lenses · UV400\nIncludes recycled felt case\nHand-finished in Italy",
    images: [
      "photo-1511499767150-a48a237f0083",
      "photo-1572635196237-14b3f281503f",
      "photo-1547887538-e3a2f32cb1cc",
    ],
  },
  {
    name: "Linea Optical Frames",
    slug: "linea-optical-frames",
    sku: "VLR-EYE-002",
    category: "eyewear",
    price: 12000,
    stock: 28,
    rating: 4.4,
    reviewCount: 49,
    isNew: true,
    description:
      "A slim, rounded optical frame with a keyhole bridge and lightweight titanium core. Prescription-ready at any optician.",
    details:
      "Titanium core · acetate shell\nPrescription ready\n13 mm keyhole bridge\nIncludes hard case and cloth",
    images: [
      "photo-1577803645773-f96470509666",
      "photo-1517423568366-8b83523034fd",
      "photo-1508296695146-257a814070b4",
    ],
  },
  {
    name: "Form Lounge Chair",
    slug: "form-lounge-chair",
    sku: "VLR-HOM-001",
    category: "home-living",
    price: 89000,
    stock: 6,
    rating: 4.9,
    reviewCount: 38,
    isFeatured: true,
    description:
      "A low-slung lounge chair with an oak frame and a deep, supportive seat. Upholstered in a dense bouclé woven in Denmark.",
    details:
      "Solid FSC-certified oak frame\nDanish bouclé upholstery\n78 × 82 × 71 cm\nWhite-glove delivery included",
    images: [
      "photo-1503602642458-232111445657",
      "photo-1567538096630-e0c55bd6374c",
      "photo-1493663284031-b7e3aefcae8e",
    ],
  },
  {
    name: "Ember Ceramic Set",
    slug: "ember-ceramic-set",
    sku: "VLR-HOM-002",
    category: "home-living",
    price: 8500,
    stock: 45,
    rating: 4.6,
    reviewCount: 112,
    description:
      "Four hand-thrown stoneware cups with a matte ash glaze and an unglazed foot. Small variations are part of the finish.",
    details:
      "Set of four · 220 ml each\nHand-thrown stoneware\nDishwasher and microwave safe\nMade in small batches",
    images: [
      "photo-1586023492125-27b2c045efd7",
      "photo-1524758631624-e2822e304c36",
      "photo-1492707892479-7bc8d5a4ee93",
    ],
  },
  {
    name: "Loom Wool Throw",
    slug: "loom-wool-throw",
    sku: "VLR-HOM-003",
    category: "home-living",
    price: 14000,
    stock: 0,
    rating: 4.7,
    reviewCount: 64,
    description:
      "A generously sized throw woven from undyed lambswool with a soft brushed hand. Finished with a hand-knotted fringe.",
    details:
      "100% undyed lambswool\n130 × 190 cm\nHand-knotted fringe\nWoven in a family mill in Scotland",
    images: [
      "photo-1524758631624-e2822e304c36",
      "photo-1586023492125-27b2c045efd7",
      "photo-1512496015851-a90fb38ba796",
    ],
  },
  {
    name: "Nomad Mechanical Keyboard",
    slug: "nomad-mechanical-keyboard",
    sku: "VLR-DSK-001",
    category: "desk-tech",
    price: 17500,
    stock: 19,
    rating: 4.8,
    reviewCount: 143,
    isFeatured: true,
    description:
      "A compact 75% mechanical keyboard with a gasket-mounted aluminium case and hot-swappable switches. Tuned to sound as good as it feels.",
    details:
      "75% layout · hot-swappable\nGasket-mounted aluminium case\nTri-mode: USB-C, Bluetooth, 2.4 GHz\nPBT dye-sublimated keycaps",
    images: [
      "photo-1587829741301-dc798b83add3",
      "photo-1618384887929-16ec33fab9ef",
      "photo-1595225476474-87563907a212",
    ],
  },
  {
    name: "Vector Wireless Mouse",
    slug: "vector-wireless-mouse",
    sku: "VLR-DSK-002",
    category: "desk-tech",
    price: 9500,
    stock: 37,
    rating: 4.5,
    reviewCount: 87,
    description:
      "A sculpted, low-profile mouse with silent switches and a 4,000 DPI sensor. Pairs with three devices and lasts for months on a charge.",
    details:
      "Silent tactile switches · 4,000 DPI\nMulti-device Bluetooth pairing\n90-day battery · USB-C\nRecycled ABS shell",
    images: [
      "photo-1527864550417-7fd91fc51a46",
      "photo-1618384887929-16ec33fab9ef",
      "photo-1587829741301-dc798b83add3",
    ],
  },
  {
    name: "Arc Desk Lamp",
    slug: "arc-desk-lamp",
    sku: "VLR-DSK-003",
    category: "desk-tech",
    price: 16000,
    compareAtPrice: 19000,
    stock: 16,
    rating: 4.6,
    reviewCount: 55,
    isNew: true,
    description:
      "A counterbalanced task lamp with a warm, dimmable LED array. The arc profile keeps the light where you need it and the desk clear.",
    details:
      "2700–4000 K adjustable white\nCRI 95 · flicker free\nPowder-coated steel · brass joints\nTouch dimmer · USB-C powered",
    images: [
      "photo-1507646227500-4d389b0012be",
      "photo-1512496015851-a90fb38ba796",
      "photo-1492707892479-7bc8d5a4ee93",
    ],
  },
  {
    name: "Nocturne Eau de Parfum",
    slug: "nocturne-eau-de-parfum",
    sku: "VLR-FRG-001",
    category: "fragrance",
    price: 12000,
    stock: 50,
    rating: 4.7,
    reviewCount: 226,
    isFeatured: true,
    description:
      "An evening fragrance built around iris, smoked cedar and a trace of leather. Composed in Grasse and bottled in heavy frosted glass.",
    details:
      "50 ml eau de parfum\nTop: bergamot, pink pepper\nHeart: iris, vetiver\nBase: cedar, leather, amber",
    images: [
      "photo-1541643600914-78b084683601",
      "photo-1594035910387-fea47794261f",
      "photo-1608571423902-eed4a5ad8108",
    ],
  },
  {
    name: "Cedar & Smoke Candle",
    slug: "cedar-smoke-candle",
    sku: "VLR-FRG-002",
    category: "fragrance",
    price: 5800,
    stock: 60,
    rating: 4.5,
    reviewCount: 131,
    description:
      "A hand-poured coconut wax candle with cedarwood, birch tar and a whisper of vanilla. Around fifty hours of slow burn.",
    details:
      "220 g · approx. 50-hour burn\nCoconut and rapeseed wax\nCotton wick · reusable vessel\nPoured in small batches",
    images: [
      "photo-1608571423902-eed4a5ad8108",
      "photo-1615634260167-c8cdede054de",
      "photo-1611930022073-b7a4ba5fcccd",
    ],
  },
  {
    name: "Vetiver Travel Spray",
    slug: "vetiver-travel-spray",
    sku: "VLR-FRG-003",
    category: "fragrance",
    price: 4800,
    compareAtPrice: 5800,
    stock: 48,
    rating: 4.4,
    reviewCount: 67,
    isNew: true,
    description:
      "A bright, green vetiver in a refillable 10 ml travel case. Clean enough for the office, distinctive enough for the evening.",
    details:
      "10 ml refillable travel spray\nTop: grapefruit, basil\nHeart: Haitian vetiver\nBase: white musk, cedar",
    images: [
      "photo-1615634260167-c8cdede054de",
      "photo-1611930022073-b7a4ba5fcccd",
      "photo-1541643600914-78b084683601",
    ],
  },
];

const DEMO_ORDERS: Array<{
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  status: string;
  daysAgo: number;
  items: Array<{ slug: string; quantity: number }>;
  guest?: boolean;
}> = [
  {
    orderNumber: "VL-261031-K7M2Q",
    customer: "Amelia Hart",
    email: "customer@velora.com",
    phone: "+1 (415) 555-0142",
    address: "88 Fillmore Street, Apt 4B",
    city: "San Francisco",
    postal: "94117",
    status: "delivered",
    daysAgo: 16,
    items: [
      { slug: "aurora-wireless-headphones", quantity: 1 },
      { slug: "nocturne-eau-de-parfum", quantity: 1 },
    ],
  },
  {
    orderNumber: "VL-261104-R3X8B",
    customer: "Amelia Hart",
    email: "customer@velora.com",
    phone: "+1 (415) 555-0142",
    address: "88 Fillmore Street, Apt 4B",
    city: "San Francisco",
    postal: "94117",
    status: "delivered",
    daysAgo: 12,
    items: [
      { slug: "court-leather-sneaker", quantity: 1 },
      { slug: "cedar-smoke-candle", quantity: 2 },
    ],
  },
  {
    orderNumber: "VL-261108-T9J4W",
    customer: "Elias Noor",
    email: "elias.noor@example.com",
    phone: "+44 20 7946 0912",
    address: "12 Redchurch Street",
    city: "London",
    postal: "E2 7DJ",
    status: "shipped",
    daysAgo: 8,
    guest: true,
    items: [{ slug: "meridian-automatic", quantity: 1 }],
  },
  {
    orderNumber: "VL-261112-H5C7N",
    customer: "Amelia Hart",
    email: "customer@velora.com",
    phone: "+1 (415) 555-0142",
    address: "88 Fillmore Street, Apt 4B",
    city: "San Francisco",
    postal: "94117",
    status: "processing",
    daysAgo: 4,
    items: [
      { slug: "ridge-daypack", quantity: 1 },
      { slug: "vector-wireless-mouse", quantity: 1 },
    ],
  },
  {
    orderNumber: "VL-261114-P2F6D",
    customer: "Sofia Lindqvist",
    email: "sofia.lindqvist@example.com",
    phone: "+46 8 123 456",
    address: "Hornsgatan 24",
    city: "Stockholm",
    postal: "118 20",
    status: "pending",
    daysAgo: 2,
    guest: true,
    items: [
      { slug: "ember-ceramic-set", quantity: 1 },
      { slug: "cedar-smoke-candle", quantity: 1 },
    ],
  },
  {
    orderNumber: "VL-261115-M8V3L",
    customer: "Amelia Hart",
    email: "customer@velora.com",
    phone: "+1 (415) 555-0142",
    address: "88 Fillmore Street, Apt 4B",
    city: "San Francisco",
    postal: "94117",
    status: "cancelled",
    daysAgo: 1,
    items: [{ slug: "form-lounge-chair", quantity: 1 }],
  },
];

async function main() {
  console.log("→ Seeding VELORA…");

  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.session.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();
  await db.newsletterSubscriber.deleteMany();

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const created = await db.category.create({ data: category });
    categoryIds.set(created.slug, created.id);
  }

  const productBySlug = new Map<
    string,
    { id: string; name: string; price: number; slug: string; image: string }
  >();

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Unknown category ${product.category}`);

    const created = await db.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        details: product.details,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        categoryId,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured ?? false,
        isNew: product.isNew ?? false,
        isActive: true,
        images: {
          create: product.images.map((imageId, index) => ({
            url: img(imageId),
            alt: `${product.name} — view ${index + 1}`,
            position: index,
          })),
        },
      },
    });

    productBySlug.set(product.slug, {
      id: created.id,
      name: created.name,
      price: created.price,
      slug: created.slug,
      image: img(product.images[0]),
    });
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "VeloraAdmin!2026";
  const customerPassword =
    process.env.SEED_CUSTOMER_PASSWORD ?? "VeloraDemo!2026";

  const admin = await db.user.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@velora.com",
      passwordHash: await hashPassword(adminPassword),
      fullName: "Velora Studio",
      role: "ADMIN",
      phone: "+45 32 12 88 40",
    },
  });

  const customer = await db.user.create({
    data: {
      email: process.env.SEED_CUSTOMER_EMAIL ?? "customer@velora.com",
      passwordHash: await hashPassword(customerPassword),
      fullName: "Amelia Hart",
      role: "CUSTOMER",
      phone: "+1 (415) 555-0142",
    },
  });

  for (const order of DEMO_ORDERS) {
    const items = order.items.map(({ slug, quantity }) => {
      const product = productBySlug.get(slug);
      if (!product) throw new Error(`Unknown product ${slug}`);
      return {
        product,
        quantity,
        subtotal: product.price * quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = subtotal >= 15000 ? 0 : 900;
    const createdAt = new Date(
      Date.now() - order.daysAgo * 24 * 60 * 60 * 1000,
    );

    await db.order.create({
      data: {
        orderNumber: order.orderNumber,
        userId: order.guest ? null : customer.id,
        customerName: order.customer,
        email: order.email,
        phone: order.phone,
        shippingAddress: order.address,
        city: order.city,
        postalCode: order.postal,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        paymentMethod: "demo_card",
        paymentStatus: order.status === "cancelled" ? "refunded" : "paid",
        orderStatus: order.status,
        createdAt,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productSlug: item.product.slug,
            productImage: item.product.image,
            unitPrice: item.product.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
    });
  }

  await db.wishlistItem.createMany({
    data: [
      { userId: customer.id, productId: productBySlug.get("meridian-automatic")!.id },
      { userId: customer.id, productId: productBySlug.get("form-lounge-chair")!.id },
      { userId: customer.id, productId: productBySlug.get("arc-desk-lamp")!.id },
    ],
  });

  await db.newsletterSubscriber.createMany({
    data: [
      { email: "elias.noor@example.com" },
      { email: "sofia.lindqvist@example.com" },
      { email: "marcus.chen@example.com" },
    ],
  });

  console.log(`✓ ${categories.length} collections, ${products.length} products`);
  console.log(`✓ 2 accounts (${admin.email} admin, ${customer.email} customer)`);
  console.log(`✓ ${DEMO_ORDERS.length} demo orders, wishlist and newsletter data`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
