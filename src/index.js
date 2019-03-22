require('file-loader?name=[name].[ext]!./index.html');

import Commander from './main';
window.runner = new Commander();