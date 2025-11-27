import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const webId = req.params.id;
        return {
            state: webId
        };
    }
}
