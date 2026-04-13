import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs';

export type ImageSuggestion = {
  title: string;
  category: string;
  confidence: number;
  label: string;
  source: 'custom' | 'mobilenet';
};

type DescriptionOptions = {
  title: string;
  category?: string;
  label?: string;
};

type DescriptionPack = {
  openings: string[];
  quality: string[];
  usage: string[];
  closing: string[];
};

let modelPromise: Promise<mobilenet.MobileNet> | null = null;
let customModelPromise: Promise<tf.GraphModel | null> | null = null;

const CUSTOM_MODEL_URL = process.env.NEXT_PUBLIC_IMAGE_AI_MODEL_URL;
const CUSTOM_LABELS = (process.env.NEXT_PUBLIC_IMAGE_AI_LABELS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function getModel() {
  if (!modelPromise) {
    modelPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return modelPromise;
}

async function getCustomModel() {
  if (!CUSTOM_MODEL_URL || !CUSTOM_LABELS.length) {
    return null;
  }

  if (!customModelPromise) {
    customModelPromise = tf
      .loadGraphModel(CUSTOM_MODEL_URL)
      .then((model) => model)
      .catch(() => null);
  }

  return customModelPromise;
}

function cleanLabel(label: string) {
  const first = label.split(',')[0] || label;
  return first
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function categoryFromLabel(label: string): string {
  const l = label.toLowerCase();

  if (/(laptop|notebook computer|computer keyboard|mouse|monitor|phone|mobile|headphone|earphone|speaker|camera)/.test(l)) return 'Laptops';
  if (/(book|comic|notebook|binder|paper|menu|envelope|pencil|pen|ruler|calculator)/.test(l)) return 'Books';
  if (/(chair|table|desk|couch|sofa|lamp|wardrobe|shelf|cabinet|bed)/.test(l)) return 'Table';
  if (/(shoe|sneaker|shirt|jacket|backpack|bag|wallet|watch)/.test(l)) return 'Wear';
  if (/(bicycle|bike|scooter|helmet)/.test(l)) return 'Cycle';
  if (/(guitar|piano|drum|violin|microphone|game|joystick|football|basketball|cricket)/.test(l)) return 'Sports';
  return 'Others';
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Image classification is available in browser only'));
      return;
    }

    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image for AI detection'));
    image.src = src;
  });
}

async function classifyWithCustomModel(image: HTMLImageElement) {
  const customModel = await getCustomModel();
  if (!customModel) return null;

  const scores = tf.tidy(() => {
    const imageTensor = tf.browser
      .fromPixels(image)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(255)
      .expandDims(0);

    const prediction = customModel.predict(imageTensor) as tf.Tensor;
    return prediction.squeeze();
  });

  const values = Array.from(await scores.data());
  scores.dispose();

  if (!values.length) return null;

  let bestIndex = 0;
  let bestScore = values[0] ?? 0;

  values.forEach((value, index) => {
    if (value > bestScore) {
      bestScore = value;
      bestIndex = index;
    }
  });

  const rawLabel = CUSTOM_LABELS[bestIndex] || 'Unknown Item';
  return {
    label: rawLabel,
    confidence: Number(bestScore) || 0,
  };
}

export async function suggestFromImage(imageUrl: string): Promise<ImageSuggestion> {
  const image = await loadImage(imageUrl);

  const customPrediction = await classifyWithCustomModel(image);
  if (customPrediction && customPrediction.confidence >= 0.45) {
    const title = cleanLabel(customPrediction.label);
    const category = categoryFromLabel(customPrediction.label);

    return {
      title,
      category,
      confidence: customPrediction.confidence,
      label: customPrediction.label,
      source: 'custom',
    };
  }

  const model = await getModel();
  const predictions = await model.classify(image, 3);

  if (!predictions.length) {
    throw new Error('No item detected from image');
  }

  const best = predictions[0];
  const title = cleanLabel(best.className);
  const category = categoryFromLabel(best.className);

  return {
    title,
    category,
    confidence: best.probability,
    label: best.className,
    source: 'mobilenet',
  };
}

function conditionFromLabel(label?: string) {
  if (!label) return 'in good condition';

  const normalized = label.toLowerCase();
  if (/(charger|adapter|cable|accessory)/.test(normalized)) return 'fully working and well maintained';
  if (/(mobile|phone|laptop|computer)/.test(normalized)) return 'in excellent working condition';
  if (/(book|notes|paper)/.test(normalized)) return 'clean and readable';
  return 'in good condition';
}

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFromPool(pool: string[], seed: number, step = 1) {
  if (pool.length === 0) return '';
  const index = Math.abs((seed * step) % pool.length);
  return pool[index];
}

