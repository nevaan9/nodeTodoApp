let env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    // Load the config file; (This is not included in github)
    let config = require('./config.json');
    let configEnv = config[env];

    Object.keys(configEnv).forEach((key) => {
        process.env[key] = configEnv[key];
    })
}
