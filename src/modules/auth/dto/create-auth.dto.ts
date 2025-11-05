import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class CreateAuthDto {
        
        @IsString({
            message: "Name must be string"
        })
        name: string;
        @IsString()
        userName: string;

        @IsEmail()
        email: string;
    
       
        @IsOptional()
        @IsEnum(['user', 'admin'], {
             message: "Role must be either 'user' or 'admin'"   
        })
        role: 'user' | 'admin' ;   

         @MinLength(6, {
            message: 'Password is too short'
        })
        @MaxLength(8, {
            message: 'Password is too long'
        })
        @IsString()
        password: string
 
}
