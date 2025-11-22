# subconverter-snippet

Clash <-> Link 订阅转换工具

## 这是用来干什么的?

就一个功能: **Clash 配置** 和 **节点链接** 互转

比如这是 Clash 配置:

```yaml
# 已脱敏
proxies:
- name: 这是名字
  type: vless
  server: 这是服务器
  port: 11451
  uuid: 这是UUID
  network: tcp
  tls: true
  skip-cert-verify: false
  servername: www.example-servername-cannot-use.com
  client-fingerprint: chrome
  flow: xtls-rprx-vision
  reality-opts:
    public-key: 这是PubKey
```

可以用本工具来转为分享链接:

```url
vless://这是UUID@这是服务器:11451?type=tcp&encryption=none&flow=xtls-rprx-vision&security=reality&sni=www.example-servername-cannot-use.com&fp=chrome&pbk=%E8%BF%99%E6%98%AFPubKey#%E8%BF%99%E6%98%AF%E5%90%8D%E5%AD%97
```

当然, 你也可以将分享链接转换回 Clash 配置的格式.

## 支持的协议

