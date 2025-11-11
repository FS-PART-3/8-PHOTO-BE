// TODO: implement
import GoogleStrategy from "passport-google-oauth20";
import { oauthCreateOrUpdate } from "../../api/auth/auth.service.js";

const googleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
};

async function verify(profile, done) {
  const user = await oauthCreateOrUpdate(
    profile.provider,
    profile.id,
    profile.emails[0].value,
    profile.displayName
  );
  done(null, user);
}

const googleStrategy = new GoogleStrategy(googleStrategyOptions, verify);

export default googleStrategy;
