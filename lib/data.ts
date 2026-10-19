export type Channel = "whatsapp" | "instagram" | "facebook" | "website" | "referral" | "other";

export interface Company {
  id: string;
  ar: string;
  en: string;
  sectorAr: string;
  sectorEn: string;
  weight: number;
}

export const companies: Company[] = [
  { id: "dom", ar: "دوم لتأجير السيارات", en: "Dom Car Rental", sectorAr: "النقل واللوجستيات", sectorEn: "Transport", weight: 1.0 },
  { id: "qader", ar: "قادر", en: "Qader", sectorAr: "النقل واللوجستيات", sectorEn: "Transport", weight: 0.9 },
  { id: "binrabie", ar: "بن ربعي للنقليات", en: "Bin Rabie Transport", sectorAr: "النقل واللوجستيات", sectorEn: "Transport", weight: 1.1 },
];

export const totalWeight = companies.reduce((s, c) => s + c.weight, 0);

export interface Kpis {
  conversations: number;
  newClients: number;
  opportunities: number;
  dailySales: number;
}

export const groupKpis: Kpis = {
  conversations: 1248,
  newClients: 856,
  opportunities: 392,
  dailySales: 287450,
};

export function companyKpis(companyId: string | null): Kpis {
  if (!companyId) return groupKpis;
  const company = companies.find((c) => c.id === companyId);
  const share = (company?.weight ?? 1) / totalWeight;
  return {
    conversations: Math.round(groupKpis.conversations * share),
    newClients: Math.round(groupKpis.newClients * share),
    opportunities: Math.round(groupKpis.opportunities * share),
    dailySales: Math.round(groupKpis.dailySales * share),
  };
}

export const months = [
  { ar: "يناير", en: "Jan" },
  { ar: "فبراير", en: "Feb" },
  { ar: "مارس", en: "Mar" },
  { ar: "أبريل", en: "Apr" },
  { ar: "مايو", en: "May" },
  { ar: "يونيو", en: "Jun" },
];

export const groupSales = [320, 410, 380, 520, 610, 740];

export function companySales(companyId: string | null): number[] {
  if (!companyId) return groupSales;
  const company = companies.find((c) => c.id === companyId);
  const share = (company?.weight ?? 1) / totalWeight;
  return groupSales.map((v) => Math.round(v * share));
}

export interface SourceSlice {
  key: Channel;
  ar: string;
  en: string;
  value: number;
  color: string;
}

export const sources: SourceSlice[] = [
  { key: "whatsapp", ar: "واتساب", en: "WhatsApp", value: 45, color: "#22c55e" },
  { key: "instagram", ar: "إنستغرام", en: "Instagram", value: 20, color: "#ec4899" },
  { key: "facebook", ar: "فيسبوك", en: "Facebook", value: 15, color: "#3b82f6" },
  { key: "website", ar: "الموقع", en: "Website", value: 10, color: "#f59e0b" },
  { key: "referral", ar: "إحالة", en: "Referral", value: 5, color: "#8b5cf6" },
  { key: "other", ar: "أخرى", en: "Other", value: 5, color: "#64748b" },
];

export type Stage = "lead" | "qualified" | "proposal" | "won" | "lost";

export interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  email: string;
  companyId: string;
  source: Channel;
  stage: Stage;
  value: number;
  city: string;
  since: string;
}

export const customers: Customer[] = [
  { id: "c1", nameAr: "شركة أفق التجارية", nameEn: "Ofuq Trading Co.", phone: "0555123401", email: "ofuq@example.com", companyId: "tco", source: "whatsapp", stage: "proposal", value: 86000, city: "جدة", since: "2026-01-12" },
  { id: "c2", nameAr: "مؤسسة النخبة", nameEn: "Al Nokhba Est.", phone: "0555123402", email: "nokhba@example.com", companyId: "transport", source: "instagram", stage: "qualified", value: 42000, city: "الرياض", since: "2026-02-03" },
  { id: "c3", nameAr: "مطاعم البيت الدافئ", nameEn: "Warm House Restaurants", phone: "0555123403", email: "warm@example.com", companyId: "delivery", source: "facebook", stage: "won", value: 18500, city: "مكة", since: "2025-11-20" },
  { id: "c4", nameAr: "فندق الواحة", nameEn: "Al Waha Hotel", phone: "0555123404", email: "waha@example.com", companyId: "hotels", source: "website", stage: "lead", value: 120000, city: "المدينة", since: "2026-03-01" },
  { id: "c5", nameAr: "مكتب رؤى الهندسي", nameEn: "Roaya Engineering", phone: "0555123405", email: "roaya@example.com", companyId: "engineering", source: "referral", stage: "proposal", value: 64000, city: "الدمام", since: "2026-01-28" },
  { id: "c6", nameAr: "شركة مسار للمقاولات", nameEn: "Masar Contracting", phone: "0555123406", email: "masar@example.com", companyId: "contractors", source: "whatsapp", stage: "qualified", value: 210000, city: "الرياض", since: "2025-12-14" },
  { id: "c7", nameAr: "وكالة أجنحة السفر", nameEn: "Ajniha Travel", phone: "0555123407", email: "ajniha@example.com", companyId: "travel", source: "instagram", stage: "won", value: 27500, city: "جدة", since: "2026-02-18" },
  { id: "c8", nameAr: "معارض دوم", nameEn: "Dom Showrooms", phone: "0555123408", email: "domshow@example.com", companyId: "dom", source: "facebook", stage: "lead", value: 33000, city: "الخبر", since: "2026-03-09" },
  { id: "c9", nameAr: "تطبيق وصلني", nameEn: "Wasselni App", phone: "0555123409", email: "wasselni@example.com", companyId: "qader", source: "website", stage: "qualified", value: 15000, city: "جدة", since: "2026-02-25" },
  { id: "c10", nameAr: "مستودعات الأفق", nameEn: "Ofoq Warehouses", phone: "0555123410", email: "warehouses@example.com", companyId: "express", source: "whatsapp", stage: "proposal", value: 54000, city: "الرياض", since: "2026-01-05" },
  { id: "c11", nameAr: "مجموعة صفا", nameEn: "Safa Group", phone: "0555123411", email: "safa@example.com", companyId: "business", source: "referral", stage: "won", value: 22000, city: "جدة", since: "2025-10-30" },
  { id: "c12", nameAr: "شركة بريق للتجارة", nameEn: "Bareeq Trading", phone: "0555123412", email: "bareeq@example.com", companyId: "tco", source: "instagram", stage: "lost", value: 40000, city: "ينبع", since: "2025-09-16" },
];

