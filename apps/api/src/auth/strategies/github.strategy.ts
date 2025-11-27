import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(config: ConfigService) {
        super({
            clientID: config.getOrThrow('GITHUB_CLIENT_ID'),
            clientSecret: config.getOrThrow('GITHUB_CLIENT_SECRET'),
            callbackURL: config.getOrThrow('GITHUB_CALLBACK_URL'),
            scope: ['repo'],
            passReqToCallback: true
        });
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
