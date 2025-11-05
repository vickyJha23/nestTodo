import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from "passport-local";
import { AuthService } from "../services/auth.service";
import { BadRequestException, Injectable } from "@nestjs/common";



@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
     constructor(private authService: AuthService) {
         super({
              usernameField: "email"
          })
     }

    async validate(email: string, password: string) {
        const user = await this.authService.validateUser(email, password);
        if(!user) {
            throw new BadRequestException("Invalid Email or Password")
        }
        return user;
    }
}