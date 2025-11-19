module.exports = {
  apps: [
    {
      name: 'seobooster-api',
      cwd: __dirname,
      script: 'npm',
      args: 'run start:api',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '512M'
    },
    {
      name: 'seobooster-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run start:web',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '512M'
    },
    {
      name: 'seobooster-worker',
      cwd: __dirname,
      script: 'npm',
      args: 'run start:worker',
      env: {
        NODE_ENV: 'development',
        PROJECT_ROOT: '/var/www/seobooster'
      },
      env_production: {
        NODE_ENV: 'production',
        PROJECT_ROOT: '/var/www/seobooster'
      },
      max_memory_restart: '512M'
    }
  ]
};

