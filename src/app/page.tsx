"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { productCatalogue, type ProductId } from "./product-catalogue";
import { siteAssets } from "./site-assets";

type Language = "ar" | "en";
type Branch = "riyadh" | "jazan" | "khobar";
type Screen = "welcome" | "home" | "services" | "service" | "package" | "booking";
type ServiceTab = "individual" | "packages";
type BookingProduct = ProductId;
type IconName = keyof typeof siteAssets.icons;
type ImageName = keyof typeof siteAssets.images;

const translations = {
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    packages: "الباقات",
    bookings: "حجوزاتي",
    profile: "الملف الشخصي",
    profileUnavailable: "لا يتوفر مسار للملف الشخصي حالياً",
    location: "الفرع",
    language: "English",
    welcomeEyebrow: "جود سبا · عناية واسترخاء",
    welcomeTitle: "لحظة هدوء... تبدأ من هنا",
    welcomeSubtitle: "العناية أقرب إليك",
    welcomeDescription: "اختاري فرعك، ودعي تجربة جود سبا تأتي إليك في راحة منزلك.",
    chooseBranch: "اختاري فرعك",
    chooseBranchHint: "اختاري الفرع الأقرب إليك",
    continue: "اكتشفي تجربة جود",
    homeEyebrow: "أهلاً بكِ في جود سبا",
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
    photoPlaceholder: "أضيفي الصورة هنا",
    logoAlt: "شعار جود سبا",
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
    profileUnavailable: "The profile page is not available yet",
    location: "Branch",
    language: "العربية",
    welcomeEyebrow: "JOUD SPA · CARE & WELLNESS",
    welcomeTitle: "A moment of calm begins here",
    welcomeSubtitle: "Care, closer to you",
    welcomeDescription:
      "Choose your branch and let the Joud Spa experience come to you, in the comfort of your home.",
    chooseBranch: "Choose your branch",
    chooseBranchHint: "Choose the branch closest to you",
    continue: "Discover the Joud experience",
    homeEyebrow: "WELCOME TO JOUD SPA",
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
    photoPlaceholder: "Add your photo here",
    logoAlt: "Joud Spa logo",
    noDate: "Choose an available date",
    weekdays: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    branches: {
      riyadh: "Riyadh",
      jazan: "Jazan",
      khobar: "Khobar",
    },
  },
} as const;

const landingCopy = {
  ar: {
    aboutNav: "عن الجودي سبا",
    faqNav: "الأسئلة الشائعة",
    contactNav: "تواصل معنا",
    heroTitle: "لحظة العناية تبدأ من هنا",
    heroDescription: "اختاري فرعكِ، واكتشفي الجلسات والباقات المتاحة لكِ.",
    heroTagline: "العناية والرفاهية، في راحة منزلكِ",
    heroAction: "تعرّفي على الجودي سبا",
    branchNames: { riyadh: "RIYADH", jazan: "JAZAN", khobar: "AL KHOBAR" },
    aboutEyebrow: "عن الجودي سبا",
    aboutTitle: "مساحة من الهدوء، تأتي إليكِ",
    aboutParagraphs: [
      "الجودي سبا تجربة عناية ورفاهية منزلية، تمنحكِ مساحة تستعيدين فيها هدوءكِ وتوازنكِ، دون أن تغادري المكان الذي ترتاحين فيه.",
      "نؤمن أن العناية بالنفس ليست تفصيلًا مؤجلًا؛ بل وقتٌ تستحقينه. من اختيار جلستكِ إلى موعد زيارتكِ، تبدأ التجربة بكِ وبما يناسب يومكِ.",
    ],
    aboutImageAlt: "تفاصيل من هوية الجودي سبا والعناية المنزلية",
    experienceEyebrow: "تجربة الجودي",
    experienceTitle: "العناية في التفاصيل",
    experienceItems: [
      ["في راحة منزلكِ", "مساحتكِ المألوفة تصبح مكانًا للحظة عناية وهدوء."],
      ["بما يناسب يومكِ", "اختاري من المواعيد المتاحة، وامنحي نفسكِ الوقت الذي تحتاجينه."],
      ["على إيقاعكِ", "جلسة فردية للحظتكِ، أو باقة تجعل العناية جزءًا من روتينكِ."],
    ],
    storyTitle: "امنحي نفسكِ وقتًا… ودعي الباقي علينا",
    storyDescription: "لحظات من العناية، وقليل من الهدوء، ومساحة لكِ وحدكِ.",
    journeyEyebrow: "من اختياركِ إلى زيارتكِ",
    journeyTitle: "رحلتكِ مع الجودي",
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
      ["ما هي الجودي سبا؟", "الجودي سبا تقدّم جلسات عناية ورفاهية في المنزل. اختاري فرعكِ للتعرّف على الخدمات والباقات المتاحة."],
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
    footerTagline: "الجودي سبا · العناية أقرب إليكِ",
    footerFollow: "تابعينا… وخلي العناية أقرب",
    socialLinks: ["سناب شات", "تيك توك", "إنستجرام"],
    footerCopyright: "الجودي سبا · جميع الحقوق محفوظة",
  },
  en: {
    aboutNav: "About AlJoudi",
    faqNav: "FAQs",
    contactNav: "Contact us",
    heroTitle: "Your moment of care starts here",
    heroDescription: "Choose your branch and explore the sessions and packages available to you.",
    heroTagline: "Care and wellness, in the comfort of home",
    heroAction: "Discover AlJoudi",
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
      ["What is AlJoudi Spa?", "AlJoudi Spa offers care and wellness sessions at home. Choose your branch to explore the available services and packages."],
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
    footerTagline: "AlJoudi Spa · Care, closer to you",
    footerFollow: "Follow us… and keep care close",
    socialLinks: ["Snapchat", "TikTok", "Instagram"],
    footerCopyright: "AlJoudi Spa · All rights reserved",
  },
} as const;

