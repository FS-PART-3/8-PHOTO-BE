import passport from "passport";
import {
  accessTokenStrategy,
  refreshTokenStrategy,
} from "../auth/strategies/jwt.strategy.js";

import googleStrategy from "../auth/strategies/google.strategy.js";

passport.use("access-token", accessTokenStrategy);
passport.use("refresh-token", refreshTokenStrategy);
passport.use("google", googleStrategy);

export default passport;
