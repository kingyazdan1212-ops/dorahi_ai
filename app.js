// ============================================
// دوراهی - نسخه نهایی با پشتیبانی AI واقعی
// ============================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dilemmaInput = $('#dilemma');
const generateBtn = $('#generate-btn');
const btnText = $('#btn-text');
const btnSpinner = $('#btn-spinner');
const loadingSection = $('#loading');
const resultsSection = $('#results');
const inputSection = $('#input-section');
const heroSection = $('#hero');
const howItWorks = $('#how-it-works');
const scenariosContainer = $('#scenarios-container');
const progressBar = $('#progress');
const loadingText = $('#loading-text');
const loadingSub = $('#loading-sub');
const shareBtn = $('#share-btn');
const againBtn = $('#again-btn');
const regenerateBtn = $('#regenerate-btn');
const resultDilemma = $('#result-dilemma');
const finalInsight = $('#final-insight');
const insightText = $('#insight-text');
const charCount = $('#char-count');
const historyBtn = $('#history-btn');
const historyPanel = $('#history-panel');
const historyList = $('#history-list');
const closeHistory = $('#close-history');
const clearHistoryBtn = $('#clear-history');
const settingsBtn = $('#settings-btn');
const settingsPanel = $('#settings-panel');
const closeSettings = $('#close-settings');
const saveSettings = $('#save-settings');
const clearSettings = $('#clear-settings');
const apiKeyInput = $('#api-key');
const apiBaseInput = $('#api-base');
const apiModelInput = $('#api-model');
const aiStatus = $('#ai-status');
const aiUsedBadge = $('#ai-used-badge');

let currentDilemma = '';
let currentScenarios = [];
let isGenerating = false;
let usedRealAI = false;

// ========== Settings ==========
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('dorahi_ai_settings') || '{}');
    apiKeyInput.value = s.key || '';
    apiBaseInput.value = s.base || 'https://api.openai.com/v1';
    apiModelInput.value = s.model || 'gpt-4o-mini';
    updateAIStatus();
  } catch {}
}

function saveSettingsToStorage() {
  const s = {
    key: apiKeyInput.value.trim(),
    base: apiBaseInput.value.trim() || 'https://api.openai.com/v1',
    model: apiModelInput.value.trim() || 'gpt-4o-mini'
  };
  localStorage.setItem('dorahi_ai_settings', JSON.stringify(s));
  updateAIStatus();
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('dorahi_ai_settings') || '{}');
  } catch {
    return {};
  }
}

function updateAIStatus() {
  const s = getSettings();
  if (s.key) {
    aiStatus.textContent = 'AI فعال';
    aiStatus.className = 'inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/80 text-white';
  } else {
    aiStatus.textContent = 'آفلاین';
    aiStatus.className = 'inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300';
  }
}

// ========== Loading steps ==========
const loadingStepsAI = [
  { main: 'اتصال به هوش مصنوعی', sub: 'در حال ارسال درخواست...' },
  { main: 'درک عمیق دوراهی', sub: 'مدل در حال تحلیل...' },
  { main: 'ساخت سناریوهای آینده', sub: 'شبیه‌سازی مسیرها...' },
  { main: 'محاسبه احتمال‌ها', sub: 'تقریباً آماده‌ست...' }
];

const loadingStepsOffline = [
  { main: 'در حال خواندن دوراهی تو', sub: 'حالت هوشمند داخلی...' },
  { main: 'بررسی مسیرهای ممکن', sub: 'تحلیل گزینه‌ها...' },
  { main: 'شبیه‌سازی پیامدها', sub: 'کوتاه‌مدت و بلندمدت...' },
  { main: 'ساخت سناریوها', sub: 'تقریباً آماده‌ست...' }
];

