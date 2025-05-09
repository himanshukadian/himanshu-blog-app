module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.md$/,
    type: 'asset/source'
  });
  return config;
}; 