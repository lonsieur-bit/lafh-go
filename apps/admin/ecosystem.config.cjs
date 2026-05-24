/** Optional PM2 config if the panel uses pm2 instead of npm start */
module.exports = {
  apps: [
    {
      name: "luffa-admin",
      script: "server.mjs",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
