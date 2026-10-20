import { siteAssets } from "./site-assets";
import type { ProductId } from "./product-catalogue";
import { ADD_ONS } from "./rules";

export type Language = "ar" | "en";
export type Branch = "riyadh" | "jazan" | "khobar";
export type BookingProduct = ProductId;
export type IconName = keyof typeof siteAssets.icons;
export type ImageName = keyof typeof siteAssets.images;

export const branches: Branch[] = ["khobar", "riyadh", "jazan"];

export function isBranch(value: string): value is Branch {
  return (branches as string[]).includes(value);
}

export const translations = {
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    packages: "الباقات",
    bookings: "حجوزاتي",
    profile: "الملف الشخصي",
    location: "الفرع",
    language: "English",
    welcomeEyebrow: "AlJoudi Wellness Spa · عناية واسترخاء",
    welcomeTitle: "لحظة هدوء... تبدأ من هنا",
    welcomeSubtitle: "العناية أقرب إليك",
    welcomeDescription: "اختاري فرعك، ودعي تجربة AlJoudi Wellness Spa تأتي إليك في راحة منزلك.",
    chooseBranch: "اختاري فرعك",
    chooseBranchHint: "اختاري الفرع الأقرب إليك",
    continue: "اكتشفي تجربة AlJoudi",
    homeEyebrow: "أهلاً بكِ في AlJoudi Wellness Spa",
    homeTitle: "لحظة عناية، في راحة منزلكِ",
    homeDescription: "اكتشفي جلسات العناية والباقات المناسبة لكِ.",
    exploreServices: "اكتشفي الخدمات",
    explorePackages: "تصفحي الباقات",
    bookSession: "احجزي جلستك",
    individualSessions: "الجلسات الفردية",
    individualDescription: "جلسات عناية متخصصة تلبي احتياجك.",
    completePackages: "باقات متكاملة",
    packagesDescription: "تجربة عناية متجددة، على وقتك.",
    servicesEyebrow: "اختاري ما يناسبك",
    servicesTitle: "اختاري لحظة العناية المناسبة لكِ",
    individualTab: "الجلسات الفردية",
    packagesTab: "الباقات",
    serviceMassage: "مساج استرخائي للجسم بالكامل",
    serviceSkin: "عناية مرطبة للوجه",
    serviceFoot: "جلسة عناية بالأقدام",
    serviceHospitality: "ضيافة وعناية مكملة",
    individualSession: "جلسة فردية",
    ninetyMinutes: "90 دقيقة",
    unknownSessions: "__ جلسات",
    unknownValidity: "يُحدد لاحقاً",
    priceLater: "السعر يُحدد لاحقاً",
    details: "عرض التفاصيل",
    sessions: "جلسات",
    quietPackage: "باقة الهدوء",
    relaxationPackage: "باقة الاسترخاء الشامل",
    packageEyebrow: "لحظات عناية، اختيرت لكِ",
    packageDescription:
      "استرخاء عميق وتجديد متكامل يجمع بين لمسات علاجية مختارة بعناية لإعادة التوازن للجسم والذهن.",
    includedServices: "الخدمات التي تشملها",
    productDetails: "تفاصيل المنتج",
    sessionCount: "عدد الجلسات",
    sessionDuration: "مدة الجلسة",
    packageValidity: "صلاحية الباقة",
    price: "السعر",
    sessionsThree: "3 جلسات",
    sixtyMinutes: "60 دقيقة",
    thirtyDays: "30 يوماً",
    packageNotice:
      "يشترط حجز موعد الجلسة الأولى عند شراء الباقة. جميع جلسات الباقة تُقدَّم بواسطة الأخصائية المختارة.",
    bookPackage: "احجزي الباقة",
    bookingEyebrow: "خطوة أقرب إلى راحتك",
    bookingTitle: "اختاري أخصائيتك وموعدك",
    visitDetails: "بيانات الزيارة",
    specialistAndDate: "الأخصائية والموعد",
    bookingSummaryTitle: "ملخص الحجز",
    chooseSpecialist: "اختاري أخصائيتك",
    specialistSara: "الأخصائية سارة",
    specialistNoura: "الأخصائية نورة",
    specialistMaryam: "الأخصائية مريم",
    chooseDate: "اختاري التاريخ",
    chooseTime: "اختاري الوقت المتاح",
    appointmentTime: "موعد الجلسة الأولى",
    packageLabel: "الباقة",
    specialistLabel: "الأخصائية",
    appointmentLabel: "الموعد",
    appointmentCategory: "عناية واسترخاء",
    durationNinety: "90 دقيقة",
    payment: "الدفع",
    category: "نوع الجلسة",
    secure: "بياناتكِ آمنة ومشفرة",
    timezone: "جميع المواعيد بتوقيت الرياض (GMT+3)",
    continueBooking: "متابعة",
    bookingReady:
      "تم حفظ اختياراتك لهذه الجلسة. أكّدي الحجز بعد ربط بوابة الدفع.",
    branchHint: "العناية أقرب إليكِ في",
    footerLine: "عناية هادئة، أينما كنتِ.",
    homeImageAlt: "جلسة عناية واسترخاء في راحة المنزل",
    individualImageAlt: "أخصائية تقدّم جلسة مساج فردية",
    packagesImageAlt: "تجهيزات باقات العناية والاسترخاء",
    logoAlt: "شعار AlJoudi Wellness Spa",
    noDate: "اختاري تاريخاً متاحاً",
    weekdays: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    branches: {
      riyadh: "الرياض",
      jazan: "جازان",
      khobar: "الخبر",
    },
  },
  en: {
    home: "Home",
    services: "Treatments",
    packages: "Packages",
    bookings: "My bookings",
    profile: "Profile",
    location: "Branch",
    language: "العربية",
    welcomeEyebrow: "ALJOUDI WELLNESS SPA · CARE & WELLNESS",
    welcomeTitle: "A moment of calm begins here",
    welcomeSubtitle: "Care, closer to you",
    welcomeDescription:
      "Choose your branch and let the AlJoudi Wellness Spa experience come to you, in the comfort of your home.",
    chooseBranch: "Choose your branch",
    chooseBranchHint: "Choose the branch closest to you",
    continue: "Discover the AlJoudi experience",
    homeEyebrow: "WELCOME TO ALJOUDI WELLNESS SPA",
    homeTitle: "A moment of care, in the comfort of home",
    homeDescription:
      "Discover thoughtfully chosen treatments and packages, made to fit your needs.",
    exploreServices: "Explore treatments",
    explorePackages: "Browse packages",
    bookSession: "Book your session",
    individualSessions: "Individual sessions",
    individualDescription: "Personalised care, thoughtfully tailored to you.",
    completePackages: "Complete care packages",
    packagesDescription: "A renewed care experience, on your time.",
    servicesEyebrow: "FIND YOUR MOMENT",
    servicesTitle: "Choose the care that feels right",
    individualTab: "Individual sessions",
    packagesTab: "Packages",
    serviceMassage: "Full-body relaxation massage",
    serviceSkin: "Hydrating facial treatment",
    serviceFoot: "Foot care session",
    serviceHospitality: "A thoughtful finishing touch",
    individualSession: "Individual session",
    ninetyMinutes: "90 minutes",
    unknownSessions: "__ sessions",
    unknownValidity: "To be confirmed",
    priceLater: "Price to be confirmed",
    details: "View details",
    sessions: "sessions",
    quietPackage: "The Quiet Package",
    relaxationPackage: "Complete Relaxation Package",
    packageEyebrow: "A collection of moments, chosen for you",
    packageDescription:
      "Deep relaxation and complete renewal, with carefully chosen therapeutic touches to restore balance to body and mind.",
    includedServices: "What's included",
    productDetails: "Product details",
    sessionCount: "Sessions",
    sessionDuration: "Session length",
    packageValidity: "Package validity",
    price: "Price",
    sessionsThree: "3 sessions",
    sixtyMinutes: "60 minutes",
    thirtyDays: "30 days",
    packageNotice:
      "The first session must be booked when purchasing the package. All sessions are provided by your selected specialist.",
    bookPackage: "Book this package",
    bookingEyebrow: "One step closer to unwinding",
    bookingTitle: "Choose your specialist and appointment",
    visitDetails: "Visit details",
    specialistAndDate: "Specialist & appointment",
    bookingSummaryTitle: "Booking summary",
    chooseSpecialist: "Choose your specialist",
    specialistSara: "Specialist Sara",
    specialistNoura: "Specialist Noura",
    specialistMaryam: "Specialist Maryam",
    chooseDate: "Choose a date",
    chooseTime: "Choose an available time",
    appointmentTime: "First session",
    packageLabel: "Package",
    specialistLabel: "Specialist",
    appointmentLabel: "Appointment",
    appointmentCategory: "Care & relaxation",
    durationNinety: "90 minutes",
    payment: "Payment",
    category: "Session type",
    secure: "Your details are safe and encrypted",
    timezone: "All appointments use Riyadh time (GMT+3)",
    continueBooking: "Continue",
    bookingReady:
      "Your session selections are ready. Connect a payment provider to confirm your booking.",
    branchHint: "Thoughtful care in",
    footerLine: "A quieter kind of care, wherever you are.",
    homeImageAlt: "A relaxing care session in the comfort of home",
    individualImageAlt: "A specialist giving an individual massage session",
    packagesImageAlt: "Care and relaxation package setup",
    logoAlt: "AlJoudi Wellness Spa logo",
    noDate: "Choose an available date",
    weekdays: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    branches: {
      riyadh: "Riyadh",
      jazan: "Jazan",
      khobar: "Khobar",
    },
  },
} as const;

