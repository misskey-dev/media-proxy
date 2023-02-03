# Media Proxy for Misskey

Misskeyの/proxyが単体で動作します。

## config.js

次のような内容で、設定ファイルconfig.jsをルートに作成してください。

```js
const package = require('./package.json');

module.exports = {
    userAgent: `MisskeyMediaProxy/${package.version}`,
    allowedPrivateNetworks: [],
    maxSize: 262144000,
    // proxy: 'http://127.0.0.1:3128'
}
```
