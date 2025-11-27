import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(config: ConfigService) {
        const clientID = config.get<string>('GITHUB_CLIENT_ID');
        const clientSecret = config.get<string>('GITHUB_CLIENT_SECRET');
        const callbackURL = config.get<string>('GITHUB_CALLBACK_URL');

        if (!clientID || !clientSecret || !callbackURL) {
            super({
                clientID: 'MISSING',
                clientSecret: 'MISSING',
                callbackURL: 'http://missing.com'
            });
            new Logger(GithubStrategy.name).warn('GitHub OAuth credentials not provided. GitHub integration will not work.');
        } else {
            super({
                clientID,
                clientSecret,
                callbackURL,
                scope: ['repo'],
                passReqToCallback: true
            });
        }
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
        // We pass the profile and tokens back to the controller
        // The controller will handle linking to the web project
        const user = {
            githubProfile: profile,
            accessToken,
            refreshToken
        };
        done(null, user);
    }
}
