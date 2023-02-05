# Media Proxy for Misskey

Misskeyの/proxyが単体で動作します（Misskeyのコードがほぼそのまま移植されています）。

**Fastifyプラグインとして動作する気がします。**  
`pnpm start`は[fastify-cli](https://github.com/fastify/fastify-cli)が動作します。

## セットアップ方法
まずはgit cloneしてcdしてください。

```
git clone https://github.com/misskey-dev/media-proxy.git
cd media-proxy
```

### pnpm install
```
NODE_ENV=production pnpm install
```

### config.jsを追加

次のような内容で、設定ファイルconfig.jsをルートに作成してください。

```js
import { readFileSync } from 'node:fs';

const repo = JSON.stringify(readFileSync('./package.json', 'utf8'));

export default {
    // UA
    userAgent: `MisskeyMediaProxy/${package.version}`,

    // プライベートネットワークでも許可するIP CIDR（default.ymlと同じ）
    allowedPrivateNetworks: [],

    // ダウンロードするファイルの最大サイズ
    maxSize: 262144000,

    // フォワードプロキシ
    // proxy: 'http://127.0.0.1:3128'
}
```

### サーバーを立てる
適当にサーバーを公開してください。  
（ここではmediaproxy.example.comで公開するものとします。）

メモ書き程度にsystemdでの開始方法を残しますが、もしかしたらAWS Lambdaとかで動かしたほうが楽かもしれません。  
（サーバーレスだとsharp.jsが動かない可能性が高いため、そこはなんとかしてください）

systemdサービスのファイルを作成…

/etc/systemd/system/misskey-proxy.service

エディタで開き、以下のコードを貼り付けて保存（ユーザーやポートは適宜変更すること）:

```systemd
[Unit]
Description=Misskey Media Proxy

[Service]
Type=simple
User=misskey
ExecStart=/usr/bin/npm start
WorkingDirectory=/home/misskey/media-proxy
Environment="NODE_ENV=production"
Environment="PORT=3000"
TimeoutSec=60
StandardOutput=journal
StandardError=journal
SyslogIdentifier=media-proxy
Restart=always

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable misskey-proxy
sudo systemctl start misskey-proxy
```

3000ポートまでnginxなどでルーティングしてやります。

### Misskeyのdefault.ymlに追記

mediaProxyの指定をdefault.ymlに追記し、Misskeyを再起動してください。

```yml
mediaProxy: https://mediaproxy.example.com
```