// ========== Offline smart engine (fallback) ==========
function detectCategory(text) {
  const t = text.toLowerCase();
  const rules = [
    { cat: 'career', keys: ['شغل', 'کار', 'استعفا', 'استارتاپ', 'شرکت', 'درآمد', 'حقوق', 'رئیس', 'همکار', 'پروژه', 'فریلنس', 'بیزینس'] },
    { cat: 'relationship', keys: ['ازدواج', 'رابطه', 'عشق', 'دوست‌دختر', 'دوست‌پسر', 'پارتنر', 'نامزد', 'طلاق', 'جدا', 'عاشق', 'قلب'] },
    { cat: 'migration', keys: ['مهاجرت', 'خارج', 'کشور', 'ویزا', 'اقامت', 'کانادا', 'آلمان', 'آمریکا', 'اروپا', 'ترکیه'] },
    { cat: 'education', keys: ['تحصیل', 'دانشگاه', 'رشته', 'مدرک', 'درس', 'ارشد', 'دکتری', 'کنکور', 'آزمون', 'کورس'] },
    { cat: 'money', keys: ['پول', 'سرمایه', 'سرمایه‌گذاری', 'خرید', 'خانه', 'ملک', 'بورس', 'ارز', 'پس‌انداز', 'قرض'] },
    { cat: 'health', keys: ['سلامت', 'ورزش', 'رژیم', 'دکتر', 'بیماری', 'وزن', 'بدنسازی'] },
    { cat: 'family', keys: ['خانواده', 'پدر', 'مادر', 'بچه', 'فرزند', 'والدین', 'خواهر', 'برادر'] }
  ];
  for (const r of rules) {
    if (r.keys.some(k => t.includes(k))) return r.cat;
  }
  return 'general';
}