function getDescriptionPack(category?: string, label?: string): DescriptionPack {
  const c = (category || '').toLowerCase();
  const l = (label || '').toLowerCase();

  if (/(mobile|phone)/.test(c) || /(mobile|phone|smartphone|iphone)/.test(l)) {
    return {
      openings: ['Well-maintained smartphone', 'Compact mobile phone', 'Reliable handset'],
      quality: ['battery backup is stable', 'touch and buttons are working smoothly', 'network and charging performance is solid'],
      usage: ['great for calls, classes, and daily apps', 'perfect for student communication and quick study access', 'useful for online lectures and everyday tasks'],
      closing: ['Available with flexible rental duration.', 'Pickup-friendly and ready to use.', 'Suitable for short-term and monthly rental.'],
    };
  }

  if (/(accessories|audio)/.test(c) || /(charger|adapter|cable|earphone|headphone|speaker)/.test(l)) {
    return {
      openings: ['Useful electronic accessory', 'Handy original accessory', 'Practical gadget add-on'],
      quality: ['fully functional and tested', 'clean condition with stable output', 'works smoothly without performance issues'],
      usage: ['ideal for hostel and classroom setup', 'helps in daily student workflow', 'good fit for projects and regular use'],
      closing: ['Available at student-friendly rental rates.', 'Can be rented for short project periods.', 'Ready for immediate handover.'],
    };
  }

  if (/(laptop|mobiles|electronics)/.test(c) || /(laptop|notebook computer|macbook|computer)/.test(l)) {
    return {
      openings: ['Performance-focused laptop', 'Student-ready electronic device', 'Reliable study and project machine'],
      quality: ['in excellent running condition', 'well maintained with smooth performance', 'stable for coding and coursework'],
      usage: ['ideal for classes, coding, and assignments', 'great for online learning and project work', 'suitable for design, development, and daily study use'],
      closing: ['Flexible rental plans available.', 'Ready for immediate student use.', 'Best for semester-based short-term rental.'],
    };
  }

  if (/(books|notes|stationery|academic)/.test(c) || /(book|notes|paper|notebook|calculator)/.test(l)) {
    return {
      openings: ['Academic item in neat shape', 'Student study essential', 'Useful exam-ready material'],
      quality: ['clean and readable condition', 'properly maintained for regular study', 'good quality and easy to use'],
      usage: ['perfect for engineering and college students', 'helpful for semester preparation and exams', 'ideal for daily classes and revision'],
      closing: ['Available for affordable short-term rent.', 'Can be rented for exam phase or full month.', 'Great option for budget-friendly study support.'],
    };
  }

  if (/(table|chair|bed|storage|lamps|furniture)/.test(c) || /(chair|table|desk|sofa|lamp|bed)/.test(l)) {
    return {
      openings: ['Useful furniture item', 'Space-saving room essential', 'Comfort-focused setup piece'],
      quality: ['strong build and good usability', 'stable and maintained condition', 'clean look with practical utility'],
      usage: ['good for hostel and PG rooms', 'helpful for study and daily routine', 'ideal for temporary room setup'],
      closing: ['Suitable for weekly or monthly rental.', 'Easy to use for short-term stays.', 'Budget-friendly option for students.'],
    };
  }

  if (/(cycle|scooter|transport|travel|safety)/.test(c) || /(bicycle|bike|scooter|helmet)/.test(l)) {
    return {
      openings: ['Campus commute-friendly item', 'Travel-ready student utility', 'Daily movement essential'],
      quality: ['maintained and dependable', 'good working state for regular use', 'safe and practical condition'],
      usage: ['great for local commute and classes', 'helps save time in campus travel', 'ideal for short city rides and college routes'],
      closing: ['Available for flexible rental duration.', 'Great for short-term transport needs.', 'Affordable option for daily commute.'],
    };
  }

  return {
    openings: ['Useful rental item', 'Student-friendly product', 'Well-maintained item'],
    quality: ['in good condition', 'fully usable and maintained', 'ready for immediate use'],
    usage: ['suitable for student use', 'helpful for daily college needs', 'good for short-term practical use'],
    closing: ['Available for flexible rental duration.', 'Can be rented at student-friendly pricing.', 'Ready for quick handover.'],
  };
}

export function generateDescriptionFromTitleAndImage({ title, category, label }: DescriptionOptions) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return '';

  const pack = getDescriptionPack(category, label);
  const seedInput = `${cleanTitle}|${category || ''}|${label || ''}`;
  const seed = hashSeed(seedInput);

  const opening = pickFromPool(pack.openings, seed, 1);
  const quality = pickFromPool(pack.quality, seed, 3);
  const usage = pickFromPool(pack.usage, seed, 5);
  const closing = pickFromPool(pack.closing, seed, 7);

  const sentenceOne = `${cleanTitle} - ${opening.toLowerCase()}, ${conditionFromLabel(label)}, and ${quality}.`;
  const sentenceTwo = `${usage.charAt(0).toUpperCase() + usage.slice(1)}.`;
  const sentenceThree = closing;

  return `${sentenceOne} ${sentenceTwo} ${sentenceThree}`;
}
