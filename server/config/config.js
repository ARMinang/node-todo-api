var env = process.env.NODE_ENV || 'development'

if (env === 'development' || env === 'test') {
  config = require('./config.json')
  envConfig = config[env]
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  })
}