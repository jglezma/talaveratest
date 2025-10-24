module.exports = {
  default: {
    require: ['tests/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'json:cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};