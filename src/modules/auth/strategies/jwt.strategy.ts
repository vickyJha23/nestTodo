import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/modules/users/services/users.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
       constructor(private configService: ConfigService, private userService: UsersService) {
              super({
                    jwtFromRequest: ExtractJwt.fromExtractors([
                         (req: any) => {
                            const accessToken = req?.cookies?.accessToken;
                            if(accessToken) {
                                  return accessToken
                            }

                            const authHeader = req?.headers?.authorization;
                            if(authHeader && authHeader.startsWith("Bearer ")) {
                                  return authHeader.split(" ")[1]
                            }

                            return null
                         }
                    ]),
                    ignoreExpiration: false,
                    secretOrKey: configService.get<string>("jwt.accessTokenSecret") as string
              })

       }
       
       async validate(payload: {sub: string, email: string}) {
                return payload;
       }
}