const scenarioBank = {
  career: [
    { title: 'مسیر جسورانه', emoji: '🚀', probability: 27, tone: 'positive', summary: 'تصمیم بزرگ رو می‌گیری و وارد مسیر جدید می‌شی. شش ماه اول سختی و عدم قطعیت زیادی داری، درآمدت موقتاً کم می‌شه. اما بعد از ۱۲ تا ۱۸ ماه، مهارت‌ها و شبکه‌ات به سطحی می‌رسه که فرصت‌هایی برات باز می‌شه که قبلاً غیرممکن به نظر می‌رسید. حس مالکیت روی زندگیت خیلی قوی می‌شه.', emotions: ['هیجان', 'استرس سازنده', 'رشد سریع'], tip: 'حداقل ۳ تا ۶ ماه هزینه زندگی پس‌انداز داشته باش قبل از پرش.', timeframe: '۶–۱۸ ماه' },
    { title: 'مسیر هوشمند و تدریجی', emoji: '🛡️', probability: 48, tone: 'neutral', summary: 'شغل فعلیت رو نگه می‌داری ولی همزمان با جدیت روی پروژه یا مهارت جانبی کار می‌کنی. رشد کندتره، اما ریسک تقریباً صفره. بعد از ۱.۵ تا ۲ سال معمولاً به نقطه‌ای می‌رسی که دیگه نیازی به شغل فعلی نداری و با قدرت جابه‌جا می‌شی.', emotions: ['کنترل', 'صبر', 'پیشرفت آرام'], tip: 'هر هفته حداقل ۶–۸ ساعت با کیفیت روی مسیر جدید وقت بذار و قابل اندازه‌گیری‌ش کن.', timeframe: '۱۲–۲۴ ماه' },
    { title: 'مسیر درجا زدن خاموش', emoji: '😶', probability: 25, tone: 'warning', summary: 'هیچ تغییر اساسی نمی‌دی. زندگی ادامه پیدا می‌کنه، حقوق کمی بهتر می‌شه، اما بعد از ۲–۳ سال یک حس قوی «فرصت از دست‌رفته» می‌آد. خیلی‌ها در این نقطه تازه پشیمون می‌شن که زودتر حرکت نکردن.', emotions: ['امنیت ظاهری', 'نارضایتی تدریجی'], tip: 'حتی اگر الان تغییر ندی، یک مهلت مشخص (مثلاً ۹۰ روز) برای خودت تعیین کن.', timeframe: '۲–۴ سال' }
  ],
  relationship: [
    { title: 'مسیر قلب باز', emoji: '❤️', probability: 33, tone: 'positive', summary: 'تصمیم می‌گیری عمیق‌تر بشی و جلو بری. ماه‌های اول پر از نزدیکی و هیجان بیشتره. چالش‌ها و اختلاف‌ها هم پیش میاد، اما چون هر دو طرف متعهد هستن، رابطه معمولاً قوی‌تر و بالغ‌تر از قبل می‌شه.', emotions: ['عشق', 'آسیب‌پذیری', 'رشد مشترک'], tip: 'قبل از هر تصمیم بزرگ، یک مکالمه کاملاً صادقانه درباره ترس‌ها و آرزوها داشته باشین.', timeframe: '۳–۱۲ ماه' },
    { title: 'مسیر صبر آگاهانه', emoji: '⏳', probability: 42, tone: 'neutral', summary: 'عجله نمی‌کنی. چند ماه دیگه با هم وقت باکیفیت می‌گذرونین و بهتر همدیگه رو در شرایط واقعی می‌بینین. این مسیر معمولاً تصمیم‌های پخته‌تری می‌سازه.', emotions: ['صبر', 'مشاهده', 'تردید سالم'], tip: 'یک تاریخ مشخص برای بازنگری تصمیم بذار (مثلاً ۳ یا ۶ ماه دیگه).', timeframe: '۳–۶ ماه' },
    { title: 'مسیر فاصله و بازسازی', emoji: '🌅', probability: 25, tone: 'warning', summary: 'تصمیم به فاصله یا پایان می‌گیری. هفته‌ها و ماه‌های اول سخته. اما به تدریج فضای ذهنی و انرژی‌ات برمی‌گرده.', emotions: ['غم', 'آزادی تدریجی', 'بازسازی هویت'], tip: 'اگر این مسیر رو انتخاب کردی، حداقل ۳۰–۴۵ روز به خودت وقت بده قبل از تصمیم عاطفی جدید.', timeframe: '۱–۶ ماه' }
  ],
  migration: [
    { title: 'مسیر پرواز', emoji: '✈️', probability: 29, tone: 'positive', summary: 'می‌ری. سال اول معمولاً سخت‌ترین سال زندگی‌ته. اما از ماه ۱۸ به بعد، اکثر افراد حس می‌کنن وارد نسخه بهتری از زندگی‌شون شدن.', emotions: ['هیجان', 'تنهایی اولیه', 'رشد اجباری'], tip: 'قبل از رفتن، حداقل یک نفر حمایتی در مقصد و ۶ ماه هزینه زندگی آماده داشته باش.', timeframe: '۱۲–۲۴ ماه' },
    { title: 'مسیر آماده‌سازی حرفه‌ای', emoji: '📦', probability: 49, tone: 'neutral', summary: 'فعلاً نمی‌ری، اما با برنامه دقیق آماده می‌شی. این مسیر معمولاً بالاترین نرخ موفقیت رو داره.', emotions: ['هدفمندی', 'صبر فعال', 'کنترل'], tip: 'یک چک‌لیست ۶ ماهه بنویس و هر ماه پیشرفتت رو اندازه بگیر.', timeframe: '۶–۱۸ ماه آماده‌سازی' },
    { title: 'مسیر ماندن با حسرت خاموش', emoji: '🏠', probability: 22, tone: 'warning', summary: 'می‌مونی. زندگی ادامه پیدا می‌کنه. اما هر بار که خبر موفقیت کسی که رفته رو می‌شنوی، یک حس کوچک اما مداوم حسرت میاد.', emotions: ['امنیت', 'حسرت زیرپوستی'], tip: 'اگر می‌مونی، حداقل یک سفر طولانی اکتشافی به مقصد مورد نظرت داشته باش.', timeframe: 'بلندمدت' }
  ],
  education: [
    { title: 'مسیر سرمایه‌گذاری عمیق', emoji: '📚', probability: 34, tone: 'positive', summary: 'تصمیم می‌گیری ادامه تحصیل بدی. ۲–۳ سال اول پرهزینه و پرفشاره، اما بعدش درهایی باز می‌شه که بدون تخصص عمیق معمولاً بسته می‌مونه.', emotions: ['امید', 'فشار زمانی', 'رشد تخصصی'], tip: 'قبل از شروع، با حداقل ۳ نفر که اون مسیر رو رفتن صحبت عمیق کن.', timeframe: '۲–۴ سال' },
    { title: 'مسیر مهارت و بازار', emoji: '🛠️', probability: 43, tone: 'neutral', summary: 'به جای مدرک رسمی، روی مهارت‌های عملی و پورتفولیو تمرکز می‌کنی. سریع‌تر وارد بازار می‌شی.', emotions: ['عمل‌گرایی', 'استقلال'], tip: 'پورتفولیوی قوی بساز — در خیلی از حوزه‌ها از مدرک مهم‌تر شده.', timeframe: '۶–۱۸ ماه' },
    { title: 'مسیر بلاتکلیفی تحصیلی', emoji: '🔄', probability: 23, tone: 'warning', summary: 'هیچ تصمیم قاطعی نمی‌گیری. زمان می‌گذره و حس عقب‌موندگی بیشتر می‌شه.', emotions: ['بی‌حسی', 'پشیمانی انباشته'], tip: 'حتی ثبت‌نام در یک کورس کوچک آنلاین می‌تونه چرخه بلاتکلیفی رو بشکنه.', timeframe: '۱–۳ سال از دست‌رفته' }
  ],
  money: [
    { title: 'مسیر ریسک حساب‌شده', emoji: '📈', probability: 28, tone: 'positive', summary: 'تصمیم جسورانه‌ای می‌گیری. اگر با دانش و مدیریت ریسک جلو بری، در افق ۳–۵ ساله معمولاً وضعیت مالیت جهش قابل توجهی می‌کنه.', emotions: ['هیجان', 'اضطراب', 'پتانسیل بالا'], tip: 'هیچ‌وقت بیش از چیزی که تحمل از دست دادنش رو داری وارد ریسک نشو.', timeframe: '۲–۵ سال' },
    { title: 'مسیر امنیت و رشد آرام', emoji: '🏦', probability: 47, tone: 'neutral', summary: 'محافظه‌کارانه و منظم پیش می‌ری. رشد کندتره اما شب‌ها راحت می‌خوابی.', emotions: ['آرامش', 'کنترل'], tip: 'حتی در مسیر امن، بخشی از درآمدت رو به افزایش مهارت اختصاص بده.', timeframe: '۳–۷ سال' },
    { title: 'مسیر فرصت سوخته', emoji: '💭', probability: 25, tone: 'warning', summary: 'از ترس ضرر، هیچ اقدام مهمی نمی‌کنی. تورم و گذر زمان ارزش پول و فرصت‌هات رو کم می‌کنه.', emotions: ['ترس', 'حسرت'], tip: 'حتی شروع‌های خیلی کوچک هم بهتر از هیچ اقدامی نکردنه.', timeframe: 'بلندمدت' }
  ],
  health: [
    { title: 'مسیر تعهد جدی', emoji: '💪', probability: 35, tone: 'positive', summary: 'با برنامه مشخص و تعهد بالا شروع می‌کنی. بعد از ۸–۱۲ هفته نتایج ملموس می‌بینی.', emotions: ['انضباط', 'پیشرفت'], tip: 'سیستم بساز، نه فقط هدف. عادت‌های کوچک روزانه خیلی مهم‌ترن.', timeframe: '۳–۶ ماه' },
    { title: 'مسیر تعادل واقع‌بینانه', emoji: '⚖️', probability: 45, tone: 'neutral', summary: 'تغییرات متوسط و پایدار ایجاد می‌کنی. نتایج کندتر ظاهر می‌شه اما پایدارتره.', emotions: ['تعادل', 'پایداری'], tip: '۸۰٪ پایبندی بهتر از ۱۰۰٪ کامل ولی کوتاه‌مدته.', timeframe: '۶–۱۲ ماه' },
    { title: 'مسیر وعده به خود', emoji: '😔', probability: 20, tone: 'warning', summary: 'نیت داری ولی اقدام جدی نمی‌کنی. حس گناه به تدریج جمع می‌شه.', emotions: ['نیت', 'ناامیدی از خود'], tip: 'این بار فقط روی ۲۱ روز اول تمرکز کن.', timeframe: 'تکرارشونده' }
  ],
  family: [
    { title: 'مسیر گفتگوی شجاعانه', emoji: '🗣️', probability: 36, tone: 'positive', summary: 'تصمیم می‌گیری حرف‌های مهم رو بزنی. اول ممکنه تنش ایجاد بشه، اما معمولاً رابطه صادقانه‌تر می‌شه.', emotions: ['شجاعت', 'تنش موقت'], tip: 'زمان و مکان مناسب انتخاب کن و از «من» به جای سرزنش استفاده کن.', timeframe: 'هفته‌ها تا ماه‌ها' },
    { title: 'مسیر حفظ آرامش فعلی', emoji: '🕊️', probability: 40, tone: 'neutral', summary: 'فعلاً موضوع رو باز نمی‌کنی. آرامش سطحی حفظ می‌شه، اما مسائل حل‌نشده می‌مونه.', emotions: ['آرامش موقت', 'اجتناب'], tip: 'یک مهلت مشخص برای خودت بذار.', timeframe: 'نامشخص' },
    { title: 'مسیر فاصله عاطفی', emoji: '🌊', probability: 24, tone: 'warning', summary: 'به خاطر حل نکردن مسائل، به تدریج از نظر عاطفی فاصله می‌گیری.', emotions: ['سردی', 'خستگی'], tip: 'گاهی یک مکالمه کوتاه جلوی سال‌ها فاصله رو می‌گیره.', timeframe: 'تدریجی' }
  ],
  general: [
    { title: 'مسیر شجاعت', emoji: '🔥', probability: 31, tone: 'positive', summary: 'تصمیم بزرگ رو می‌گیری و وارد ناشناخته می‌شی. اولش نامشخصه، اما بعد از مدتی حس می‌کنی زندگیت واقعی‌تر شده.', emotions: ['هیجان', 'ترس سالم', 'زندگی'], tip: 'کوچک‌ترین قدم ممکن رو امروز بردار، نه فردا.', timeframe: 'هفته‌ها تا ماه‌ها' },
    { title: 'مسیر میانه و هوشمند', emoji: '⚖️', probability: 45, tone: 'neutral', summary: 'یک راه‌حل میانی و آزمایشی پیدا می‌کنی که هم پیشرفتی داشته باشی و هم امنیت نسبی حفظ بشه.', emotions: ['تعادل', 'آزمایش'], tip: 'یک نسخه کوچک و کم‌ریسک از تصمیم رو اول تست کن.', timeframe: '۱–۶ ماه' },
    { title: 'مسیر اجتناب', emoji: '🌫️', probability: 24, tone: 'warning', summary: 'تصمیم رو عقب می‌ندازی. تصمیم نگرفتن خودش یک تصمیمه — فقط معمولاً پرهزینه‌ترین نوعشه.', emotions: ['آرامش موقت', 'حسرت بلندمدت'], tip: 'از خودت بپرس: اگر یک سال دیگه به امروز نگاه کنم، از کدوم انتخاب پشیمون می‌شم؟', timeframe: 'بلندمدت' }
  ]
};