const journeyCopy = {
  ar: {
    imagePlaceholder: "أضيفي الصورة هنا",
    branchesCrumb: "الفروع / تغيير الفرع",
    categoryTitle: "لحظة عنايتكِ في",
    categoryDescription: "اختاري جلستكِ أو باقتكِ، وحدّدي الأخصائية والموعد المناسب لكِ.",
    homeService: "خدمة منزلية",
    previewNotice:
      "الأخصائيات والمواعيد في هذه المعاينة تجريبية. لا يتم إرسال بياناتكِ أو خصم أي مبلغ.",
    addOnsTitle: "إضافات الجودي سبا",
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
    addOnsTitle: "AlJoudi Spa add-ons",
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
    bookNow: "Book now",
  },
} as const;

const languageListeners = new Set<() => void>();

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem("joud-language") === "en" ? "en" : "ar";
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function saveLanguage(language: Language) {
  window.localStorage.setItem("joud-language", language);
  languageListeners.forEach((listener) => listener());
}

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const source = siteAssets.icons[name];

  if (source) {
    return (
      <Image
        className={`icon ${className}`}
        src={source}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
      />
    );
  }

  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 10h11m-4-4 4 4-4 4" />,
    calendar: (
      <>
        <rect x="3" y="5" width="14" height="12" rx="1" />
        <path d="M6.5 3v4M13.5 3v4M3 9h14" />
      </>
    ),
    cart: (
      <>
        <path d="M2.5 3h2l1.8 9.2h8.9l2-6.2H5.2" />
        <circle cx="7.5" cy="16" r="1.2" />
        <circle cx="14" cy="16" r="1.2" />
      </>
    ),
    check: <path d="m4 10 4 4 8-8" />,
    clock: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l3 2" />
      </>
    ),
    globe: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M3 10h14M10 3a11 11 0 0 1 0 14M10 3a11 11 0 0 0 0 14" />
      </>
    ),
    home: <path d="m3 9 7-6 7 6v8H5V9m3 8v-5h4v5" />,
    location: (
      <>
        <path d="M10 17s5-4.7 5-8.5a5 5 0 1 0-10 0C5 12.3 10 17 10 17Z" />
        <circle cx="10" cy="8.5" r="1.5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="9" width="12" height="9" rx="1.5" />
        <path d="M7 9V6a3 3 0 0 1 6 0v3m-3 4v2" />
      </>
    ),
    packages: (
      <>
        <path d="m10 2 7 4v8l-7 4-7-4V6l7-4Z" />
        <path d="m3 6 7 4 7-4m-7 4v8" />
      </>
    ),
    services: (
      <>
        <path d="M4 16c2-1 3-3 3-6 0-2 1-4 3-4s3 2 3 4c0 3 1 5 3 6M3 18h14M8 3c0 1 .8 2 2 2s2-1 2-2" />
      </>
    ),
    user: (
      <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c.5-3 2.5-4.5 6-4.5s5.5 1.5 6 4.5" />
      </>
    ),
  };

  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      >
        {paths[name]}
      </g>
    </svg>
  );
}

function ImagePlaceholder({
  name,
  label,
  className = "",
  placeholderOnly = false,
}: {
  name: ImageName;
  label: string;
  className?: string;
  placeholderOnly?: boolean;
}) {
  const source = siteAssets.images[name];
  const isIconArtwork = name === "serviceSkin" || name === "serviceFoot";

  return (
    <div
      className={`image-frame${isIconArtwork ? " icon-art-frame" : ""} ${className}`}
      style={name === "welcome" ? { position: "absolute", inset: 0 } : undefined}
    >
      {source && !placeholderOnly ? (
        <Image
          className={`frame-image${isIconArtwork ? " frame-icon-art" : ""}`}
          src={source}
          alt={isIconArtwork ? "" : label}
          aria-hidden={isIconArtwork ? true : undefined}
          fill
          sizes={
            name === "home"
              ? "100vw"
              : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 40vw"
          }
        />
      ) : (
        <div
          className={`image-placeholder${placeholderOnly ? " reference-image-placeholder" : ""}`}
          role="img"
          aria-label={label}
        >
          {!placeholderOnly && (
            <>
              <span className="placeholder-orb" />
              <span className="placeholder-leaf placeholder-leaf-one" />
              <span className="placeholder-leaf placeholder-leaf-two" />
            </>
          )}
          {placeholderOnly && <span className="reference-placeholder-mark" aria-hidden="true">+</span>}
          <span className="placeholder-label">{label}</span>
        </div>
      )}
    </div>
  );
}

