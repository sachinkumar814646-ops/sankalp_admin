import { Design } from "@/types";

export let mockDesigns: Design[] = [
  {
    id: 1,
    name: "Simple Layout",
    type: "simple",
    description: "Minimal clean writing layout with elegant typography and subtle margins.",
    status: "active",
    usageCount: 48,
    createdAt: "2024-01-01T10:00:00.000Z",
    templates: {
      cover: "simple-cover.svg",
      writingPage: "simple-writing.svg",
      milestonePage: null,
      completionPage: "simple-completion.svg",
    },
  },
  {
    id: 2,
    name: "Traditional Temple",
    type: "traditional",
    description: "Decorative Indian border with authentic sacred motifs and maroon detailing.",
    status: "active",
    usageCount: 85,
    createdAt: "2024-01-02T10:00:00.000Z",
    templates: {
      cover: "traditional-cover.svg",
      writingPage: "traditional-writing.svg",
      milestonePage: "traditional-milestone.svg",
      completionPage: "traditional-completion.svg",
    },
  },
  {
    id: 3,
    name: "Premium Peetambar",
    type: "premium",
    description: "Elegant devotional layout featuring gold gradient corners and auspicious ornaments.",
    status: "active",
    usageCount: 112,
    createdAt: "2024-01-03T10:00:00.000Z",
    templates: {
      cover: "premium-cover.svg",
      writingPage: "premium-writing.svg",
      milestonePage: "premium-milestone.svg",
      completionPage: "premium-completion.svg",
    },
  },
];
