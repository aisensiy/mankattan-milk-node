var fs = require('fs');
var nconf = require('nconf');

nconf.env();
nconf.defaults({
  'NODE_ENV': 'development'
})

nconf.add('global', {
  type: 'file',
  file: 'config/config.json'
});

nconf.add('custom', {
  type: 'file',
  file: 'config/config.' + nconf.get('NODE_ENV') + '.json'
});

nconf.load();