function generateOfflineScenarios(text) {
  const category = detectCategory(text);
  const base = scenarioBank[category] || scenarioBank.general;
  return base.map(s => ({
    ...s,
    probability: Math.max(15, Math.min(55, s.probability + Math.floor(Math.random() * 7) - 3))
  })).sort((a, b) => b.probability - a.probability);
}

function getOfflineInsight(category) {
  const insights = {
    career: 'در تصمیم‌های شغلی، معمولاً کسانی که ترکیب «اقدام تدریجی + مهارت‌سازی» رو انتخاب می‌کنن، هم رشد می‌کنن و هم کمتر می‌سوزن.',
    relationship: 'در روابط، شفافیت و مکالمه صادقانه تقریباً همیشه بهتر از حدس زدن و سکوت عمل می‌کنه.',
    migration: 'موفق‌ترین مهاجرت‌ها معمولاً مال کسانی بوده که قبل از پرش، آمادگی واقعی داشتن.',
    education: 'مدرک به تنهایی کافی نیست. مهارت قابل اثبات و پورتفولیو در دنیای امروز حرف اول رو می‌زنه.',
    money: 'بزرگ‌ترین دشمن ثروت، نه ریسک حساب‌شده، بلکه تصمیم نگرفتن و راکد موندن در برابر تورم و فرصت‌هاست.',
    health: 'سیستم و عادت کوچک روزانه، خیلی قوی‌تر از انگیزه هیجانی کوتاه‌مدته.',
    family: 'مسائل حل‌نشده در روابط خانوادگی معمولاً با زمان بهتر نمی‌شن.',
    general: 'تقریباً در همه تصمیم‌های مهم زندگی، پشیمانی از «اقدام کردن» کمتر از پشیمانی از «اقدام نکردن» دوام میاره.'
  };
  return insights[category] || insights.general;
}

