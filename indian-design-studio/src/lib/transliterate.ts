/**
 * Indic Language Transliteration Engine for Indian Design Studio
 * Provides real-time English-to-Hindi (Hinglish -> Devanagari) transliteration
 * with offline phonetic fallback and rich wedding phrases dictionary.
 */

// Offline Phonetic Mapping Dictionary for fast instant transliteration
const CONSONANT_MAP: Record<string, string> = {
  k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ng: 'ङ',
  ch: 'च', chh: 'छ', j: 'ज', jh: 'झ', ny: 'ञ',
  t: 'ट', th: 'ठ', d: 'ड', dh: 'ढ', n: 'न',
  p: 'प', ph: 'फ', f: 'फ़', b: 'ब', bh: 'भ', m: 'म',
  y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व',
  sh: 'श', shh: 'ष', s: 'स', h: 'ह',
  ksh: 'क्ष', tr: 'त्र', gy: 'ज्ञ', shr: 'श्र'
};

const VOWEL_MAP: Record<string, string> = {
  a: 'अ', aa: 'आ', i: 'इ', ee: 'ई', u: 'उ', oo: 'ऊ',
  ri: 'ऋ', e: 'ए', ai: 'ऐ', o: 'ओ', au: 'औ', am: 'अं', ah: 'अः'
};

const MATRA_MAP: Record<string, string> = {
  aa: 'ा', a: '', i: 'ि', ee: 'ी', u: 'ु', oo: 'ू',
  ri: 'ृ', e: 'े', ai: 'ै', o: 'ो', au: 'ौ', am: 'ं', ah: 'ः'
};

// Common Indian Wedding & Name transliterations lookup for 100% accuracy
const COMMON_WORDS_MAP: Record<string, string> = {
  shubh: 'शुभ',
  vivah: 'विवाह',
  lagan: 'लगन',
  parinaam: 'परिणय',
  parinay: 'परिणय',
  parinayotsav: 'परिणयोत्सव',
  mangal: 'मंगल',
  nimantran: 'निमंत्रण',
  sasneh: 'सस्नेह',
  aashirwad: 'आशीर्वाद',
  shri: 'श्री',
  ganesh: 'गणेश',
  ganeshay: 'गणेशाय',
  namah: 'नमः',
  rohan: 'रोहन',
  rahul: 'राहुल',
  amit: 'अमित',
  vikas: 'विकास',
  sachin: 'सचिन',
  priya: 'प्रिया',
  ananya: 'अनन्या',
  pooja: 'पूजा',
  neha: 'नेहा',
  sharma: 'शर्मा',
  verma: 'वर्मा',
  gupta: 'गुप्ता',
  singh: 'सिंह',
  kumar: 'कुमार',
  yadav: 'यादव',
  patel: 'पटेल',
  mishra: 'मिश्रा',
  tiwari: 'तिवारी',
  pandey: 'पांडेय',
  joshi: 'जोशी',
  shrimati: 'श्रीमती',
  evam: 'एवं',
  aur: 'और',
  sang: 'संग',
  weds: 'संग',
  rajasthan: 'राजस्थान',
  delhi: 'दिल्ली',
  jaipur: 'जयपुर',
  mumbai: 'मुंबई',
  lucknow: 'लखनऊ',
  bhopal: 'भोपाल',
  indore: 'इंदौर',
  varanasi: 'वाराणसी',
  agra: 'आगरा',
  patna: 'पटना',
  palace: 'पैलेस',
  resort: 'रिसॉर्ट',
  garden: 'गार्डन',
  lawn: 'लॉन',
  hotel: 'होटल',
  road: 'रोड',
  marg: 'मार्ग',
  nagar: 'नगर',
  ravivar: 'रविवार',
  somvar: 'सोमवार',
  mangalvar: 'मंगलवार',
  budhvar: 'बुधवार',
  guruvar: 'गुरुवार',
  shukravar: 'शुक्रवार',
  shanivar: 'शनिवार',
  january: 'जनवरी',
  february: 'फ़रवरी',
  march: 'मार्च',
  april: 'अप्रैल',
  may: 'मई',
  june: 'जून',
  july: 'जुलाई',
  august: 'अगस्त',
  september: 'सितंबर',
  october: 'अक्टूबर',
  november: 'नवंबर',
  december: 'दिसंबर',
  sayankal: 'सायंकाल',
  baje: 'बजे',
  bhoj: 'प्रीतिभोज',
  haldi: 'हल्दी',
  mehndi: 'मेहंदी',
  sangeet: 'संगीत',
  barat: 'बारात',
  vidai: 'विदाई',
  darshanabhilashi: 'दर्शनाभिलाषी',
  vinit: 'विनीत',
  swagatakankshi: 'स्वागताकांक्षी',
  bal: 'बाल',
  manuhar: 'मनुहार',
  kripya: 'कृपया',
  padhare: 'पधारें',
  bismillah: 'बिस्मिल्लाह',
  nikah: 'निकाह',
  valima: 'वलीमा',
  anand: 'आनंद',
  karaj: 'कारज',
  gurbani: 'गुरबाणी',
};

