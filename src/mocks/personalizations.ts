import { Personalization } from "@/types";
import { mockUsersList } from "./users";
import { mockNaamList } from "./naam";
import { mockDesigns } from "./designs";

const targetOptions: (1008 | 5000 | 11000 | 21000 | 51000 | 100000)[] = [
  1008, 5000, 11000, 21000, 51000, 100000,
];

const relations: ("Maa" | "Papa" | "Dadi" | "Nani" | "Family" | "Myself" | "Someone Special")[] = [
  "Maa", "Papa", "Dadi", "Nani", "Family", "Myself", "Someone Special",
];

const hindiDedications = [
  "सप्रेम भेंट पूज्य माँ के श्रीचरणों में। आपके असीम स्नेह और आशीर्वाद के लिए।",
  "सादर समर्पित आदरणीय पिताजी को। आपका आशीर्वाद सदा हमारा संबल बना रहे।",
  "प्रिय दादी माँ के लिए, आपके पावन संस्कारों और आशीर्वाद के प्रति कृतज्ञता सहित।",
  "सप्रेम भेंट पूरे परिवार के सुख, शांति और भगवत कृपा हेतु।",
  "श्री राम की अहैतुकी कृपा और आत्मिक शांति के लिए पावन संकल्प पुस्तिका।",
  "आपके स्नेहिल सान्निध्य और मंगलमय जीवन की पावन कामना के साथ सप्रेम भेंट।",
];

const englishDedications = [
  "With immense love, gratitude, and devotion for my beloved family.",
  "Offered with heartfelt prayers for eternal peace, joy, and divine grace.",
  "To dear Parents with deepest respect, devotion, and reverence.",
  "In loving memory and gratitude for continuous spiritual blessings.",
];

let seed = 19;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export let mockPersonalizationsList: Personalization[] = Array.from({ length: 40 }).map((_, index) => {
  const id = index + 1;
  const orderNumber = `NNL-${100001 + index}`;
  const user = mockUsersList[Math.floor(random() * mockUsersList.length)] || { id: (index % 60) + 1, name: "Aarav Sharma" };
  const naam = mockNaamList[Math.floor(random() * mockNaamList.length)] || { id: (index % 10) + 1, name: "Ram" };
  const design = mockDesigns[Math.floor(random() * mockDesigns.length)] || { id: 1, name: "Simple Layout" };

  const targetCount = targetOptions[Math.floor(random() * targetOptions.length)];
  const recipientRelation = relations[Math.floor(random() * relations.length)];
  const recipientName =
    recipientRelation === "Myself"
      ? user.name
      : recipientRelation === "Maa"
      ? "Smt. Shanti Devi"
      : recipientRelation === "Papa"
      ? "Shri Ramswaroop Sharma"
      : recipientRelation === "Dadi"
      ? "Dadi Kaushalya Devi"
      : `${user.name}'s ${recipientRelation}`;

  const fromName = user.name;
  const isHindi = random() > 0.3;
  const language: "Hindi" | "English" = isHindi ? "Hindi" : "English";
  const dedication = isHindi
    ? hindiDedications[Math.floor(random() * hindiDedications.length)]
    : englishDedications[Math.floor(random() * englishDedications.length)];

  const bookSize: "A5" | "A4 Large Print" = random() > 0.4 ? "A5" : "A4 Large Print";
  const binding: "Perfect" | "Wiro" = random() > 0.3 ? "Perfect" : "Wiro";
  const edition: "Standard" | "Premium Gift" = random() > 0.4 ? "Premium Gift" : "Standard";

  const dateText = "22 जनवरी 2024 (शुभ मुहूर्त)";
  const familyName = "शर्मा परिवार";

  const statusRoll = random();
  let approvalStatus: "pending" | "approved" | "changes_requested" = "pending";
  let approvalNote: string | undefined = undefined;
  let finalPdf: string | undefined = undefined;

  if (statusRoll < 0.45) {
    approvalStatus = "approved";
    finalPdf = `final_book_${orderNumber}_print_ready.pdf`;
  } else if (statusRoll < 0.7) {
    approvalStatus = "changes_requested";
    approvalNote = "Please verify the spelling of recipient name in Hindi script.";
  }

  const pages = Math.ceil(targetCount / 100) + 5;
  const previewFile = `preview_${orderNumber}.pdf`;
  const daysAgo = Math.floor(random() * 45) + 1;
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return {
    id,
    orderNumber,
    userId: user.id,
    naamId: naam.id,
    designId: design.id,
    sankalpId: index % 3 === 0 ? index + 1 : undefined,
    targetCount,
    recipientName,
    recipientRelation,
    fromName,
    dedication,
    language,
    bookSize,
    binding,
    edition,
    dateText,
    familyName,
    approvalStatus,
    approvalNote,
    previewFile,
    finalPdf,
    pages,
    createdAt,
  };
});
