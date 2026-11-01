// resolve-images.js — run: node resolve-images.js
import fs from 'node:fs';

const queries = {
  'kalua-pig': 'kalua pig',
  'huli-huli-chicken': 'huli huli chicken',
  'lau-lau': 'laulau Hawaiian',
  'tofu-lau-lau': 'tofu vegetables steamed',
  'grilled-mahi': 'mahi mahi grilled',
  'poke-bowls': 'poke bowl',
  'lomi-salmon': 'lomi lomi salmon',
  'coconut-shrimp': 'coconut shrimp',
  'manapua': 'manapua char siu bao',
  'poi': 'poi taro Hawaii',
  'hawaiian-sweet-bread': 'Portuguese sweet bread',
  'rice': 'cooked white rice bowl',
  'mac-salad': 'Hawaiian macaroni salad',
  'baked-taro': 'kulolo taro',
  'purple-sweet-potato': 'Okinawan purple sweet potato',
  'seaweed-salad': 'seaweed salad',
  'pineapple-rice': 'pineapple fried rice',
  'haupia': 'haupia dessert',
  'malasadas': 'malasada',
  'mochi': 'butter mochi',
  'guava-chiffon': 'guava chiffon cake',
  'lilikoi-cheesecake': 'passion fruit cheesecake',
  'fruit-platter': 'tropical fruit platter',
  'mai-tai': 'mai tai cocktail',
  'blue-hawaii': 'Blue Hawaii cocktail',
  'pina-colada': 'piña colada',
  'poi-smoothie': 'banana smoothie',
  'kona-coffee': 'Kona coffee',
  'guava-juice': 'guava juice',
};

const CACHE = 'image-cache.json';
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolve(term, attempt = 1) {
  const p = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search',
    gsrsearch: `filetype:bitmap ${term}`, gsrnamespace: '6', gsrlimit: '1',
    prop: 'imageinfo', iiprop: 'url', iiurlwidth: '800',
    maxlag: '5',
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${p}`, {
    headers: { 'User-Agent': 'recipe-image-resolver/1.0 (personal project)' },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch {
    if (attempt > 5) throw new Error(`Gave up on "${term}": ${text.slice(0, 80)}`);
    const wait = 5000 * attempt;
    console.warn(`Rate limited on "${term}", waiting ${wait / 1000}s (attempt ${attempt})`);
    await sleep(wait);
    return resolve(term, attempt + 1);
  }
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.imageinfo?.[0]?.thumburl ?? null;
}

for (const [key, term] of Object.entries(queries)) {
  if (key in cache) continue;
  try {
    cache[key] = await resolve(term);
    console.error(`${key}: ${cache[key] ?? 'no result'}`);
  } catch (e) {
    console.error(e.message);
    break; // keep progress; rerun later
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  await sleep(2000);
}

const lines = Object.keys(queries).map((key) => {
  const url = cache[key];
  return `  { key: '${key}', url: ${url ? `'${url}'` : 'null'}, source: 'Wikimedia Commons' },`;
});
console.log(`const recipes = [\n${lines.join('\n')}\n];`);