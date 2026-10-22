export type ProductId =
  | "detox"
  | "aljoudi"
  | "postpartum"
  | "gym-recovery"
  | "calm-massage"
  | "hot-stone"
  | "cupping"
  | "bridal"
  | "luxury-wellness"
  | "love"
  | "queen-mom"
  | "calm-package"
  | "partner"
  | "friends"
  | "vip-detox"
  | "vip-detox-package";

export type ProductKind = "service" | "package";

type Product = {
  id: ProductId;
  kind: ProductKind;
  image: "serviceMassage" | "packageQuiet" | "packageRelaxation";
  name: { ar: string; en: string };
  price: number;
  minutes: number;
  sessions: number;
  guests: number;
  repeat: boolean;
  group: boolean;
  extraPrice: number;
  description: { ar: string; en: string };
  facts: { ar: string[]; en: string[] };
  pendingTypes?: boolean;
  riyadhOnly?: boolean;
};

export const productCatalogue: Product[] = [
  {
    id: "detox",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج الديتوكس", en: "Detox Massage" },
    price: 460,
    minutes: 90,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "تجربة مساج باستخدام أدوات خشبية مخصصة، تساعد على تنشيط الدورة الدموية وتحفيز التصريف اللمفاوي، مع التركيز على تحسين مظهر الجسم ومنحه إحساسًا بالخفة والاسترخاء. خيار مثالي لمن تبحث عن تجربة عناية بالجسم تجمع بين التدليك والعناية بالمظهر.",
      en: "A massage experience using specially designed wooden tools that help stimulate circulation and lymphatic drainage, with a focus on improving the appearance of the body and creating a feeling of lightness and relaxation. An ideal choice for those seeking a body-care experience that combines massage with attention to appearance.",
    },
    facts: { ar: ["جلسة واحدة", "90 دقيقة لكل جلسة"], en: ["One session", "90 minutes per session"] },
  },
  {
    id: "aljoudi",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج AlJoudi Wellness Spa", en: "AlJoudi Wellness Spa Massage" },
    price: 450,
    minutes: 90,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "تجربة استرخاء متكاملة تجمع بين كاسات الهواء والأحجار الدافئة، لتمنحك إحساسًا بالراحة وتساعد على تخفيف التوتر العضلي والإجهاد بعد يوم طويل. ويمكن تخصيص التركيز على المناطق التي تحتاج إلى عناية واسترخاء، وفقًا لاحتياجك وراحتك.",
      en: "A complete relaxation experience combining cupping and warm stones to provide a sense of comfort and help ease muscle tension and fatigue after a long day. The focus can be tailored to areas that need care and relaxation, according to your needs and comfort.",
    },
    facts: { ar: ["جلسة واحدة", "90 دقيقة لكل جلسة"], en: ["One session", "90 minutes per session"] },
  },
  {
    id: "postpartum",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج بعد الولادة", en: "Postpartum Massage" },
    price: 380,
    minutes: 90,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "تجربة عناية وراحة مخصصة للأم بعد الولادة، باستخدام زيت خاص بجلسة ما بعد الولادة، مع حركات تدليك لطيفة تساعد على الاسترخاء وتخفيف الشعور بالإجهاد، لتمنح الأم لحظات من الراحة والاهتمام بنفسها خلال فترة التعافي.",
      en: "A care and comfort experience designed for mothers after childbirth, using a special postpartum massage oil and gentle massage movements that help promote relaxation and ease feelings of fatigue. It offers mothers moments of rest and self-care during recovery.",
    },
    facts: { ar: ["جلسة واحدة", "90 دقيقة لكل جلسة"], en: ["One session", "90 minutes per session"] },
  },
  {
    id: "gym-recovery",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج الجيم", en: "Gym Recovery Massage" },
    price: 350,
    minutes: 50,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "جلسة تدليك مخصصة لما بعد التمارين الرياضية، تساعد على تخفيف الشد العضلي والإجهاد الناتج عن النشاط البدني، وتمنح الجسم شعورًا بالراحة والاسترخاء. مناسبة لمن ترغب في إضافة العناية العضلية إلى روتينها الرياضي.",
      en: "A massage session designed for after exercise, helping ease muscle tightness and fatigue caused by physical activity and giving the body a sense of comfort and relaxation. Suitable for those who wish to make muscle care part of their fitness routine.",
    },
    facts: { ar: ["جلسة واحدة", "50 دقيقة لكل جلسة"], en: ["One session", "50 minutes per session"] },
  },
  {
    id: "calm-massage",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج الهدوء", en: "Calm Relaxation Massage" },
    price: 280,
    minutes: 60,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "جلسة مساج استرخائي باستخدام زيت التدليك، بحركات ناعمة تساعد على تهدئة الجسم وتخفيف التوتر اليومي، لتعيشي ساعة من الهدوء والراحة في أجواء منزلية مريحة.",
      en: "A relaxing massage with massage oil and gentle movements that help soothe the body and ease everyday tension, allowing you to enjoy an hour of calm and comfort in the relaxing surroundings of your home.",
    },
    facts: { ar: ["جلسة واحدة", "60 دقيقة لكل جلسة"], en: ["One session", "60 minutes per session"] },
  },
  {
    id: "hot-stone",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج الأحجار", en: "Hot Stone Massage" },
    price: 299,
    minutes: 60,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "تجربة تدليك باستخدام الأحجار الدافئة، تساعد على إرخاء العضلات وتخفيف التوتر وتعزيز الشعور بالراحة. جلسة مثالية لمن تبحث عن الاسترخاء العميق وتجربة عناية دافئة ومميزة.",
      en: "A massage experience using warm stones to help relax the muscles, ease tension and enhance a sense of comfort. An ideal session for those seeking deep relaxation and a warm, distinctive care experience.",
    },
    facts: { ar: ["جلسة واحدة", "60 دقيقة لكل جلسة"], en: ["One session", "60 minutes per session"] },
  },
  {
    id: "cupping",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج كاسات الهواء", en: "Cupping Massage" },
    price: 299,
    minutes: 60,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "جلسة عناية باستخدام كاسات الهواء وفقًا للتقنية المناسبة، بهدف تخفيف الشعور بالتوتر العضلي ومنح الجسم إحساسًا بالراحة. تُحدد ملاءمة الجلسة وطريقتها بعد معرفة الحالة الصحية للعميلة.",
      en: "A care session using cupping with the appropriate technique, intended to ease feelings of muscle tension and provide a sense of comfort. The suitability of the session and the method used are determined after reviewing the client’s health condition.",
    },
    facts: { ar: ["جلسة واحدة", "60 دقيقة لكل جلسة"], en: ["One session", "60 minutes per session"] },
  },
  {
    id: "bridal",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج العروس", en: "Bridal Body Scrub & Massage" },
    price: 400,
    minutes: 90,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    description: {
      ar: "طقوس عناية فاخرة تبدأ بتقشير الجسم باستخدام خلطة خاصة بالقهوة، للمساعدة على إزالة خلايا الجلد الميتة وتحسين ملمس البشرة ونعومتها، تليها جلسة مساج استرخائية تمنحك إحساسًا بالراحة والانتعاش. تجربة مصممة لتكون لحظتك الخاصة من العناية والدلال، استعدادًا لمناسبتك المميزة.",
      en: "A luxurious care ritual beginning with a body scrub using a special coffee blend to help remove dead skin cells and improve the skin’s texture and softness. This is followed by a relaxing massage that leaves you feeling comfortable and refreshed. An experience designed to be your own special moment of care and pampering as you prepare for your special occasion.",
    },
    facts: { ar: ["جلسة واحدة", "90 دقيقة لكل جلسة"], en: ["One session", "90 minutes per session"] },
  },
  {
    id: "luxury-wellness",
    kind: "package",
    image: "packageQuiet",
    name: { ar: "باقة الرفاهية", en: "Luxury Wellness Package" },
    price: 1400,
    minutes: 0,
    sessions: 4,
    guests: 1,
    repeat: true,
    group: false,
    extraPrice: 0,
    pendingTypes: true,
    description: {
      ar: "باقة تمنحك حرية اختيار نوع المساج المفضل لديكِ، مع إمكانية الاستمتاع بأربع جلسات من النوع نفسه أو اختيار ما يناسب احتياجك وفق الخدمات المشمولة في الباقة. جددي شعورك بالراحة والاهتمام بنفسك مع تجربة رفاهية متكاملة، واجعلي العناية بجسمك جزءًا من روتينك الأسبوعي.",
      en: "A package that gives you the freedom to choose your preferred massage, with the option to enjoy four sessions of the same type or select what suits your needs from the services included in the package. Renew your sense of comfort and self-care with a complete wellness experience, and make caring for your body part of your weekly routine.",
    },
    facts: {
      // TODO(client): replace the [to confirm] items with the final approved list.
      ar: [
        "٤ جلسات من الخدمات المشمولة",
        "أنواع المساج المشمولة: [للتأكيد — مثل: مساج الهدوء، مساج الديتوكس، مساج AlJoudi Wellness Spa، الأحجار الساخنة]",
        "مدة كل نوع: [للتأكيد — مثل: الهدوء ٦٠ دقيقة، الديتوكس ٩٠ دقيقة]",
        "غير مشمول: [للتأكيد — مثل: جلسات VIP والإضافات]",
        "اختيار نوع مختلف في كل زيارة: [للتأكيد]",
      ],
      en: [
        "4 sessions from the included services",
        "Included massage types: [to confirm — e.g. Calm, Detox, AlJoudi Wellness Spa massage, Hot stone]",
        "Duration of each type: [to confirm — e.g. Calm 60 min, Detox 90 min]",
        "Not included: [to confirm — e.g. VIP sessions and add-ons]",
        "A different type at each visit: [to confirm]",
      ],
    },
  },
  {
    id: "love",
    kind: "package",
    image: "packageRelaxation",
    name: { ar: "باقة الحب", en: "Love Package" },
    price: 1600,
    minutes: 60,
    sessions: 2,
    guests: 2,
    repeat: true,
    group: true,
    extraPrice: 0,
    description: {
      ar: "باقة مميزة للزوجين تجمع بين الاسترخاء والاهتمام المشترك. زيارتان لشخصين، يحصل كل منكما في كل زيارة على جلسة مساج استرخائي مدتها ٦٠ دقيقة (٤ جلسات في المجموع)، في تجربة تمنحكما فرصة لتجديد الطاقة وصنع لحظات جميلة معًا.",
      en: "A special package for couples that brings together relaxation and shared care. Two visits for two people, with a 60-minute relaxing massage for each of you at every visit (4 sessions in total), in an experience that offers an opportunity to renew your energy and create beautiful moments together.",
    },
    facts: {
      ar: ["زيارتان لشخصين (٤ جلسات في المجموع)", "جلسة مدتها ٦٠ دقيقة لكل شخص في كل زيارة", "أخصائية واحدة تقدّم الجلستين في كل زيارة"],
      en: ["Two visits for two people (4 sessions in total)", "A 60-minute session per person at each visit", "One specialist provides both sessions at each visit"],
    },
  },
  {
    id: "queen-mom",
    kind: "package",
    image: "packageRelaxation",
    name: { ar: "باقة ست الحبايب", en: "Queen Mom Package" },
    price: 1200,
    minutes: 60,
    sessions: 4,
    guests: 1,
    repeat: true,
    group: false,
    extraPrice: 0,
    description: {
      ar: "لأن أمهاتنا يستحققن كل الحب والاهتمام، صُممت هذه الباقة لتمنح الأم أربع جلسات من مساج الهدوء والاسترخاء، تساعدها على الابتعاد عن ضغوط الحياة اليومية والاستمتاع بلحظات خاصة من الراحة والعناية. هدية تعبّر عن الحب والامتنان بطريقة تستحقها.",
      en: "Because our mothers deserve all our love and care, this package is designed to offer a mother four sessions of calming, relaxing massage, helping her step away from everyday pressures and enjoy special moments of rest and care. A gift that expresses love and gratitude in a way she deserves.",
    },
    facts: { ar: ["4 جلسات", "60 دقيقة لكل جلسة"], en: ["4 sessions", "60 minutes per session"] },
  },
  {
    id: "calm-package",
    kind: "package",
    image: "packageQuiet",
    name: { ar: "باقة الهدوء", en: "Calm Package" },
    price: 900,
    minutes: 60,
    sessions: 4,
    guests: 1,
    repeat: true,
    group: false,
    extraPrice: 0,
    description: {
      ar: "خصصي لنفسك وقتًا تستحقينه مع أربع جلسات من مساج الهدوء الاسترخائي. تجربة تساعدك على تخفيف التوتر اليومي، والاستمتاع بلحظات من السكينة والراحة، مع عناية منزلية تمنحك شعورًا بالرفاهية دون الحاجة إلى مغادرة منزلك.",
      en: "Set aside the time you deserve with four sessions of calming, relaxing massage. An experience that helps ease everyday tension and offers moments of serenity and comfort, with home-based care that gives you a sense of wellness without having to leave your home.",
    },
    facts: { ar: ["4 جلسات", "60 دقيقة لكل جلسة"], en: ["4 sessions", "60 minutes per session"] },
  },
  {
    id: "partner",
    kind: "package",
    image: "packageRelaxation",
    name: { ar: "جلسة أنا وشريكي", en: "Me & My Partner" },
    price: 500,
    minutes: 60,
    sessions: 1,
    guests: 2,
    repeat: false,
    group: true,
    extraPrice: 0,
    description: {
      ar: "لأن أجمل اللحظات هي التي نتشاركها، استمتعا معًا بتجربة مساج استرخائي تمنح كلًا منكما فرصة للراحة وتجديد الطاقة. جلسة مميزة تجمع بين العناية والهدوء والوقت الجميل الذي تقضيانه معًا.",
      en: "Because the most beautiful moments are the ones we share, enjoy a relaxing massage experience together that gives each of you an opportunity to rest and renew your energy. A special session that combines care, calm and quality time spent together.",
    },
    facts: { ar: ["جلسة واحدة", "60 دقيقة لكل شخص"], en: ["One session", "60 minutes per guest"] },
  },
  {
    id: "friends",
    kind: "package",
    image: "packageRelaxation",
    name: { ar: "باقة لمة الصحاب", en: "Friends’ Gathering Package" },
    price: 900,
    minutes: 60,
    sessions: 3,
    guests: 3,
    repeat: false,
    group: true,
    extraPrice: 250,
    description: {
      ar: "اجعلي لقاءك بصديقاتك فرصة للراحة والعناية بالنفس. تجمع باقة «لمة الصحاب» ثلاث صديقات في موعد واحد، تستمتع فيه كل واحدة بجلسة مساج استرخائي لمدة ساعة. تجربة تضيف إلى جمعتكن لحظات من الهدوء والاهتمام، وهدية مميزة تتشاركنها معًا.",
      en: "Make your next gathering a moment of shared relaxation and care. The Friends’ Gathering Package brings three friends together within a single booking, with a 60-minute relaxation massage for each guest. A thoughtful way to spend time together and enjoy a peaceful break from everyday routines.",
    },
    facts: {
      ar: [
        "نوع المساج: استرخائي.",
        "عدد المستفيدات: 3 صديقات.",
        "عدد الجلسات: جلسة واحدة لكل مستفيدة ضمن موعد واحد.",
        "مدة الجلسة: 60 دقيقة لكل مستفيدة.",
        "سعر الباقة: 900 ريال.",
        "إضافة صديقة: 250 ريال.",
      ],
      en: [
        "Massage type: Relaxation massage.",
        "Number of guests: 3 friends.",
        "Sessions: One session per guest within a single booking.",
        "Session duration: 60 minutes per guest.",
        "Package price: SAR 900.",
        "Additional friend: SAR 250.",
      ],
    },
  },
  {
    id: "vip-detox",
    kind: "service",
    image: "serviceMassage",
    name: { ar: "مساج الديتوكس — تجربة VIP", en: "VIP Detox Massage" },
    price: 500,
    minutes: 90,
    sessions: 1,
    guests: 1,
    repeat: false,
    group: false,
    extraPrice: 0,
    riyadhOnly: true,
    description: {
      ar: "تجربة ديتوكس مميزة باستخدام الأدوات الخشبية المخصصة لتدليك الجسم، تقدمها أخصائية تتمتع بخبرة تزيد على 30 عامًا في مجال المساج والعناية بالجسم. تجمع الجلسة بين الخبرة العملية والتقنية المتخصصة والاهتمام بالتفاصيل، مع التركيز على المناطق التي ترغبين في العناية بها وتكييف أسلوب الجلسة وفق احتياجك وراحتك. صُممت هذه التجربة لتمنحك وقتًا خاصًا للاسترخاء والعناية بالجسم ضمن مستوى أكثر تخصيصًا من الخدمة.",
      en: "A distinctive detox experience using specialized wooden body-massage tools, delivered by a therapist with more than 30 years of experience in massage and body care. The session combines practical expertise, specialized technique and attention to detail, focusing on the areas you wish to care for and adapting the approach to your needs and comfort. This experience is designed to give you dedicated time for relaxation and body care with a more personalized level of service.",
    },
    facts: {
      ar: [
        "متاح حاليًا في فرع الرياض فقط",
        "جلسة مع أخصائية متخصصة في تقنية الديتوكس.",
        "اهتمام أكبر بتفضيلات العميلة والمناطق المستهدفة.",
        "تجربة عناية شخصية مع إمكانية الحجز مع الأخصائية نفسها، وفقًا لتوفر المواعيد.",
        "خيار مخصص للعميلات اللاتي يفضلن تجربة متخصصة ومحددة بدلًا من الجلسة الأساسية.",
      ],
      en: [
        "Currently available in Riyadh only",
        "A session with a therapist specializing in the detox technique.",
        "Greater attention to the client’s preferences and targeted areas.",
        "A personalized care experience, with the option to book the same therapist, subject to appointment availability.",
        "A dedicated option for clients who prefer a specialized, focused experience rather than the standard session.",
      ],
    },
  },
  {
    id: "vip-detox-package",
    kind: "package",
    image: "packageRelaxation",
    name: { ar: "باقة الديتوكس VIP", en: "VIP Detox Package" },
    price: 1600,
    minutes: 90,
    sessions: 4,
    guests: 1,
    repeat: true,
    group: false,
    extraPrice: 0,
    riyadhOnly: true,
    description: {
      ar: "باقة من أربع جلسات ديتوكس مع الأخصائية المتخصصة، مناسبة لمن ترغب في الاستمرار على روتين منتظم من العناية والاسترخاء، مع مراعاة احتياجاتها وتفضيلاتها في كل زيارة",
      en: "A package of four detox sessions with the specialist therapist, suitable for those who wish to maintain a regular routine of care and relaxation, with attention to their needs and preferences at every visit.",
    },
    facts: {
      ar: ["٤ جلسات ديتوكس متخصصة", "٩٠ دقيقة لكل جلسة", "متاحة حاليًا في فرع الرياض فقط"],
      en: ["4 specialised detox sessions", "90 minutes per session", "Currently available in Riyadh only"],
    },
  },
];

/** Related photo for each service and package. */
export const productPhotos: Record<ProductId, string> = {
  detox: "/products/p7.webp",
  aljoudi: "/products/p8.webp",
  postpartum: "/products/p9.webp",
  "gym-recovery": "/products/p11.webp",
  "calm-massage": "/products/p6.webp",
  "hot-stone": "/products/p8.webp",
  cupping: "/products/p8.webp",
  bridal: "/products/p10.webp",
  "luxury-wellness": "/products/p2.webp",
  love: "/products/p3.webp",
  "queen-mom": "/products/p1.webp",
  "calm-package": "/products/p6.webp",
  partner: "/products/p4.webp",
  friends: "/products/p5.webp",
  "vip-detox": "/products/p7.webp",
  "vip-detox-package": "/products/p7.webp",
};
