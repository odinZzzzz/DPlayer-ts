# DPlayer ts 弹幕库

> 弹幕库 for [DPlayer](https://github.com/DIYgod/DPlayer)\
> 更新各种依赖库的版本到最新 \
> 只用了mongo 暂未使用redis \
> 弃用了docker

## 使用方法

### 快速开始

```shell
npm install  //安装依赖 淘宝镜像 --registry=https://registry.npmmirror.com/
npm run build //编译

cd dist && node index  //启动方式1
//或
cd dist && pm2 start index //启动方式2 持久化
```

### 配置文件

> src/config.ts

### bili额外弹幕
> /v3/bilibili?bvid=BVq1w2we3r4 \
/v3/bilibili?cid=12345678



## DPlayer-node 的Ts版本方便魔改 哈哈哈 

[DPlayer-node ©](https://github.com/MoePlayer/DPlayer-node)

