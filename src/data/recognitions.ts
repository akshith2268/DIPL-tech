import { assets } from "../config/assets";
import type { Recognition } from "../types/content";

export const recognitions: readonly Recognition[] = [
  {
    title: "All India Rank 1 | IIT Kanpur",
    body: "TATrakshak secured All India Rank 1 in Innovation in Resilient Infrastructure at the Building Bharat Sampark Innovation Boot Camp held at IIT Kanpur.",
    image: assets.recognition.iitKanpur,
    imageAlt: "Drith Infra presenting TATrakshak at IIT Kanpur",
    date: "IIT Innovation Recognition",
  },
  {
    title: "DPIIT Certified | Startup India",
    body: "Officially recognised under the Government of India’s Startup India initiative for its innovation-driven approach.",
    image: assets.recognition.dpiit,
    imageAlt: "DPIIT Startup India certificate for Drith Infra",
    date: "DPIIT Recognition",
  },
  {
    title: "Representative | Savitribai Phule Pune University",
    body: "Represented Savitribai Phule Pune University at Aavishkar 2025-26, the Maharashtra State Inter-University Research Convention.",
    image: assets.recognition.sppu,
    imageAlt: "Drith Infra at the SPPU research convention",
    date: "SPPU University Representation",
  },
  {
    title: "Dainik Bhaskar | Media Feature",
    body: "Drith Infra’s coastal protection mission was featured in Dainik Bhaskar, highlighting our vision to protect coastlines through Tripot-based engineering, mangrove support, and nature-first infrastructure.",
    image: assets.recognition.dainikBhaskar,
    imageAlt: "Dainik Bhaskar newspaper feature on Drith Infra coastal protection innovation",
    date: "DB Newspaper",
  },
  {
    title: "Entrepreneurial Talk | JSPM",
    body: "A leadership interaction where Drith Infra presented its journey, business vision, and future-focused approach toward sustainable coastaline infrastructure and climate-resilient innovation.",
    image: assets.recognition.jspm,
    imageAlt: "Drith Infra presenting its entrepreneurial journey at JSPM",
    date: "JSPM Leadership",
  },
];
