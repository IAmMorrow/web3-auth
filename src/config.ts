const IRON_SECRET = process.env.IRON_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

if (!IRON_SECRET) {
  throw new Error("No IRON_SECRET field defined in env");
}

if (!JWT_SECRET) {
  throw new Error("No JWT_SECRET field defined in env");
}

export const ironOptions = {
  cookieName: "ledger-auth",
  password: IRON_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // expire in one month
  },
};

export const jwtConfig = {
  issuer: process.env.VERCEL_URL || "dev",
  expirationTime: "30d",
}

export const jwtSecret = JWT_SECRET