export const landingCopy = {
  ar: {
    aboutNav: "عن AlJoudi Wellness Spa",
    faqNav: "الأسئلة الشائعة",
    contactNav: "تواصل معنا",
    heroSlogan: "جودي كل الجود لك",
    heroTitle: "لحظة العناية تبدأ من هنا",
    heroDescription: "اختاري فرعكِ، واكتشفي الجلسات والباقات المتاحة لكِ.",
    heroTagline: "العناية والرفاهية، في راحة منزلكِ",
    heroAction: "ابدأي رحلتك ",
    branchNames: { riyadh: "RIYADH", jazan: "JAZAN", khobar: "AL KHOBAR" },
    aboutEyebrow: "عن AlJoudi Wellness Spa",
    aboutTitle: "مساحة من الهدوء، تأتي إليكِ",
    aboutParagraphs: [
      "AlJoudi Wellness Spa تجربة عناية ورفاهية منزلية، تمنحكِ مساحة تستعيدين فيها هدوءكِ وتوازنكِ، دون أن تغادري المكان الذي ترتاحين فيه.",
      "نؤمن أن العناية بالنفس ليست تفصيلًا مؤجلًا؛ بل وقتٌ تستحقينه. من اختيار جلستكِ إلى موعد زيارتكِ، تبدأ التجربة بكِ وبما يناسب يومكِ.",
    ],
    aboutImageAlt: "تفاصيل من هوية AlJoudi Wellness Spa والعناية المنزلية",
    experienceEyebrow: "تجربة AlJoudi",
    experienceTitle: "العناية في التفاصيل",
    experienceItems: [
      ["في راحة منزلكِ", "مساحتكِ المألوفة تصبح مكانًا للحظة عناية وهدوء."],
      ["بما يناسب يومكِ", "اختاري من المواعيد المتاحة، وامنحي نفسكِ الوقت الذي تحتاجينه."],
      ["على إيقاعكِ", "جلسة فردية للحظتكِ، أو باقة تجعل العناية جزءًا من روتينكِ."],
    ],
    storyTitle: "امنحي نفسكِ وقتًا… ودعي الباقي علينا",
    storyDescription: "لحظات من العناية، وقليل من الهدوء، ومساحة لكِ وحدكِ.",
    journeyEyebrow: "من اختياركِ إلى زيارتكِ",
    journeyTitle: "رحلتكِ مع AlJoudi",
    journeyDescription: "خطوات بسيطة تقرّبكِ من لحظة العناية التي تستحقينها.",
    journeyItems: [
      ["اختاري الفرع", "ابدئي بالفرع الذي يقدّم الخدمة في مدينتكِ."],
      ["اكتشفي جلستكِ", "اختاري الخدمة أو الباقة المناسبة لكِ."],
      ["حدّدي موعدكِ", "اختاري الأخصائية والموعد المتاح وعنوان الزيارة."],
      ["أكّدي حجزكِ", "أكملي الدفع، واستعدّي للحظة راحتكِ."],
    ],
    faqEyebrow: "قبل لحظة العناية",
    faqTitle: "أسئلتكِ، بكل وضوح",
    faqDescription: "إجابات تساعدكِ على بدء تجربتكِ.",
    faqItems: [
      ["ما هو AlJoudi Wellness Spa؟", "AlJoudi Wellness Spa تقدّم جلسات عناية ورفاهية في المنزل. اختاري فرعكِ للتعرّف على الخدمات والباقات المتاحة."],
      ["كيف أبدأ الحجز؟", "من أعلى الصفحة اختاري الفرع، ثم الخدمة أو الباقة، والأخصائية والموعد المتاح. بعد إدخال عنوان الزيارة وإتمام الدفع يتم تأكيد الحجز."],
      ["أين تتوفر الخدمة؟", "تتوفر الخدمة في فروع الرياض وجازان والخبر. اختاري فرعكِ للتعرّف على الخدمات المتاحة."],
      ["هل أختار الأخصائية عند الحجز؟", "نعم، يمكنكِ اختيار الأخصائية والموعد المتاح أثناء الحجز."],
      ["كيف أشتري باقة جلسات؟", "اختاري الباقة والأخصائية، واحجزي موعد الجلسة الأولى قبل إتمام الشراء. جميع جلسات الباقة تكون مع الأخصائية المختارة نفسها."],
      ["كيف أحجز الجلسات التالية من الباقة؟", "من «باقاتي» يمكنكِ متابعة الجلسات وحجز الموعد التالي من مواعيد أخصائيتكِ المتاحة."],
    ],
    contactEyebrow: "يسعدنا نكون قريبين منكِ",
    contactTitle: "لديكِ استفسار؟",
    contactDescription: "نساعدكِ في التعرّف على التجربة واختيار ما يناسبكِ.",
    contactAction: "تواصلي معنا",
    chooseBranchAction: "اختاري فرعكِ",
    footerTagline: "AlJoudi Wellness Spa · العناية أقرب إليكِ",
    footerFollow: "تابعينا… وخلي العناية أقرب",
    footerCopyright: "AlJoudi Wellness Spa · جميع الحقوق محفوظة",
  },
  en: {
    aboutNav: "About AlJoudi",
    faqNav: "FAQs",
    contactNav: "Contact us",
    heroSlogan: "Joudi — all generosity, just for you",
    heroTitle: "Your moment of care starts here",
    heroDescription: "Choose your branch and explore the sessions and packages available to you.",
    heroTagline: "Care and wellness, in the comfort of home",
    heroAction: "start your journey",
    branchNames: { riyadh: "RIYADH", jazan: "JAZAN", khobar: "AL KHOBAR" },
    aboutEyebrow: "About AlJoudi",
    aboutTitle: "A space for calm, brought to you",
    aboutParagraphs: [
      "AlJoudi brings care and wellness to your home, giving you space to restore your calm and balance in the place where you feel most at ease.",
      "We believe self-care deserves a place in your day. From choosing your session to arranging your visit, the experience begins with you and what works for your routine.",
    ],
    aboutImageAlt: "A glimpse of AlJoudi's identity and at-home care",
    experienceEyebrow: "The AlJoudi experience",
    experienceTitle: "Care is in the details",
    experienceItems: [
      ["In the comfort of home", "Your familiar surroundings become a space for care and calm."],
      ["Around your day", "Choose an available appointment and give yourself the time you need."],
      ["At your own pace", "A single session just for you, or a package that makes care part of your routine."],
    ],
    storyTitle: "Make time for yourself… and leave the rest to us",
    storyDescription: "Moments of care, a little calm, and space just for you.",
    journeyEyebrow: "From your choice to your visit",
    journeyTitle: "Your journey with AlJoudi",
    journeyDescription: "A few simple steps to the moment of care you deserve.",
    journeyItems: [
      ["Choose your branch", "Start with the branch serving your city."],
      ["Find your session", "Choose the service or package that suits you."],
      ["Plan your visit", "Select your specialist, an available time, and your visit address."],
      ["Confirm your booking", "Complete payment and get ready for your moment of calm."],
    ],
    faqEyebrow: "Before your visit",
    faqTitle: "Your questions, clearly answered",
    faqDescription: "Answers to help you begin your experience.",
    faqItems: [
      ["What is AlJoudi Wellness Spa?", "AlJoudi Wellness Spa offers care and wellness sessions at home. Choose your branch to explore the available services and packages."],
      ["How do I book?", "Choose your branch, then a service or package, your specialist, and an available appointment. Add your visit address and complete payment to confirm your booking."],
      ["Where is the service available?", "Choose from our Riyadh, Jazan, and Al Khobar branches to see the services available in your area."],
      ["Can I choose my specialist?", "Yes. Choose your specialist and an available appointment while booking."],
      ["How do I purchase a package?", "Select a package and specialist, then book your first session before completing the purchase. All package sessions are with the same specialist."],
      ["How do I book the remaining package sessions?", "Use My Packages to track your sessions and book the next appointment from your specialist's available times."],
    ],
    contactEyebrow: "Here for you",
    contactTitle: "Have a question?",
    contactDescription: "We can help you discover the experience and choose what suits you.",
    contactAction: "Get in touch",
    chooseBranchAction: "Choose your branch",
    footerTagline: "AlJoudi Wellness Spa · Care, closer to you",
    footerFollow: "Follow us… and keep care close",
    footerCopyright: "AlJoudi Wellness Spa · All rights reserved",
  },
} as const;