export interface ChatMessage {
  id: string;
  from: "customer" | "agent";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  channel: Channel;
  unread: boolean;
  lastTime: string;
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    id: "v1", customerId: "c1", channel: "whatsapp", unread: true, lastTime: "10:24",
    messages: [
      { id: "m1", from: "customer", text: "السلام عليكم، أبغى عرض سعر لشحن حاوية من جدة إلى دبي.", time: "10:18" },
      { id: "m2", from: "agent", text: "وعليكم السلام، أهلاً بك. الحاوية 20 قدم أم 40 قدم؟", time: "10:21" },
      { id: "m3", from: "customer", text: "40 قدم، والبضاعة أجهزة كهربائية.", time: "10:24" },
    ],
  },
  {
    id: "v2", customerId: "c2", channel: "instagram", unread: true, lastTime: "09:55",
    messages: [
      { id: "m4", from: "customer", text: "هل توفرون نقل مبرد من الرياض إلى الدمام؟", time: "09:50" },
      { id: "m5", from: "agent", text: "نعم، أسطولنا المبرد يغطي الخط يومياً. كم طن تقريباً؟", time: "09:55" },
    ],
  },
  {
    id: "v3", customerId: "c3", channel: "facebook", unread: false, lastTime: "أمس",
    messages: [
      { id: "m6", from: "customer", text: "نحتاج توصيل لثلاثة فروع جديدة في مكة.", time: "أمس" },
      { id: "m7", from: "agent", text: "تمام، أرسلت لكم عرض التغطية الأسبوعية على الإيميل.", time: "أمس" },
    ],
  },
  {
    id: "v4", customerId: "c4", channel: "whatsapp", unread: false, lastTime: "أمس",
    messages: [
      { id: "m8", from: "customer", text: "هل فيه غرف متاحة للأسبوع القادم لوفد من 12 شخص؟", time: "أمس" },
    ],
  },
  {
    id: "v5", customerId: "c5", channel: "website", unread: true, lastTime: "08:40",
    messages: [
      { id: "m9", from: "customer", text: "أرسلت المخططات المعمارية، ننتظر مراجعة الإشراف.", time: "08:40" },
    ],
  },
  {
    id: "v6", customerId: "c6", channel: "whatsapp", unread: false, lastTime: "أمس",
    messages: [
      { id: "m10", from: "agent", text: "تم اعتماد جدول التسليم للمرحلة الثانية.", time: "أمس" },
      { id: "m11", from: "customer", text: "ممتاز، نأكد الاجتماع يوم الأحد.", time: "أمس" },
    ],
  },
  {
    id: "v7", customerId: "c7", channel: "instagram", unread: false, lastTime: "الإثنين",
    messages: [
      { id: "m12", from: "customer", text: "أبي باقة عمرة لعائلة من 6 أشخاص في رمضان.", time: "الإثنين" },
    ],
  },
  {
    id: "v8", customerId: "c10", channel: "facebook", unread: false, lastTime: "الإثنين",
    messages: [
      { id: "m13", from: "customer", text: "مساحة التخزين المطلوبة 800 متر لمدة 6 أشهر.", time: "الإثنين" },
    ],
  },
];

export interface ScheduledMessage {
  id: string;
  customerId: string;
  channel: Channel;
  text: string;
  when: string;
  sent: boolean;
}

