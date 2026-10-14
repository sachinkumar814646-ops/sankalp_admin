import { Product } from "@/types";

function calcPages(targetCount: number): number {
  return Math.ceil(targetCount / 100) + 5;
}

function calcPrice(
  targetCount: number,
  bookSize: "A5" | "A4 Large Print",
  edition: "Standard" | "Premium Gift"
): number {
  const base: Record<number, number> = {
    1008: 199,
    5000: 499,
    11000: 899,
    21000: 1499,
    51000: 2999,
    100000: 4999,
  };
  let price = base[targetCount] ?? 499;
  if (bookSize === "A4 Large Print") price = Math.round(price * 1.3);
  if (edition === "Premium Gift") price = Math.round(price * 1.25);
  return price;
}

const rows: Array<{
  naamId: number;
  targetCount: 1008 | 5000 | 11000 | 21000 | 51000 | 100000;
  bookSize: "A5" | "A4 Large Print";
  binding: "Perfect" | "Wiro";
  edition: "Standard" | "Premium Gift";
  status: "active" | "inactive";
}> = [
  { naamId: 1, targetCount: 1008,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 1, targetCount: 5000,   bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 1, targetCount: 11000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 1, targetCount: 21000,  bookSize: "A5",            binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 2, targetCount: 1008,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 2, targetCount: 11000,  bookSize: "A4 Large Print", binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 2, targetCount: 51000,  bookSize: "A5",            binding: "Perfect", edition: "Premium Gift", status: "inactive" },
  { naamId: 3, targetCount: 1008,   bookSize: "A4 Large Print", binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 3, targetCount: 5000,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 3, targetCount: 11000,  bookSize: "A5",            binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 3, targetCount: 21000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 3, targetCount: 100000, bookSize: "A5",            binding: "Perfect", edition: "Premium Gift", status: "inactive" },
  { naamId: 4, targetCount: 1008,   bookSize: "A5",            binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 4, targetCount: 5000,   bookSize: "A4 Large Print", binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 4, targetCount: 21000,  bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 4, targetCount: 51000,  bookSize: "A4 Large Print", binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 5, targetCount: 1008,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 5, targetCount: 11000,  bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 5, targetCount: 100000, bookSize: "A4 Large Print", binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 6, targetCount: 1008,   bookSize: "A4 Large Print", binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 6, targetCount: 5000,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 6, targetCount: 11000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Standard",    status: "inactive" },
  { naamId: 6, targetCount: 51000,  bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 7, targetCount: 1008,   bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 7, targetCount: 5000,   bookSize: "A5",            binding: "Wiro",    edition: "Premium Gift", status: "active"   },
  { naamId: 7, targetCount: 21000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 7, targetCount: 100000, bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "inactive" },
  { naamId: 8, targetCount: 1008,   bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 8, targetCount: 11000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 8, targetCount: 51000,  bookSize: "A5",            binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 9, targetCount: 1008,   bookSize: "A4 Large Print", binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 9, targetCount: 5000,   bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 9, targetCount: 21000,  bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 9, targetCount: 100000, bookSize: "A4 Large Print", binding: "Wiro",    edition: "Premium Gift", status: "inactive" },
  { naamId: 10, targetCount: 1008,  bookSize: "A5",            binding: "Perfect", edition: "Standard",    status: "inactive" },
  { naamId: 10, targetCount: 5000,  bookSize: "A4 Large Print", binding: "Wiro",    edition: "Standard",    status: "inactive" },
  { naamId: 1, targetCount: 51000,  bookSize: "A4 Large Print", binding: "Perfect", edition: "Standard",    status: "active"   },
  { naamId: 2, targetCount: 100000, bookSize: "A5",            binding: "Wiro",    edition: "Standard",    status: "active"   },
  { naamId: 5, targetCount: 21000,  bookSize: "A5",            binding: "Perfect", edition: "Premium Gift", status: "active"   },
  { naamId: 8, targetCount: 21000,  bookSize: "A4 Large Print", binding: "Wiro",    edition: "Premium Gift", status: "active"   },
];

const naamNames: Record<number, string> = {
  1: "Ram", 2: "Radha", 3: "Krishna", 4: "Shiv", 5: "Om Namah Shivaya",
  6: "Hanuman", 7: "Ganesh", 8: "Durga", 9: "Lakshmi", 10: "Waheguru",
};

function autoName(
  naamId: number,
  targetCount: number,
  bookSize: "A5" | "A4 Large Print",
  edition: "Standard" | "Premium Gift"
): string {
  const naam = naamNames[naamId] ?? "Naam";
  const tc = targetCount.toLocaleString("en-IN");
  const size = bookSize === "A4 Large Print" ? " (A4)" : "";
  const ed = edition === "Premium Gift" ? " – Premium Gift" : "";
  return `${tc} ${naam} Naam Pustika${size}${ed}`;
}

export let mockProductList: Product[] = rows.map((r, i) => ({
  id: i + 1,
  name: autoName(r.naamId, r.targetCount, r.bookSize, r.edition),
  naamId: r.naamId,
  targetCount: r.targetCount,
  bookSize: r.bookSize,
  binding: r.binding,
  edition: r.edition,
  pages: calcPages(r.targetCount),
  basePrice: calcPrice(r.targetCount, r.bookSize, r.edition),
  shippingFee: r.bookSize === "A4 Large Print" ? 149 : r.targetCount >= 21000 ? 99 : 49,
  status: r.status,
  createdAt: new Date(Date.UTC(2024, i % 12, (i % 28) + 1)).toISOString(),
}));
