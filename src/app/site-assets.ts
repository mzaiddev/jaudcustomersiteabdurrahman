export const siteAssets: {
  logo: string;
  welcomeVideo: string;
  icons: Record<
    | "arrow"
    | "calendar"
    | "cart"
    | "check"
    | "clock"
    | "globe"
    | "home"
    | "location"
    | "lock"
    | "packages"
    | "services"
    | "user",
    string
  >;
  images: Record<
    | "welcome"
    | "home"
    | "individualSessions"
    | "carePackages"
    | "serviceMassage"
    | "serviceSkin"
    | "serviceFoot"
    | "packageQuiet"
    | "packageRelaxation"
    | "specialistSara"
    | "specialistNoura"
    | "specialistMaryam",
    string
  >;
} = {
  logo: "/joud-logo.png",
  welcomeVideo: "",
  icons: {
    arrow: "",
    calendar: "",
    cart: "/cart.png",
    check: "",
    clock: "",
    globe: "",
    home: "",
    location: "",
    lock: "",
    packages: "/packgift.png",
    services: "/ssi.png",
    user: "/profile.png",
  },
  images: {
    welcome: "/welcome-canva.png",
    home: "/home-hero-canva.png",
    individualSessions: "/ss.png",
    carePackages: "/packpic.png",
    serviceMassage: "/service-massage-canva.png",
    serviceSkin: "/ssi.png",
    serviceFoot: "/packgift.png",
    packageQuiet: "/package-detail-canva.png",
    packageRelaxation: "/packpic.png",
    specialistSara: "/specialist-sara.png",
    specialistNoura: "/specialist-noura.png",
    specialistMaryam: "/specialist-maryam.png",
  },
};

// Add files under public/ and replace any empty path with its public URL,
// for example "/joud-logo.png" or "/images/spa-room.jpg".