/**
 * Social accounts shown in the landing footer.
 * TODO(client): replace the placeholder URLs with the real AlJoudi accounts.
 */
export const SOCIAL_LINKS = [
  { id: "snapchat", label: { ar: "سناب شات", en: "Snapchat" }, href: "https://www.snapchat.com/add/aljoudi_spa" },
  { id: "tiktok", label: { ar: "تيك توك", en: "TikTok" }, href: "https://www.tiktok.com/@aljoudi_spa" },
  { id: "instagram", label: { ar: "إنستجرام", en: "Instagram" }, href: "https://www.instagram.com/aljoudi_spa" },
] as const;

export const journeyCopy = {
  ar: {
    imagePlaceholder: "أضيفي الصورة هنا",
    branchesCrumb: "الفروع / تغيير الفرع",
    categoryTitle: "لحظة عنايتكِ في",
    categoryDescription: "اختاري جلستكِ أو باقتكِ، وحدّدي الأخصائية والموعد المناسب لكِ.",
    homeService: "خدمة منزلية",
    previewNotice:
      "الأخصائيات والمواعيد في هذه المعاينة تجريبية. لا يتم إرسال بياناتكِ أو خصم أي مبلغ.",
    addOnsTitle: "إضافات AlJoudi Wellness Spa",
    addOnsDescription:
      "لأن كل تفصيلة تصنع فرقًا في تجربتكِ، أضفنا لكِ خيارات مميزة تمنحكِ المزيد من العناية والدلال، لتصممي تجربتكِ بالطريقة التي تحبينها.",
    addOns: [
      "مساج الرأس للاسترخاء: لحظات من الهدوء تساعدكِ على تخفيف التوتر والاستمتاع بالاسترخاء.",
      "مساج الوجه بالقواشا: عناية لطيفة للوجه باستخدام أداة القواشا وزيت مخصص.",
      "إضافة تهنئة عيد الميلاد: بالون وبطاقة تهنئة ووردة.",
    ],
    addOnPrice:
      "سعر الإضافة الواحدة ٣٥ ريالًا. مدة إضافات المساج ٢٠ دقيقة، أما تهنئة عيد الميلاد فهي إضافة احتفالية دون مدة مساج. تضاف قيمتها إلى سعر الجلسة الأساسية.",
    careGuidanceTitle: "إرشادات قبل الجلسة وبعدها",
    beforeSession: "قبل الجلسة",
    afterSession: "بعد الجلسة",
    beforeCare: [
      "يفضل أن تكون آخر وجبة قبل الجلسة بساعة إلى ساعتين، مع تجنب الوجبات الثقيلة أو الدسمة.",
      "ينصح بشرب كمية مناسبة من الماء، مع تجنب الإفراط في تناول الكافيين.",
      "يرجى إبلاغ الأخصائية عن أي إصابة، أو ألم شديد، أو حساسية، أو حمل، أو عملية جراحية حديثة، أو حالة صحية تستدعي التنبيه.",
      "يرجى تجهيز مساحة مناسبة وهادئة تتيح تقديم الخدمة بكل راحة وخصوصية.",
    ],
    afterCare: [
      "يفضل الانتظار مدة تصل إلى ٦ ساعات قبل الاستحمام، خصوصًا بعد جلسات الزيوت، لمنح البشرة وقتًا للاستفادة منها.",
      "ينصح بشرب الماء والمحافظة على ترطيب الجسم.",
      "يفضل تجنب التمارين الشديدة والمجهود البدني مباشرة بعد الجلسة.",
      "خذي وقتًا كافيًا للراحة والاسترخاء بعد انتهاء الجلسة.",
    ],
    viewDetails: "عرض التفاصيل",
    bookFirst: "احجزي موعدكِ الأول",
    bookVisit: "احجزي زيارتكِ",
    bookNow: "احجزي الآن",
  },
  en: {
    imagePlaceholder: "Add your image here",
    branchesCrumb: "Branches / change branch",
    categoryTitle: "Your moment of care in",
    categoryDescription: "Choose a session or package, then select your specialist and appointment.",
    homeService: "At-home care",
    previewNotice:
      "Specialists and appointments in this preview are illustrative. Your details are not sent and no payment is taken.",
    addOnsTitle: "AlJoudi Wellness Spa add-ons",
    addOnsDescription:
      "Every detail shapes your experience. Choose a personal touch of extra care and pampering.",
    addOns: [
      "Relaxing head massage: quiet moments to help ease tension and enjoy relaxation.",
      "Gua sha face massage: gentle facial care using a gua sha tool and a dedicated oil.",
      "Birthday greeting: a balloon, greeting card and flower.",
    ],
    addOnPrice:
      "Each add-on costs SAR 35. Massage add-ons last 20 minutes; the birthday greeting is a celebration extra without a massage duration. The cost is added to the base session price.",
    careGuidanceTitle: "Before and after your session",
    beforeSession: "Before your session",
    afterSession: "After your session",
    beforeCare: [
      "Preferably have your last meal one to two hours before the session and avoid heavy or fatty meals.",
      "Drink an appropriate amount of water and avoid excessive caffeine.",
      "Tell your specialist about any injury, severe pain, allergy, pregnancy, recent surgery or health condition that needs attention.",
      "Prepare a suitable quiet space where the service can be provided comfortably and privately.",
    ],
    afterCare: [
      "Preferably wait up to six hours before showering, especially after an oil session, to allow time for the skin to benefit.",
      "Drink water and stay hydrated.",
      "Avoid intense exercise and physical exertion immediately after the session.",
      "Allow enough time to rest and relax after your session.",
    ],
    viewDetails: "View details",
    bookFirst: "Book your first session",
    bookVisit: "Book your visit",
    bookNow: "Book now",
  },
} as const;

/** Short add-on names ("Relaxing head massage"), in the same order as ADD_ONS. */
export function addOnNames(language: Language): string[] {
  return journeyCopy[language].addOns.map((item) => item.split(/[:：]/)[0].trim());
}

export function addOnLabels(ids: readonly string[], language: Language): string {
  const names = addOnNames(language);
  return ADD_ONS.map((item, index) => (ids.includes(item.id) ? names[index] : ""))
    .filter(Boolean)
    .join(language === "ar" ? "، " : ", ");
}

export const languageListeners = new Set<() => void>();

export function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem("joud-language") === "en" ? "en" : "ar";
}

export function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveLanguage(language: Language) {
  window.localStorage.setItem("joud-language", language);
  languageListeners.forEach((listener) => listener());
}
