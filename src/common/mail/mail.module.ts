import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";

@Module({
      imports: [
           MailerModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config:ConfigService) => ({
                      transport: {
                           host: config.get("mailer.host"),
                           secure: false,
                           port: +config.get("mailer.port"),
                           auth: {
                              user: config.get("mailer.user"),
                              pass: config.get("mailer.pass")
                           }

                      },
                    template: {
                       dir: join(__dirname, "templates"),
                       adapter: new HandlebarsAdapter(),
                       options: {
                            strict: true
                       }
                    }

                })
           })
      ],
      providers: [],
      exports: []
})

export class MailModule{}