export const scheduledMessages: ScheduledMessage[] = [
  { id: "s1", customerId: "c1", channel: "whatsapp", text: "تذكير: عرض سعر الحاوية ساري حتى نهاية الأسبوع.", when: "اليوم 14:00", sent: false },
  { id: "s2", customerId: "c4", channel: "whatsapp", text: "متابعة طلب حجز الوفد وإرسال الأسعار.", when: "اليوم 16:30", sent: false },
  { id: "s3", customerId: "c7", channel: "instagram", text: "إرسال برنامج العمرة المقترح مع الأسعار.", when: "غداً 09:00", sent: false },
  { id: "s4", customerId: "c6", channel: "facebook", text: "تأكيد موعد اجتماع الأحد الساعة 11.", when: "غداً 11:00", sent: false },
  { id: "s5", customerId: "c3", channel: "whatsapp", text: "شكراً لتعاملكم، تقييم الخدمة مرفق.", when: "أمس 18:00", sent: true },
];

export interface Task {
  id: string;
  titleAr: string;
  titleEn: string;
  companyId: string;
  due: string;
  priority: "high" | "medium" | "low";
  done: boolean;
}

export const tasks: Task[] = [
  { id: "t1", titleAr: "متابعة عرض الشحن مع شركة أفق", titleEn: "Follow up freight quote with Ofuq", companyId: "tco", due: "11:00", priority: "high", done: false },
  { id: "t2", titleAr: "إرسال جدول التسليم لمسار", titleEn: "Send delivery schedule to Masar", companyId: "contractors", due: "12:30", priority: "high", done: false },
  { id: "t3", titleAr: "مراجعة مخططات رؤى الهندسي", titleEn: "Review Roaya drawings", companyId: "engineering", due: "13:00", priority: "medium", done: false },
  { id: "t4", titleAr: "تأكيد حجوزات فندق الواحة", titleEn: "Confirm Al Waha reservations", companyId: "hotels", due: "15:00", priority: "medium", done: false },
  { id: "t5", titleAr: "تحديث قائمة أسعار التوصيل", titleEn: "Update delivery price list", companyId: "delivery", due: "16:00", priority: "low", done: true },
  { id: "t6", titleAr: "الاتصال بوكالة أجنحة السفر", titleEn: "Call Ajniha Travel", companyId: "travel", due: "17:00", priority: "low", done: false },
];

export interface Employee {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  companyId: string;
  deals: number;
  revenue: number;
  target: number;
}

export const employees: Employee[] = [
  { id: "e1", nameAr: "سارة العتيبي", nameEn: "Sara Al-Otaibi", roleAr: "مبيعات أولى", roleEn: "Senior Sales", companyId: "tco", deals: 28, revenue: 186000, target: 200000 },
  { id: "e2", nameAr: "فهد القحطاني", nameEn: "Fahad Al-Qahtani", roleAr: "مدير حسابات", roleEn: "Account Manager", companyId: "contractors", deals: 17, revenue: 164000, target: 180000 },
  { id: "e3", nameAr: "نورة الشهري", nameEn: "Noura Al-Shehri", roleAr: "مبيعات", roleEn: "Sales", companyId: "transport", deals: 24, revenue: 121000, target: 150000 },
  { id: "e4", nameAr: "خالد الحربي", nameEn: "Khaled Al-Harbi", roleAr: "مبيعات", roleEn: "Sales", companyId: "express", deals: 19, revenue: 98000, target: 120000 },
  { id: "e5", nameAr: "لمى الزهراني", nameEn: "Lama Al-Zahrani", roleAr: "علاقات عملاء", roleEn: "Customer Relations", companyId: "hotels", deals: 15, revenue: 87000, target: 110000 },
  { id: "e6", nameAr: "عبدالله الدوسري", nameEn: "Abdullah Al-Dosari", roleAr: "مبيعات", roleEn: "Sales", companyId: "travel", deals: 21, revenue: 76000, target: 100000 },
  { id: "e7", nameAr: "هند العمري", nameEn: "Hind Al-Amri", roleAr: "مبيعات", roleEn: "Sales", companyId: "delivery", deals: 32, revenue: 64000, target: 80000 },
  { id: "e8", nameAr: "ماجد السبيعي", nameEn: "Majed Al-Subaie", roleAr: "مبيعات", roleEn: "Sales", companyId: "dom", deals: 11, revenue: 52000, target: 90000 },
];

export const journey = [
  { ar: "تعرّف", en: "Aware", count: 1245 },
  { ar: "تواصل", en: "Contact", count: 860 },
  { ar: "مهتم", en: "Interested", count: 342 },
  { ar: "عرض سعر", en: "Quote", count: 89 },
  { ar: "عميل", en: "Customer", count: 54 },
];

export const stageLabels: Record<Stage, { ar: string; en: string }> = {
  lead: { ar: "عميل محتمل", en: "Lead" },
  qualified: { ar: "مؤهل", en: "Qualified" },
  proposal: { ar: "عرض سعر", en: "Proposal" },
  won: { ar: "صفقة رابحة", en: "Won" },
  lost: { ar: "خسارة", en: "Lost" },
};

export function companyName(id: string, lang: "ar" | "en"): string {
  const company = companies.find((c) => c.id === id);
  return company ? company[lang] : id;
}