// ========== Real AI Call ==========
async function callRealAI(dilemma) {
  const s = getSettings();
  if (!s.key) throw new Error('NO_KEY');

  const systemPrompt = `تو یک مشاور تصمیم‌گیری بسیار باهوش، همدل و واقع‌بین هستی. کاربر یک دوراهی زندگی به تو می‌دهد.
وظیفه تو: دقیقاً ۳ سناریوی آینده ممکن برای این دوراهی بساز.

قوانین مهم:
- همه چیز را به زبان فارسی روان و طبیعی بنویس.
- سناریوها باید واقعی، عمیق و غیرکلیشه‌ای باشند.
- یکی از سناریوها جسورانه/مثبت، یکی متعادل، یکی محتاطانه یا هشداردهنده باشد.
- احتمال‌ها جمع تقریبی ۱۰۰ درصد باشند.
- فقط و فقط یک JSON معتبر برگردان، هیچ متن اضافی قبل یا بعد از JSON ننویس.

ساختار دقیق JSON:
{
  "scenarios": [
    {
      "title": "عنوان کوتاه و جذاب",
      "emoji": "یک ایموجی مرتبط",
      "probability": عدد بین ۱۵ تا ۵۵,
      "tone": "positive یا neutral یا warning",
      "summary": "توضیح ۲ تا ۴ جمله‌ای از اینکه این مسیر چگونه پیش می‌رود و چه احساسی ایجاد می‌کند",
      "emotions": ["۲ یا ۳ احساس کلیدی"],
      "tip": "یک نکته عملی و مفید",
      "timeframe": "بازه زمانی تقریبی مثل ۳–۱۲ ماه"
    }
  ],
  "insight": "یک جمله عمیق و ارزشمند به عنوان نکته پایانی"
}`;

  const body = {
    model: s.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `دوراهی من این است:\n\n${dilemma}` }
    ],
    temperature: 0.75,
    max_tokens: 1800
  };

  const base = (s.base || 'https://api.openai.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${s.key}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API_ERROR_${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  // Extract JSON (in case model adds markdown)
  let jsonStr = content.trim();
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (match) jsonStr = match[0];
  
  const parsed = JSON.parse(jsonStr);
  
  if (!parsed.scenarios || !Array.isArray(parsed.scenarios) || parsed.scenarios.length < 2) {
    throw new Error('INVALID_RESPONSE');
  }

  return {
    scenarios: parsed.scenarios.slice(0, 3).map(sc => ({
      title: sc.title || 'مسیر',
      emoji: sc.emoji || '🔮',
      probability: Math.min(60, Math.max(10, Number(sc.probability) || 30)),
      tone: ['positive', 'neutral', 'warning'].includes(sc.tone) ? sc.tone : 'neutral',
      summary: sc.summary || '',
      emotions: Array.isArray(sc.emotions) ? sc.emotions.slice(0, 4) : ['تفکر'],
      tip: sc.tip || '',
      timeframe: sc.timeframe || ''
    })),
    insight: parsed.insight || 'هر تصمیمی که بگیری، مهم این است که با آگاهی و مسئولیت‌پذیری باشد.'
  };
}

