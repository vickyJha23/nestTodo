import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";


@Injectable()
export class MailService {
     constructor(private readonly mailService: MailerService) {}

     async sendMail(email: string, otp:string, name:string) {
         console.log(email, otp, name)
           const response = await this.mailService.sendMail({
                to: email,
                subject: "Your Verification Otp",
                template: "otp",
               context: {
                otp,
                name,
                year: new Date().getFullYear()
            }

        });
        console.log("response", response);
            return response;   
         }
 
    }