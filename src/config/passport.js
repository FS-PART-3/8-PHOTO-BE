import passport from "passport";
import googleStrategy from "../auth/strategies/google.strategy.js";

passport.use("google", googleStrategy);

export default passport;