// ========== UI ==========
function getToneStyles(tone) {
  if (tone === 'positive') return { border: 'border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-400', glow: 'shadow-emerald-500/10' };
  if (tone === 'warning') return { border: 'border-amber-500/30', badge: 'bg-amber-500/15 text-amber-300', bar: 'bg-amber-400', glow: 'shadow-amber-500/10' };
  return { border: 'border-sky-500/30', badge: 'bg-sky-500/15 text-sky-300', bar: 'bg-sky-400', glow: 'shadow-sky-500/10' };
}

function renderScenarios(scenarios) {
  scenariosContainer.innerHTML = '';
  scenarios.forEach((s, index) => {
    const styles = getToneStyles(s.tone);
    const card = document.createElement('div');
    card.className = `scenario-card glass rounded-2xl p-5 border ${styles.border} ${styles.glow} fade-in`;
    card.style.animationDelay = `${index * 0.12}s`;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl">${s.emoji}</span>
          <div>
            <h4 class="font-bold text-[17px]">${s.title}</h4>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-[11px] px-2 py-0.5 rounded-full ${styles.badge}">احتمال ≈ ${s.probability}٪</span>
              ${s.timeframe ? `<span class="text-[11px] text-slate-500">${s.timeframe}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="w-full h-1.5 bg-slate-800/80 rounded-full mb-4 overflow-hidden">
        <div class="h-full ${styles.bar} rounded-full transition-all duration-1000" style="width: 0%" data-width="${s.probability}"></div>
      </div>
      <p class="text-slate-300 leading-relaxed mb-4 text-[14.5px]">${s.summary}</p>
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${(s.emotions || []).map(e => `<span class="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full">${e}</span>`).join('')}
      </div>
      ${s.tip ? `<div class="text-[13px] text-slate-400 bg-slate-900/60 rounded-xl px-3.5 py-2.5 flex gap-2"><span>💡</span><span class="text-slate-300">${s.tip}</span></div>` : ''}
    `;
    scenariosContainer.appendChild(card);
    setTimeout(() => {
      const bar = card.querySelector('[data-width]');
      if (bar) bar.style.width = bar.dataset.width + '%';
    }, 100 + index * 150);
  });
}

// ========== History ==========
function getHistory() {
  try { return JSON.parse(localStorage.getItem('dorahi_history') || '[]'); } catch { return []; }
}

function saveToHistory(dilemma, scenarios) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    dilemma: dilemma.slice(0, 200),
    date: new Date().toLocaleDateString('fa-IR'),
    topScenario: scenarios[0]?.title || '',
    usedAI: usedRealAI
  });
  localStorage.setItem('dorahi_history', JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyList.innerHTML = `<p class="text-center text-slate-500 text-sm py-8">هنوز تاریخچه‌ای نداری</p>`;
    return;
  }
  historyList.innerHTML = history.map(h => `
    <div class="history-item rounded-xl p-3 cursor-pointer transition border border-transparent hover:border-slate-700" data-id="${h.id}">
      <p class="text-sm text-slate-200 line-clamp-2 mb-1">${h.dilemma}</p>
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <span>${h.date}${h.usedAI ? ' • AI' : ''}</span>
        <span>${h.topScenario}</span>
      </div>
    </div>
  `).join('');
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const entry = getHistory().find(h => h.id === Number(item.dataset.id));
      if (entry) {
        dilemmaInput.value = entry.dilemma;
        updateCharCount();
        historyPanel.classList.add('hidden');
        runSimulation();
      }
    });
  });
}

