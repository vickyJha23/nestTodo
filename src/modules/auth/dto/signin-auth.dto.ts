import { IsString, MaxLength, MinLength } from "class-validator";

export class SignInDto {
     @IsString()
     email: string;
     @MaxLength(8, {
          message: "Password is too long"
     })
     @MinLength(6, {
           message: "Password is too short"
     })
     @IsString()
     password: string
}