function Brand({
  language,
  onClick,
}: {
  language: Language;
  onClick: () => void;
}) {
  const isArabic = language === "ar";

  return (
    <button className="brand" type="button" onClick={onClick}>
      {siteAssets.logo ? (
        <Image
          className="brand-logo-image"
          src={siteAssets.logo}
          alt={translations[language].logoAlt}
          width={164}
          height={112}
        />
      ) : (
        <>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="brand-name">{isArabic ? "جود" : "Joud"}</span>
          <span className="brand-caption">SPA · WELLNESS</span>
        </>
      )}
    </button>
  );
}

function JourneyBreadcrumbs({
  language,
  branch,
  productName,
  onBranchList,
  onCatalogue,
}: {
  language: Language;
  branch: Branch;
  productName?: string;
  onBranchList: () => void;
  onCatalogue: () => void;
}) {
  const copy = journeyCopy[language];
  const text = translations[language];

  return (
    <nav className="journey-breadcrumb" aria-label={language === "ar" ? "مسار الصفحة" : "Breadcrumb"}>
      <button type="button" onClick={onBranchList}>{copy.branchesCrumb}</button>
      <span aria-hidden="true">/</span>
      <button type="button" onClick={onCatalogue}>{text.branches[branch]}</button>
      {productName && (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{productName}</span>
        </>
      )}
    </nav>
  );
}