/**
 * Phonetically transliterate a single English word to Hindi
 */
export function transliterateWordOffline(word: string): string {
  const lower = word.toLowerCase().trim();
  if (!lower) return '';
  if (COMMON_WORDS_MAP[lower]) {
    return COMMON_WORDS_MAP[lower];
  }

  // Basic syllable walking algorithm
  let result = '';
  let i = 0;
  while (i < lower.length) {
    // Check 3-letter consonant
    const three = lower.slice(i, i + 3);
    const two = lower.slice(i, i + 2);
    const one = lower.slice(i, i + 1);

    if (CONSONANT_MAP[three]) {
      result += CONSONANT_MAP[three];
      i += 3;
      // check matra
      const nextTwo = lower.slice(i, i + 2);
      const nextOne = lower.slice(i, i + 1);
      if (MATRA_MAP[nextTwo] !== undefined) {
        result += MATRA_MAP[nextTwo];
        i += 2;
      } else if (MATRA_MAP[nextOne] !== undefined) {
        result += MATRA_MAP[nextOne];
        i += 1;
      }
    } else if (CONSONANT_MAP[two]) {
      result += CONSONANT_MAP[two];
      i += 2;
      // check matra
      const nextTwo = lower.slice(i, i + 2);
      const nextOne = lower.slice(i, i + 1);
      if (MATRA_MAP[nextTwo] !== undefined) {
        result += MATRA_MAP[nextTwo];
        i += 2;
      } else if (MATRA_MAP[nextOne] !== undefined) {
        result += MATRA_MAP[nextOne];
        i += 1;
      }
    } else if (CONSONANT_MAP[one]) {
      result += CONSONANT_MAP[one];
      i += 1;
      // check matra
      const nextTwo = lower.slice(i, i + 2);
      const nextOne = lower.slice(i, i + 1);
      if (MATRA_MAP[nextTwo] !== undefined) {
        result += MATRA_MAP[nextTwo];
        i += 2;
      } else if (MATRA_MAP[nextOne] !== undefined) {
        result += MATRA_MAP[nextOne];
        i += 1;
      }
    } else if (VOWEL_MAP[two]) {
      result += VOWEL_MAP[two];
      i += 2;
    } else if (VOWEL_MAP[one]) {
      result += VOWEL_MAP[one];
      i += 1;
    } else {
      // Non-alphabet, numbers, punctuation
      result += word[i];
      i++;
    }
  }

  return result || word;
}

/**
 * Transliterates full sentence or paragraph using online Google API with instant offline fallback
 */
