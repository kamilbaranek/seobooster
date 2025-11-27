import { Octokit } from 'octokit';
import { createLogger } from '../logger';

const logger = createLogger('github-service');

export class GithubService {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    async checkConnection(owner: string, repo: string): Promise<boolean> {
        try {
            await this.octokit.rest.repos.get({
                owner,
                repo,
            });
            return true;
        } catch (error) {
            logger.error({ error, owner, repo }, 'Failed to connect to GitHub repository');
            return false;
        }
    }

    async pushFile(
        owner: string,
        repo: string,
        branch: string,
        path: string,
        content: string,
        message: string
    ): Promise<void> {
        try {
            // Get the current commit SHA of the branch
            const { data: refData } = await this.octokit.rest.git.getRef({
                owner,
                repo,
                ref: `heads/${branch}`,
            });
            const latestCommitSha = refData.object.sha;

            // Get the file blob SHA if it exists (for update)
            let fileSha: string | undefined;
            try {
                const { data: fileData } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path,
                    ref: branch,
                });
                if (!Array.isArray(fileData) && 'sha' in fileData) {
                    fileSha = fileData.sha;
                }
            } catch (e) {
                // File doesn't exist, which is fine for creation
            }

            // Create or update the file
            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content).toString('base64'),
                branch,
                sha: fileSha,
                committer: {
                    name: 'SeoBooster Bot',
                    email: 'bot@seobooster.com',
                },
                author: {
                    name: 'SeoBooster Bot',
                    email: 'bot@seobooster.com',
                },
            });

            logger.info({ owner, repo, path }, 'Successfully pushed file to GitHub');
        } catch (error) {
            logger.error({ error, owner, repo, path }, 'Failed to push file to GitHub');
            throw error;
        }
    }
}