function ProductCareInfo({ language }: { language: Language }) {
  const copy = journeyCopy[language];

  return (
    <div className="product-care-info">
      <details>
        <summary>{copy.addOnsTitle}</summary>
        <p>{copy.addOnsDescription}</p>
        <ul>
          {copy.addOns.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>{copy.addOnPrice}</p>
      </details>
      <details>
        <summary>{copy.careGuidanceTitle}</summary>
        <h3>{copy.beforeSession}</h3>
        <ul>
          {copy.beforeCare.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h3>{copy.afterSession}</h3>
        <ul>
          {copy.afterCare.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </details>
    </div>
  );
}

function LandingPage({
  language,
  branch,
  onBranchChange,
  onContinue,
  onLanguageChange,
}: {
  language: Language;
  branch: Branch;
  onBranchChange: (branch: Branch) => void;
  onContinue: () => void;
  onLanguageChange: () => void;
}) {
  const copy = landingCopy[language];
  const text = translations[language];
  const isArabic = language === "ar";
  const landingBranches: Branch[] = ["khobar", "riyadh", "jazan"];

  return (
    <div className="landing-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="landing-hero" id="landing-top">
        <Image
          className="landing-hero-image"
          src="/welcome-canva.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="landing-hero-wash" aria-hidden="true" />
        <header className="landing-header">
          <button
            className="landing-language"
            type="button"
            onClick={onLanguageChange}
            aria-label={isArabic ? "Switch language to English" : "تغيير اللغة إلى العربية"}
          >
            {text.language}
          </button>
          <nav
            className="landing-nav"
            dir={isArabic ? "rtl" : "ltr"}
            aria-label={isArabic ? "القائمة الرئيسية" : "Main navigation"}
          >
            <a href="#landing-about">{copy.aboutNav}</a>
            <a href="#landing-faq">{copy.faqNav}</a>
            <a href="#landing-contact">{copy.contactNav}</a>
            <button
              className="landing-profile-unavailable"
              type="button"
              disabled
              title={text.profileUnavailable}
            >
              {text.profile}
            </button>
          </nav>
          <a className="landing-brand" href="#landing-top" aria-label={text.logoAlt}>
            <Image
              src="/aljoudi-brand-reference.svg"
              alt={text.logoAlt}
              width={590}
              height={420}
              priority
            />
          </a>
        </header>

        <div className="landing-hero-content">
          <Image
            className="landing-hero-wordmark"
            src="/aljoudi-brand-reference.svg"
            alt={text.logoAlt}
            width={590}
            height={420}
          />
          <h1>{copy.heroTitle}</h1>
          <p className="landing-hero-description">{copy.heroDescription}</p>
          <div className="landing-branch-grid" role="group" aria-label={text.chooseBranch}>
            {landingBranches.map((item) => (
              <button
                className={`landing-branch${branch === item ? " selected" : ""}`}
                key={item}
                type="button"
                aria-pressed={branch === item}
                onClick={() => onBranchChange(item)}
              >
                <span>{text.branches[item]}</span>
                <small>{copy.branchNames[item]}</small>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          <p className="landing-hero-tagline">{copy.heroTagline}</p>
          <button className="landing-discover" type="button" onClick={onContinue}>
            {copy.heroAction}
            <Icon name="arrow" />
          </button>
        </div>
      </section>

      <section className="landing-about" id="landing-about">
        <div className="landing-section-inner landing-about-layout">
          <div className="landing-about-copy">
            <p className="landing-eyebrow">{copy.aboutEyebrow}</p>
            <h2>{copy.aboutTitle}</h2>
            {copy.aboutParagraphs.map((paragraph) => (
              <p className="landing-body-copy" key={paragraph}>{paragraph}</p>
            ))}
            <span className="landing-signature">Where Wellness Comes Home</span>
          </div>
          <div className="landing-about-photo">
            <Image
              src="/aljoudi-about-reference.jpg"
              alt={copy.aboutImageAlt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="landing-experience">
        <div className="landing-section-inner">
          <div className="landing-centered-heading">
            <p className="landing-eyebrow">{copy.experienceEyebrow}</p>
            <h2>{copy.experienceTitle}</h2>
          </div>
          <div className="landing-experience-grid">
            {copy.experienceItems.map(([title, description], index) => (
              <article className="landing-experience-card" key={title}>
                <span className="landing-experience-icon" aria-hidden="true">
                  <Icon name={index === 0 ? "home" : index === 1 ? "calendar" : "clock"} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-story">
        <Image
          className="landing-story-image"
          src="/home-hero-canva.png"
          alt=""
          fill
          sizes="100vw"
        />
        <div className="landing-story-shade" aria-hidden="true" />
        <div className="landing-story-content">
          <Image
            src="/aljoudi-brand-reference.svg"
            alt={text.logoAlt}
            width={590}
            height={420}
          />
          <h2>{copy.storyTitle}</h2>
          <p>{copy.storyDescription}</p>
        </div>
      </section>

      <section className="landing-journey">
        <div className="landing-section-inner">
          <div className="landing-journey-heading">
            <div>
              <p className="landing-eyebrow">{copy.journeyEyebrow}</p>
              <h2>{copy.journeyTitle}</h2>
            </div>
            <p>{copy.journeyDescription}</p>
          </div>
          <div className="landing-journey-grid">
            {copy.journeyItems.map(([title, description], index) => (
              <article className="landing-journey-step" key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-faq" id="landing-faq">
        <div className="landing-section-inner landing-faq-layout">
          <div className="landing-faq-heading">
            <p className="landing-eyebrow">{copy.faqEyebrow}</p>
            <h2>{copy.faqTitle}</h2>
            <p>{copy.faqDescription}</p>
          </div>
          <div className="landing-faq-list">
            {copy.faqItems.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-contact" id="landing-contact">
        <p className="landing-eyebrow">{copy.contactEyebrow}</p>
        <h2>{copy.contactTitle}</h2>
        <p>{copy.contactDescription}</p>
        <div className="landing-contact-actions">
          <a href="#landing-contact" className="landing-contact-primary">{copy.contactAction}</a>
          <button type="button" onClick={onContinue}>
            {copy.chooseBranchAction}
            <Icon name="arrow" />
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <a href="#landing-top" aria-label={text.logoAlt}>
              <Image
                src="/aljoudi-brand-reference.svg"
                alt={text.logoAlt}
                width={590}
                height={420}
              />
            </a>
            <p>{copy.footerTagline}</p>
          </div>
          <nav className="landing-footer-nav" aria-label={isArabic ? "روابط الصفحة" : "Page links"}>
            <a href="#landing-about">{copy.aboutNav}</a>
            <a href="#landing-faq">{copy.faqNav}</a>
            <a href="#landing-contact">{copy.contactNav}</a>
            <button type="button" onClick={onContinue}>{isArabic ? "ابدئي الحجز" : "Start booking"}</button>
          </nav>
          <div className="landing-social">
            <h3>{copy.footerFollow}</h3>
            <div>
              {copy.socialLinks.map((link) => <span key={link}>{link}</span>)}
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>{copy.footerCopyright}</span>
          <span>{text.branches.khobar} · {text.branches.riyadh} · {text.branches.jazan}</span>
        </div>
      </footer>
    </div>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPrice(price: number, language: Language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Home() {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguageSnapshot,
    () => "ar",
  );
  const [screen, setScreen] = useState<Screen>("welcome");
  const [branch, setBranch] = useState<Branch>("riyadh");
  const [serviceTab, setServiceTab] = useState<ServiceTab>("individual");
  const [specialist, setSpecialist] = useState("sara");
  const [bookingProduct, setBookingProduct] = useState<BookingProduct>("calm-package");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [bookingReady, setBookingReady] = useState(false);
  const text = translations[language];
  const isArabic = language === "ar";
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(isArabic ? "ar-SA" : "en").format(value);
  const productEntries = productCatalogue.map((product) => {
    const count = product.pendingTypes
      ? `${formatNumber(product.sessions)} ${text.sessions}`
      : product.repeat
        ? product.group
          ? isArabic
            ? `${formatNumber(product.sessions)} مواعيد للزوجين`
            : `${formatNumber(product.sessions)} couples appointments`
          : `${formatNumber(product.sessions)} ${text.sessions}`
        : product.group
          ? product.id === "friends"
            ? isArabic
              ? "٣ صديقات · قابلة للإضافة"
              : "3 friends · extra guests available"
            : isArabic
              ? "شخصان في موعد واحد"
              : "Two guests in one booking"
          : text.individualSession;
    const duration = product.pendingTypes
      ? isArabic
        ? "حسب نوع المساج المختار"
        : "Depends on the selected massage"
      : `${formatNumber(product.minutes)} ${isArabic ? "دقيقة" : "minutes"}${product.group ? (isArabic ? " لكل شخص" : " per guest") : ""}`;

    return {
      ...product,
      title: product.name[language],
      description: product.description[language],
      facts: product.facts[language],
      count,
      duration,
      priceLabel: formatPrice(product.price, language),
    };
  });
  const availableProducts = productEntries.filter(
    (product) => !product.riyadhOnly || branch === "riyadh",
  );
  const serviceEntries = availableProducts.filter((product) => product.kind === "service");
  const packageEntries = availableProducts.filter((product) => product.kind === "package");
  const selectedProduct = productEntries.find((product) => product.id === bookingProduct);
  const selectedPackage = packageEntries.find((item) => item.id === bookingProduct);
  const selectedService = serviceEntries.find((item) => item.id === bookingProduct);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, language]);

  function navigate(nextScreen: Screen) {
    if (nextScreen === "booking" && !today) {
      const currentDate = new Date();
      setToday(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        ),
      );
      setMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
    setScreen(nextScreen);
    setBookingReady(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeLanguage() {
    saveLanguage(isArabic ? "en" : "ar");
  }

  const calendarDays: Array<number | null> = month
    ? (() => {
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayFirstOffset = (firstOfMonth.getDay() + 1) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    return [
      ...Array.from({ length: mondayFirstOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  })()
    : [];
  const monthLabel = month
    ? new Intl.DateTimeFormat(
    isArabic ? "ar-SA-u-ca-gregory" : "en-US",
    { month: "long", year: "numeric" },
      ).format(month)
    : "";
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00`))
    : text.noDate;

  function changeMonth(amount: number) {
    setMonth((current) =>
      current
        ? new Date(current.getFullYear(), current.getMonth() + amount, 1)
        : current,
    );
  }

  return (
    <main
      className={`app-shell${screen === "welcome" ? " landing-shell" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {screen !== "welcome" && (
      <header className="site-header">
        <Brand language={language} onClick={() => navigate("home")} />

        <nav
          className="main-nav"
          dir={isArabic ? "rtl" : "ltr"}
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
        >
          <button
            className={`nav-link${screen === "home" ? " active" : ""}`}
            type="button"
            onClick={() => navigate("home")}
          >
            {text.home}
          </button>
          <button
            className={`nav-link${screen === "services" || screen === "service" ? " active" : ""}`}
            type="button"
            onClick={() => {
              setServiceTab("individual");
              navigate("services");
            }}
          >
            {text.services}
          </button>
          <button
            className={`nav-link${screen === "package" ? " active" : ""}`}
            type="button"
            onClick={() => {
              setServiceTab("packages");
              navigate("services");
            }}
          >
            {text.packages}
          </button>
          <button
            className={`nav-link${screen === "booking" ? " active" : ""}`}
            type="button"
            onClick={() => navigate("booking")}
          >
            {text.bookings}
          </button>
          <button
            className="nav-link nav-link-unavailable"
            type="button"
            disabled
            title={text.profileUnavailable}
          >
            {text.profile}
          </button>
        </nav>

        <div className="header-actions" dir={isArabic ? "rtl" : "ltr"}>
          <button
            className="header-branch"
            type="button"
            onClick={() => navigate("welcome")}
            aria-label={isArabic ? "تغيير الفرع" : "Change branch"}
          >
            <Icon name="location" />
            <span>{text.branches[branch]}</span>
          </button>
          <span className="header-divider" aria-hidden="true" />
          <button
            className="language-switch"
            type="button"
            onClick={changeLanguage}
            aria-label={isArabic ? "Switch language to English" : "تغيير اللغة إلى العربية"}
          >
            <Icon name="globe" />
            <span>{text.language}</span>
          </button>
          <span className="header-design-icons" aria-hidden="true">
            <Icon name="user" />
            <Icon name="cart" />
          </span>
        </div>
      </header>
      )}

      {screen === "welcome" && (
        <LandingPage
          language={language}
          branch={branch}
          onBranchChange={setBranch}
          onContinue={() => navigate("home")}
          onLanguageChange={changeLanguage}
        />
      )}

      {screen === "home" && (
        <>
          <section className="home-hero">
            <div className="home-copy" dir={isArabic ? "rtl" : "ltr"}>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {text.homeEyebrow}
              </p>
              <h1>{text.homeTitle}</h1>
              <p className="home-description">{text.homeDescription}</p>
              <div className="home-actions">
                <button className="button button-primary" onClick={() => navigate("booking")}>
                  {text.bookSession}
                  <Icon name="arrow" />
                </button>
                <button
                  className="text-link"
                  onClick={() => {
                    setServiceTab("individual");
                    navigate("services");
                  }}
                >
                  {text.exploreServices}
                </button>
              </div>
            </div>
            <ImagePlaceholder name="home" label={text.photoPlaceholder} className="home-visual" />
            <span className="home-decoration" aria-hidden="true">ج</span>
          </section>

          <section className="home-discover">
            <div className="section-intro">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {text.servicesEyebrow}
              </p>
              <h2>{text.exploreServices}</h2>
            </div>
            <div className="discover-grid">
              <button className="discover-card" onClick={() => navigate("services")}>
                <ImagePlaceholder
                  name="individualSessions"
                  label={text.photoPlaceholder}
                  className="discover-visual"
                />
                <span className="discover-card-content" dir={isArabic ? "rtl" : "ltr"}>
                  <span className="discover-card-icon" aria-hidden="true">
                    <Icon name="services" />
                  </span>
                  <span className="discover-card-title">{text.individualSessions}</span>
                  <span className="discover-card-description">{text.individualDescription}</span>
                  <span className="discover-card-link">
                    {text.exploreServices}
                    <Icon name="arrow" />
                  </span>
                </span>
              </button>
              <button
                className="discover-card"
                onClick={() => {
                  setServiceTab("packages");
                  navigate("services");
                }}
              >
                <ImagePlaceholder
                  name="carePackages"
                  label={text.photoPlaceholder}
                  className="discover-visual"
                />
                <span className="discover-card-content" dir={isArabic ? "rtl" : "ltr"}>
                  <span className="discover-card-icon" aria-hidden="true">
                    <Icon name="packages" />
                  </span>
                  <span className="discover-card-title">{text.completePackages}</span>
                  <span className="discover-card-description">{text.packagesDescription}</span>
                  <span className="discover-card-link">
                    {text.explorePackages}
                    <Icon name="arrow" />
                  </span>
                </span>
              </button>
            </div>
          </section>
        </>
      )}

      {screen === "services" && (
        <section className="page-section services-screen">
          <JourneyBreadcrumbs
            language={language}
            branch={branch}
            onBranchList={() => navigate("welcome")}
            onCatalogue={() => navigate("services")}
          />
          <div className="page-heading journey-page-heading">
            <h1>
              {journeyCopy[language].categoryTitle} {text.branches[branch]}
            </h1>
            <p>{journeyCopy[language].categoryDescription}</p>
            <div className="service-tabs journey-tabs" role="tablist" aria-label={text.services}>
              <button
                className={`service-tab${serviceTab === "individual" ? " active" : ""}`}
                type="button"
                role="tab"
                id="individual-tab"
                aria-controls="individual-panel"
                aria-selected={serviceTab === "individual"}
                onClick={() => setServiceTab("individual")}
              >
                {text.individualTab}
              </button>
              <button
                className={`service-tab${serviceTab === "packages" ? " active" : ""}`}
                type="button"
                role="tab"
                id="packages-tab"
                aria-controls="packages-panel"
                aria-selected={serviceTab === "packages"}
                onClick={() => setServiceTab("packages")}
              >
                {text.packagesTab}
              </button>
            </div>
          </div>

          {serviceTab === "individual" ? (
            <div
              className="reference-product-grid"
              id="individual-panel"
              role="tabpanel"
              aria-labelledby="individual-tab"
            >
              {serviceEntries.map((service) => (
                <article className="reference-product-card" key={service.id}>
                  <ImagePlaceholder
                    name={service.image}
                    label={journeyCopy[language].imagePlaceholder}
                    className="reference-product-image"
                    placeholderOnly
                  />
                  <div className="reference-product-info">
                    <span className="reference-product-tag">{service.count}</span>
                    <h2>{service.title}</h2>
                    <p>{service.description}</p>
                    <div className="reference-product-facts">
                      <span><Icon name="clock" />{service.duration}</span>
                      <span><Icon name="location" />{journeyCopy[language].homeService}</span>
                    </div>
                    <div className="reference-product-meta">
                      <strong>{service.priceLabel}</strong>
                      <span>{text.individualSession}</span>
                    </div>
                    <button
                      className="button button-primary reference-product-cta"
                      type="button"
                      onClick={() => {
                        setBookingProduct(service.id);
                        navigate("service");
                      }}
                    >
                      {journeyCopy[language].viewDetails}
                      <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className="reference-product-grid package-grid"
              id="packages-panel"
              role="tabpanel"
              aria-labelledby="packages-tab"
            >
              {packageEntries.map((item) => (
                <article className="reference-product-card" key={item.id}>
                  <ImagePlaceholder
                    name={item.image}
                    label={journeyCopy[language].imagePlaceholder}
                    className="reference-product-image"
                    placeholderOnly
                  />
                  <div className="reference-product-info">
                    <span className="reference-product-tag">{item.count}</span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <div className="reference-product-facts">
                      <span><Icon name="clock" />{item.duration}</span>
                      <span><Icon name="location" />{journeyCopy[language].homeService}</span>
                    </div>
                    <div className="reference-product-meta">
                      <strong>{item.priceLabel}</strong>
                      <span>{text.packageLabel}</span>
                    </div>
                    <button
                      className="button button-primary reference-product-cta"
                      type="button"
                      onClick={() => {
                        setBookingProduct(item.id);
                        navigate("package");
                      }}
                    >
                      {journeyCopy[language].viewDetails}
                      <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="journey-preview-notice">
            <Icon name="lock" />
            {journeyCopy[language].previewNotice}
          </p>
        </section>
      )}

      {screen === "package" && selectedPackage && (
        <section className="page-section package-screen">
          <JourneyBreadcrumbs
            language={language}
            branch={branch}
            productName={selectedPackage.title}
            onBranchList={() => navigate("welcome")}
            onCatalogue={() => {
              setServiceTab("packages");
              navigate("services");
            }}
          />
          <div className="package-feature reference-detail-layout">
            <ImagePlaceholder
              name={selectedPackage.image}
              label={journeyCopy[language].imagePlaceholder}
              className="package-photo reference-detail-photo"
              placeholderOnly
            />
            <div className="package-content reference-detail-content">
              <span className="reference-product-tag">{selectedPackage.count}</span>
              <h1>{selectedPackage.title}</h1>
              <p className="package-description">{selectedPackage.description}</p>
              <h2 className="included-heading">{text.productDetails}</h2>
              <ul className="included-list">
                {selectedPackage.facts.map((fact) => (
                  <li key={fact}>
                    <Icon name="check" />
                    {fact}
                  </li>
                ))}
              </ul>
              <div className="reference-detail-price">
                <span>{text.price}</span>
                <strong>{selectedPackage.priceLabel}</strong>
              </div>
              <button
                className="button button-primary package-cta"
                type="button"
                onClick={() => navigate("booking")}
              >
                {journeyCopy[language].bookFirst}
                <Icon name="arrow" />
              </button>
            </div>
          </div>
          <ProductCareInfo language={language} />
          <p className="journey-preview-notice">
            <Icon name="lock" />
            {journeyCopy[language].previewNotice}
          </p>
        </section>
      )}

      {screen === "service" && selectedService && (
        <section className="page-section package-screen product-details-screen">
          <JourneyBreadcrumbs
            language={language}
            branch={branch}
            productName={selectedService.title}
            onBranchList={() => navigate("welcome")}
            onCatalogue={() => {
              setServiceTab("individual");
              navigate("services");
            }}
          />
          <div className="package-feature reference-detail-layout">
            <ImagePlaceholder
              name={selectedService.image}
              label={journeyCopy[language].imagePlaceholder}
              className="package-photo reference-detail-photo"
              placeholderOnly
            />
            <div className="package-content reference-detail-content">
              <span className="reference-product-tag">{selectedService.count}</span>
              <h1>{selectedService.title}</h1>
              <p className="package-description">{selectedService.description}</p>
              <ul className="reference-detail-facts">
                {selectedService.facts.map((fact) => (
                  <li key={fact}><Icon name="check" />{fact}</li>
                ))}
              </ul>
              <div className="reference-detail-price">
                <span>{text.price}</span>
                <strong>{selectedService.priceLabel}</strong>
              </div>
              <button
                className="button button-primary package-cta"
                type="button"
                onClick={() => navigate("booking")}
              >
                {journeyCopy[language].bookNow}
                <Icon name="arrow" />
              </button>
            </div>
          </div>
          <ProductCareInfo language={language} />
          <p className="journey-preview-notice">
            <Icon name="lock" />
            {journeyCopy[language].previewNotice}
          </p>
        </section>
      )}

      {screen === "booking" && (
        <section className="page-section booking-screen">
          <div className="page-heading booking-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              {text.bookingEyebrow}
            </p>
            <h1>{text.bookingTitle}</h1>
          </div>

          <div className="booking-layout">
            <div className="booking-form">
              <div className="booking-progress">
                <div className="progress-step complete">
                  <span className="progress-number"><Icon name="check" /></span>
                  <span>{text.visitDetails}</span>
                </div>
                <span className="progress-line" />
                <div className="progress-step current">
                  <span className="progress-number">2</span>
                  <span>{text.specialistAndDate}</span>
                </div>
                <span className="progress-line" />
                <div className="progress-step">
                  <span className="progress-number">3</span>
                  <span>{text.payment}</span>
                </div>
              </div>

              <fieldset className="booking-group">
                <legend>{text.chooseSpecialist}</legend>
                <div className="specialist-grid">
                  {[
                    { id: "sara", image: "specialistSara" as const, label: text.specialistSara },
                    { id: "noura", image: "specialistNoura" as const, label: text.specialistNoura },
                    { id: "maryam", image: "specialistMaryam" as const, label: text.specialistMaryam },
                  ].map((person) => (
                    <button
                      className={`specialist-card${specialist === person.id ? " selected" : ""}`}
                      key={person.id}
                      type="button"
                      aria-pressed={specialist === person.id}
                      onClick={() => setSpecialist(person.id)}
                    >
                      <ImagePlaceholder
                        name={person.image}
                        label={person.label}
                        className="specialist-photo"
                      />
                      <span>{person.label}</span>
                      {specialist === person.id && <Icon name="check" className="selected-mark" />}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="appointment-grid">
                <fieldset className="booking-group calendar-group">
                  <legend>{text.chooseDate}</legend>
                  <div className="calendar">
                    <div className="calendar-toolbar">
                      <button
                        className="calendar-arrow"
                        type="button"
                        aria-label={isArabic ? "الشهر السابق" : "Previous month"}
                        disabled={
                          !month ||
                          !today ||
                          (month.getFullYear() === today.getFullYear() &&
                            month.getMonth() === today.getMonth())
                        }
                        onClick={() => changeMonth(-1)}
                      >
                        <Icon name="arrow" />
                      </button>
                      <strong>{monthLabel}</strong>
                      <button
                        className="calendar-arrow next"
                        type="button"
                        aria-label={isArabic ? "الشهر التالي" : "Next month"}
                        onClick={() => changeMonth(1)}
                      >
                        <Icon name="arrow" />
                      </button>
                    </div>
                    <div className="calendar-grid">
                      {text.weekdays.map((day) => (
                        <span className="calendar-weekday" key={day}>
                          {day}
                        </span>
                      ))}
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return <span className="calendar-empty" key={`empty-${index}`} />;
                        }

                        if (!month || !today) return null;

                        const date = new Date(month.getFullYear(), month.getMonth(), day);
                        const dateKey = localDateKey(date);
                        const isPast =
                          date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                        return (
                          <button
                            className={`calendar-day${selectedDate === dateKey ? " selected" : ""}`}
                            key={dateKey}
                            type="button"
                            disabled={isPast}
                            aria-pressed={selectedDate === dateKey}
                            onClick={() => {
                              setSelectedDate(dateKey);
                              setSelectedTime("");
                              setBookingReady(false);
                            }}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="booking-group time-group">
                  <legend>{text.chooseTime}</legend>
                  <div className="selected-date">
                    <Icon name="calendar" />
                    <span>{selectedDateLabel}</span>
                  </div>
                  <div className="time-options">
                    {["10:00", "10:30", "11:00", "12:00", "12:30", "13:00", "14:00", "14:30", "15:00"].map(
                      (time) => (
                        <button
                          className={`time-option${selectedTime === time ? " selected" : ""}`}
                          key={time}
                          type="button"
                          disabled={!selectedDate}
                          aria-pressed={selectedTime === time}
                          onClick={() => {
                            setSelectedTime(time);
                            setBookingReady(false);
                          }}
                        >
                          {new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(`2020-01-01T${time}:00`))}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="timezone-note">
                    <Icon name="clock" />
                    {text.timezone}
                  </p>
                </fieldset>
              </div>
            </div>

            <aside className="booking-summary">
              <p className="summary-eyebrow">{text.bookingSummaryTitle}</p>
              {selectedProduct && (
                <div className="summary-package">
                  <ImagePlaceholder
                    name={selectedProduct.image}
                    label={text.photoPlaceholder}
                    className="summary-photo"
                    placeholderOnly
                  />
                  <div>
                    <span>
                      {selectedProduct.kind === "package"
                        ? text.packageLabel
                        : text.individualSessions}
                    </span>
                    <strong>{selectedProduct.title}</strong>
                    <small>{selectedProduct.count} · {selectedProduct.duration}</small>
                  </div>
                </div>
              )}
              <div className="summary-row">
                <span>{text.specialistLabel}</span>
                <strong>
                  {specialist === "sara"
                    ? text.specialistSara
                    : specialist === "noura"
                      ? text.specialistNoura
                      : text.specialistMaryam}
                </strong>
              </div>
              <div className="summary-row">
                <span>{text.category}</span>
                <strong>{text.appointmentCategory}</strong>
              </div>
              <div className="summary-row">
                <span>{text.appointmentLabel}</span>
                <strong>{selectedDate ? selectedDateLabel : text.noDate}</strong>
              </div>
              {selectedTime && (
                <div className="summary-row">
                  <span>{text.appointmentTime}</span>
                  <strong>{selectedTime}</strong>
                </div>
              )}
              {selectedProduct && (
                <div className="summary-price">
                  <span>{text.price}</span>
                  <strong>{selectedProduct.priceLabel}</strong>
                </div>
              )}
              <button
                className="button button-primary summary-cta"
                type="button"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setBookingReady(true)}
              >
                {text.continueBooking}
                <Icon name="arrow" />
              </button>
              {bookingReady && (
                <p className="booking-ready" role="status">
                  <Icon name="check" />
                  {text.bookingReady}
                </p>
              )}
              <p className="secure-note">
                <Icon name="lock" />
                {text.secure}
              </p>
              <p className="summary-branch">
                <Icon name="location" />
                {text.branches[branch]}
              </p>
            </aside>
          </div>
        </section>
      )}

      {screen !== "welcome" && (
        <footer className="site-footer">
          <Brand language={language} onClick={() => navigate("home")} />
          <span className="footer-message">{text.footerLine}</span>
          <span className="copyright">© JOUD SPA</span>
          <div className="footer-links">
            <button type="button" onClick={() => navigate("home")}>{text.home}</button>
            <button type="button" onClick={() => navigate("services")}>{text.services}</button>
            <button type="button" onClick={() => navigate("booking")}>{text.bookings}</button>
          </div>
        </footer>
      )}
    </main>
  );
}