export async function transliterateText(
  text: string,
  targetLang: 'hi' | 'pa' | 'bn' | 'gu' | 'ta' | 'te' = 'hi'
): Promise<string> {
  if (!text || text.trim() === '') return text;

  // Split text by whitespace and symbols
  const words = text.split(/(\s+|[,.\-!?:;"'/])/);

  try {
    // Attempt fast Google Input Tools API call
    const query = encodeURIComponent(text);
    const langCode = `${targetLang}-t-i0-und`;
    const res = await fetch(
      `https://inputtools.google.com/request?text=${query}&itc=${langCode}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`,
      { signal: AbortSignal.timeout(1500) }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
        return data[1][0][1][0] || text;
      }
    }
  } catch {
    // Network timeout or offline - use fast local rule engine
  }

  // Fallback to offline phonetic dictionary
  const converted = words.map((chunk) => {
    if (/^[a-zA-Z]+$/.test(chunk)) {
      return transliterateWordOffline(chunk);
    }
    return chunk;
  });

  return converted.join('');
}

/**
 * Curated Bank of Indian Wedding Phrases & Blessings across all traditions
 */
export interface WeddingPhrase {
  title: string;
  category: 'Ganesh' | 'Shloka' | 'Wedding' | 'Family' | 'Islamic' | 'Sikh' | 'South' | 'Bengali' | 'General';
  text: string;
}

export const WEDDING_PHRASE_BANK: WeddingPhrase[] = [
  // Ganesh & Vedic Blessings
  {
    title: 'श्री गणेशाय नमः',
    category: 'Ganesh',
    text: '|| श्री गणेशाय नमः ||',
  },
  {
    title: 'वक्रतुण्ड महाकाय श्लोक',
    category: 'Shloka',
    text: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
  },
  {
    title: 'मंगलम् भगवान विष्णु श्लोक',
    category: 'Shloka',
    text: 'मंगलम् भगवान विष्णुः मंगलम् गरुडध्वजः। मंगलम् पुण्डरीकाक्षः मंगलाय तनो हरिः॥',
  },
  {
    title: 'शुभ विवाह शीर्षक',
    category: 'Wedding',
    text: '॥ शुभ विवाह ॥',
  },
  {
    title: 'परिणयोत्सव आमंत्रण',
    category: 'Wedding',
    text: '॥ परिणयोत्सव ॥ सस्नेह निमंत्रण',
  },
  {
    title: 'ईश्वर कृपा संदेश',
    category: 'Wedding',
    text: 'भगवान श्री गणेश एवं कुलदेवता के असीम अनुग्रह से हमारे सुपुत्र / सुपुत्री का शुभ विवाह संपन्न होना निश्चित हुआ है।',
  },
  {
    title: 'उपस्थिति एवं आशीर्वाद',
    category: 'Wedding',
    text: 'अतः आप सपरिवार पधारकर वर-वधू को अपना शुभाशीर्वाद प्रदान कर हमें अनुगृहीत करें।',
  },
  {
    title: 'बाल मनुहार (अति सुंदर)',
    category: 'Family',
    text: 'चाचा-चाची की शादी में, रसगुल्ले की मिठास में, जलूल-जलूल पधारना हमारी आस में! - समस्त नन्हे-मुन्ने',
  },
  {
    title: 'दर्शनाभिलाषी',
    category: 'Family',
    text: 'समस्त पारिवारिक सदस्य एवं स्नेहीजन',
  },
  {
    title: 'विनीत एवं स्वागताकांक्षी',
    category: 'Family',
    text: 'समस्त परिजन एवं मित्र गण',
  },
  // Islamic Nikaah
  {
    title: 'Bismillah Calligraphy',
    category: 'Islamic',
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (In the name of Allah, the Most Gracious, the Most Merciful)',
  },
  {
    title: 'Nikaah Mubarak Announcement',
    category: 'Islamic',
    text: 'By the Grace of Almighty Allah, you are cordially invited to the Auspicious Nikaah Ceremony & Valima.',
  },
  // Sikh Anand Karaj
  {
    title: 'Ek Onkar Sacred Verse',
    category: 'Sikh',
    text: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥ With the Blessings of Waheguru, cordially invite you to the Anand Karaj.',
  },
  // South Indian
  {
    title: 'Om Sri Maha Ganapataye Namaha',
    category: 'South',
    text: '|| ॐ श्री महागणपतये नमः || Sri Venkateswara Swamy Prasanna - Shubhamastu',
  },
  // Bengali
  {
    title: 'Shubho Bibaha (Bengali)',
    category: 'Bengali',
    text: '॥ শুভ বিবাহ ॥ ওঁ প্রজাপতয়ে নমঃ (Shubho Bibaho & Preeti Bhoj)',
  },
];
