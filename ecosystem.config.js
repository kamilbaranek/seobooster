module.exports = {
  apps: [
    {
      name: 'seobooster-api',
      cwd: __dirname,
      script: 'dist/apps/api/src/main.js', // přímo Node app, žádné npm uvnitř
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: __dirname,
        PORT: 3333,
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: '/var/www/seobooster',
        PORT: 3333,
      },
      max_memory_restart: '512M',
    },
    {
      name: 'seobooster-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run start:web', // Next.js klidně nech přes npm, je to ok
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: __dirname,
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: '/var/www/seobooster',
      },
      max_memory_restart: '512M',
    },
    {
      name: 'seobooster-worker',
      cwd: __dirname,
      script: 'dist/apps/worker/src/main.js', // opět přímo Node worker
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: __dirname,
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: '/var/www/seobooster',
      },
      max_memory_restart: '512M',
    },
  ],
};
