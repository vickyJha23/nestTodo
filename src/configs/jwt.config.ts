import { registerAs } from "@nestjs/config";


export default registerAs("jwt", () => ({
      accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET, 
      accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY,
      refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
      refreshTokenExpiry: process.env.JWT_RERESH_TOKEN_EXPIRY  
}))