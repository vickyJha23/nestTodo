import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
       host: process.env.DATABASE_HOST,
       port: parseInt(process.env.DATABASE_PORT!, 10),
       username: process.env.DATABASE_USERNAME ,
       password: process.env.DATABASE_USER_PASSWORD ,
}))