import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";
import { MailService } from "./services/mail.service";

@Module({
      imports: [
           MailerModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config:ConfigService) => ({
                      transport: {
                           host: config.get("mailer.host"),
                           secure: true,
                           port: +config.get("mailer.port"),
                           auth: {
                              user: config.get("mailer.user"),
                              pass: config.get("mailer.pass")
                           }

                      },
                    template: {
                       dir: join(process.cwd(), "src/common/mail/templates"),
                       adapter: new HandlebarsAdapter(),
                       options: {
                            strict: true
                       }
                    }

                })
           })
      ],
      providers: [MailService],
      exports: [MailService]
})

export class MailModule{}