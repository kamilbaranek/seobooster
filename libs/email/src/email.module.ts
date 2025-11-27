import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Global()
@Module({
    providers: [
        {
            provide: EmailService,
            useFactory: (configService: ConfigService) => {
                return new EmailService({
                    apiKey: configService.getOrThrow('MAILGUN_API_KEY'),
                    domain: configService.getOrThrow('MAILGUN_DOMAIN'),
                    host: configService.get('MAILGUN_HOST'),
                    fromEmail: configService.getOrThrow('MAILGUN_FROM_EMAIL'),
                    fromName: configService.get('MAILGUN_FROM_NAME')
                });
            },
            inject: [ConfigService]
        }
    ],
    exports: [EmailService]
})
export class EmailModule { }
