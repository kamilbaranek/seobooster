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

    async ensureRepoExists(owner: string, repo: string): Promise<void> {
        try {
            await this.octokit.rest.repos.get({ owner, repo });
        } catch (error: any) {
            if (error.status === 404) {
                // Create repo
                await this.octokit.rest.repos.createForAuthenticatedUser({
                    name: repo,
                    private: true, // Default to private for backups
                    auto_init: true // Initialize with README so we have a main branch
                });
                logger.info({ owner, repo }, 'Created GitHub repository');
                // Wait a bit for initialization
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                throw error;
            }
        }
    }

    async listUserRepos(): Promise<{ name: string; full_name: string; private: boolean }[]> {
        try {
            const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
                visibility: 'all',
                sort: 'updated',
                per_page: 100
            });
            return data.map((repo: any) => ({
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private
            }));
        } catch (error) {
            logger.error({ error }, 'Failed to list GitHub repositories');
            throw error;
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
