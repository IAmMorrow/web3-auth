const IRON_SECRET = process.env.IRON_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;
const IS_SECURE = process.env.NODE_ENV === "production";

if (IS_SECURE && !ALLOWED_DOMAIN) {
  throw new Error("No ALLOWED_DOMAIN field defined in env")
}

if (!IRON_SECRET) {
  throw new Error("No IRON_SECRET field defined in env");
}

if (!JWT_SECRET) {
  throw new Error("No JWT_SECRET field defined in env");
}

export const siweOptions = {
  allowedDomain: ALLOWED_DOMAIN,
}

export const ironOptions = {
  cookieName: "ledger-auth",
  password: IRON_SECRET,
  cookieOptions: {
    secure: IS_SECURE,
    maxAge: 60 * 60 * 24 * 30, // expire in one month
  },
};

export const jwtConfig = {
  issuer: process.env.VERCEL_URL || "dev",
  expirationTime: "30d",
}

export const jwtSecret = JWT_SECRET