// ========== Main ==========
async function runSimulation() {
  if (isGenerating) return;
  const text = dilemmaInput.value.trim();
  if (!text || text.length < 8) {
    dilemmaInput.focus();
    dilemmaInput.classList.add('ring-2', 'ring-red-500/70');
    setTimeout(() => dilemmaInput.classList.remove('ring-2', 'ring-red-500/70'), 1600);
    return;
  }

  isGenerating = true;
  currentDilemma = text;
  usedRealAI = false;

  generateBtn.disabled = true;
  btnText.textContent = 'در حال فکر...';
  btnSpinner.classList.remove('hidden');
  inputSection.classList.add('opacity-40', 'pointer-events-none');
  resultsSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');
  howItWorks?.classList.add('hidden');
  aiUsedBadge.classList.add('hidden');

  const settings = getSettings();
  const hasKey = !!settings.key;
  const steps = hasKey ? loadingStepsAI : loadingStepsOffline;

  let progress = 0;
  let step = 0;
  progressBar.style.width = '0%';
  loadingText.textContent = steps[0].main;
  loadingSub.textContent = steps[0].sub;

  const progressInterval = setInterval(() => {
    progress += Math.random() * 11 + 5;
    if (progress > 88) progress = 88;
    progressBar.style.width = progress + '%';
    if (step < steps.length - 1 && progress > (step + 1) * 20) {
      step++;
      loadingText.textContent = steps[step].main;
      loadingSub.textContent = steps[step].sub;
    }
  }, 420);

  let scenarios, insight;

  try {
    if (hasKey) {
      try {
        const result = await callRealAI(text);
        scenarios = result.scenarios;
        insight = result.insight;
        usedRealAI = true;
      } catch (err) {
        console.warn('AI failed, falling back:', err.message);
        // Fallback to offline
        scenarios = generateOfflineScenarios(text);
        insight = getOfflineInsight(detectCategory(text)) + ' (حالت آفلاین — اتصال به AI برقرار نشد)';
        usedRealAI = false;
      }
    } else {
      await new Promise(r => setTimeout(r, 1800 + Math.random() * 1000));
      scenarios = generateOfflineScenarios(text);
      insight = getOfflineInsight(detectCategory(text));
    }
  } catch (e) {
    scenarios = generateOfflineScenarios(text);
    insight = getOfflineInsight(detectCategory(text));
  }

  clearInterval(progressInterval);
  progressBar.style.width = '100%';
  loadingText.textContent = 'سناریوها آماده‌ست';
  loadingSub.textContent = usedRealAI ? 'ساخته‌شده با هوش مصنوعی واقعی' : 'ساخته‌شده با موتور هوشمند داخلی';

  await new Promise(r => setTimeout(r, 400));

  currentScenarios = scenarios;
  saveToHistory(text, scenarios);

  resultDilemma.textContent = text;
  renderScenarios(scenarios);
  insightText.textContent = insight;
  finalInsight.classList.remove('hidden');

  if (usedRealAI) aiUsedBadge.classList.remove('hidden');

  loadingSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  inputSection.classList.add('hidden');
  heroSection.classList.add('hidden');

  generateBtn.disabled = false;
  btnText.textContent = 'شبیه‌سازی آینده';
  btnSpinner.classList.add('hidden');
  inputSection.classList.remove('opacity-40', 'pointer-events-none');
  isGenerating = false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Events ==========
generateBtn.addEventListener('click', runSimulation);
regenerateBtn.addEventListener('click', () => {
  if (currentDilemma) {
    dilemmaInput.value = currentDilemma;
    runSimulation();
  }
});

againBtn.addEventListener('click', () => {
  resultsSection.classList.add('hidden');
  inputSection.classList.remove('hidden');
  heroSection.classList.remove('hidden');
  howItWorks?.classList.remove('hidden');
  dilemmaInput.value = '';
  updateCharCount();
  dilemmaInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$$('#example-chips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    dilemmaInput.value = chip.dataset.example;
    updateCharCount();
    dilemmaInput.focus();
  });
});

