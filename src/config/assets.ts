const LOCAL_ROOT = "/assets";
const KPI_CDN_ROOT = "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/kpis";
const PARTNER_CDN_ROOT = "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/kp";

/**
 * Single source of truth for every image and video used by the application.
 * Keep lightweight, versioned assets in public/assets and large media on the CDN.
 */
export const assets = {
  brand: {
    logo: `${LOCAL_ROOT}/images/brand/drith-logo.png`,
  },
  projects: {
    coast: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/Project/tatrakshak.webp",
    chaitanya: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/Project/tatc.png",
    sagarMitra: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/Project/tats.png",
    tatrakshakCoast: `${LOCAL_ROOT}/images/projects/tatrakshak-coast.jpg`,
  },
  comparisons: {
    coastBefore: `${LOCAL_ROOT}/images/comparisons/coast-before.webp`,
    coastAfter: `${LOCAL_ROOT}/images/comparisons/coast-after.webp`,
    natureAfter: `${LOCAL_ROOT}/images/comparisons/nature-after.webp`,
  },
  recognition: {
    iitKanpur: `${LOCAL_ROOT}/images/recognition/iit-kanpur.jpeg`,
    dpiit: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/awards/dpiit.png",
    sppu: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/awards/sppu.jpeg",
    dainikBhaskar: `${LOCAL_ROOT}/images/recognition/dainik-bhaskar.jpeg`,
    jspm: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/awards/JSPM%20REcognition.jpeg",
  },
  team: {
    abhishekGiri: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/pfp/abpfp.png",
    abhilashaGiri: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/pfp/agpfp.png",
    lalitBadgujar: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/pfp/lb.webp",
    nikhilBejjaram: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/pfp/nb.webp",
  },
  partners: {
    be: `${PARTNER_CDN_ROOT}/be.png`,
    cr: `${PARTNER_CDN_ROOT}/cr.png`,
    es: `${PARTNER_CDN_ROOT}/es.png`,
    js: `${PARTNER_CDN_ROOT}/js.png`,
    mt: `${PARTNER_CDN_ROOT}/mt.png`,
    susdg: `${PARTNER_CDN_ROOT}/susdg.png`,
    tc: `${PARTNER_CDN_ROOT}/tc.png`,
    tr: `${PARTNER_CDN_ROOT}/tr.png`,
    tsr: `${PARTNER_CDN_ROOT}/tsr.png`,
  },
  sdgs: {
    industry: `${LOCAL_ROOT}/images/sdgs/sdg-09-industry.webp`,
    cities: `${LOCAL_ROOT}/images/sdgs/sdg-11-cities.webp`,
    climate: `${LOCAL_ROOT}/images/sdgs/sdg-13-climate.webp`,
    water: `${LOCAL_ROOT}/images/sdgs/sdg-14-water.webp`,
  },
  articles: {
    engineer: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/blog/measanengineer.jpg",
    ceo: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/blog/measaceo.jpg",
  },
  videos: {
    homeHero: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/videos/Drith%20Infra%20Final.mp4",
    tatrakshakHero: "https://ovqxuakoekllsxzvnmvx.supabase.co/storage/v1/object/public/DIPL-tech-Galllery/videos/V1.mp4",
  },
} as const;

export function getKpiImage(index: number) {
  return `${KPI_CDN_ROOT}/kpi${index + 1}.png`;
}