function updateCharCount() {
  charCount.textContent = dilemmaInput.value.length.toLocaleString('fa-IR') + ' کاراکتر';
}
dilemmaInput.addEventListener('input', updateCharCount);

dilemmaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runSimulation();
  }
});

shareBtn.addEventListener('click', async () => {
  const top = currentScenarios[0];
  const shareText = `🔮 دوراهی من:\n«${currentDilemma.slice(0, 100)}${currentDilemma.length > 100 ? '...' : ''}»\n\nقوی‌ترین سناریو: ${top?.emoji || ''} ${top?.title || ''}\n\nتو هم تصمیم‌هات رو شبیه‌سازی کن:`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'دوراهی', text: shareText, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      shareBtn.innerHTML = '✓ کپی شد';
      setTimeout(() => { shareBtn.innerHTML = shareBtn.dataset.original || 'اشتراک'; }, 2000);
    }
  } else {
    navigator.clipboard.writeText(shareText + '\n' + window.location.href);
    const original = shareBtn.innerHTML;
    shareBtn.innerHTML = '✓ کپی شد';
    setTimeout(() => { shareBtn.innerHTML = original; }, 2000);
  }
});

// Settings
settingsBtn.addEventListener('click', () => {
  loadSettings();
  settingsPanel.classList.remove('hidden');
});
closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));
settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) settingsPanel.classList.add('hidden'); });

saveSettings.addEventListener('click', () => {
  saveSettingsToStorage();
  settingsPanel.classList.add('hidden');
});

clearSettings.addEventListener('click', () => {
  apiKeyInput.value = '';
  apiBaseInput.value = 'https://api.openai.com/v1';
  apiModelInput.value = 'gpt-4o-mini';
  localStorage.removeItem('dorahi_ai_settings');
  updateAIStatus();
});

$$('.preset-base').forEach(btn => {
  btn.addEventListener('click', () => {
    apiBaseInput.value = btn.dataset.url;
  });
});

// History
historyBtn.addEventListener('click', () => {
  renderHistory();
  historyPanel.classList.remove('hidden');
});
closeHistory.addEventListener('click', () => historyPanel.classList.add('hidden'));
historyPanel.addEventListener('click', (e) => { if (e.target === historyPanel) historyPanel.classList.add('hidden'); });
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('همه تاریخچه پاک بشه؟')) {
    localStorage.removeItem('dorahi_history');
    renderHistory();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

loadSettings();
updateCharCount();
