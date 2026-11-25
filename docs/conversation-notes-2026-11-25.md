# 电影资讯小程序项目对话记录

保存日期：2026-11-25  
项目目录：`D:\Users\Administrator\Desktop\codex_work\movie-info-miniapp`

> 本文档是本次对话和当前项目状态的结构化记录，不包含密码、AppSecret、
> 云服务 Secret 或 Git 登录令牌。

## 1. 初始需求

原始课程文档：

`D:\Users\Administrator\Desktop\《移动应用系统开发课程期末考核》实施方案-教师版.doc`

文档中“电影资讯小程序”的核心要求：

- 使用 Vue 3 + uni-app。
- 首页包含正在热映、即将上映、轮播图、趋势榜和高分榜入口。
- 片库支持类型、年代、评分筛选、列表切换和分页加载。
- 详情页包含剧情、演职员、预告片、剧照、短评和收藏。
- 我的页面包含用户信息、收藏、浏览历史、短评和清空缓存。
- 支持路由跳转、下拉刷新、上拉加载和本地存储。
- TMDB 作为电影资料数据源。

原 `.doc` 文档只读取，没有修改。

## 2. 技术选型

- 前端框架：Vue 3 Composition API。
- 跨端框架：uni-app。
- H5 构建：Vite + uni-app。
- 微信小程序：微信开发者工具。
- 云函数与数据库：uniCloud 支付宝云。
- 本项目包管理：npm。

本机开发环境：

- Node.js：`v24.21.0`
- npm：`11.19.0`
- HBuilderX：`5.34.2026102909`
- Git：`2.56.0`
- 微信开发者工具：Stable `v2.01.2510260`

## 3. 项目实现

已实现页面：

- 首页：`src/pages/index/index.vue`
- 片库：`src/pages/library/library.vue`
- 搜索：`src/pages/search/search.vue`
- 详情：`src/pages/detail/detail.vue`
- 我的：`src/pages/profile/profile.vue`

已实现功能：

- 热映轮播、趋势榜和高分电影片单。
- 类型、年代、评分筛选。
- 网格/列表切换和分页加载。
- 搜索记录和电影搜索。
- 收藏、浏览历史、用户短评和清空本地数据。
- 图片失败时的排版封面回退。
- 无 TMDB Key 时使用本地演示电影数据。

常用命令：

```powershell
npm run dev:h5
npm run build:h5
npm run dev:mp-weixin
npm run build:mp-weixin
```

构建产物：

```text
dist/build/h5
dist/build/mp-weixin
```

## 4. GitHub 与 H5 部署

GitHub 账号：

```text
Xue-gcc
```

Git 仓库：

```text
https://github.com/Xue-gcc/movie-info-miniapp
```

源码分支：

```text
main
```

H5 Pages 分支：

```text
gh-pages
```

H5 线上地址：

```text
https://xue-gcc.github.io/movie-info-miniapp/
```

GitHub Pages 只用于 H5，不是微信小程序的正式部署方式。

## 5. 微信小程序

微信小程序 AppID：

```text
wxb5004cac1abf9727
```

微信开发者工具中已成功完成：

- 正式 AppID 预览。
- 开发版本上传。
- 已上传版本包括 `1.0.0` 和 `1.0.1`。

本地小程序构建目录：

```text
dist/build/mp-weixin
```

项目已使用微信小程序原生 `<video>`，不再跳转 YouTube。

## 6. 国内预告片与 uniCloud

因为无法使用 YouTube，预告片改为国内视频地址和 uniCloud 云函数。

支付宝云服务空间：

```text
movie-info-trailer
env-00jy738nelvg
```

云开发目录：

```text
uniCloud-alipay
```

云端已上传：

- 云函数：`getMovieTrailer`
- 数据集合：`movie_trailers`
- 数据表 Schema：`movie_trailers.schema.json`

前端调用顺序：

1. `uniCloud.callFunction({ name: 'getMovieTrailer' })`
2. `VITE_MEDIA_API_BASE` 指定的国内媒体接口
3. 只有显式配置 `VITE_DEMO_TRAILER_URL` 时才使用演示视频

当前数据库集合为空，因此真实电影页会显示“预告片暂未配置”，不再播放无关演示视频。

## 7. 预告片数据结构

云数据库 `movie_trailers` 记录示例：

```json
{
  "movieId": "693134",
  "title": "沙丘2",
  "playUrl": "https://video-cdn.example.com/dune-part-two.mp4",
  "poster": "https://video-cdn.example.com/dune-part-two-cover.jpg",
  "provider": "uniCloud 云存储",
  "duration": 150,
  "enabled": true,
  "updatedAt": 1764050000000
}
```

注意：

- 视频应放在 uniCloud 云存储、腾讯云 VOD、阿里云 OSS 或其他国内 CDN。
- 云函数只返回播放地址，不传输视频文件。
- 视频内容必须具有合法使用权。
- 视频域名和封面域名需要在微信公众平台配置为合法域名。

## 8. 当前状态

已完成：

- uni-app Vue 3 源码。
- H5 构建和 GitHub Pages。
- 微信小程序构建、预览和开发版本上传。
- 支付宝云服务空间绑定。
- `getMovieTrailer` 云函数上传。
- `movie_trailers` 数据集合和 Schema 创建。
- 前端已接入云函数调用。
- H5 和微信小程序构建均能识别服务空间 `env-00jy738nelvg`。

待完成：

- 录入每部电影的真实国内预告片 `playUrl` 和封面。
- 在微信公众平台配置视频/CDN 合法域名。
- 用真实预告片测试云函数成功返回的播放流程。
- 将包含 uniCloud 调用的最新小程序版本重新上传或设为体验版。
- 正式上线前提交微信审核。

## 9. 安全说明

- 当前不需要微信小程序 AppSecret。
- 微信 CI/服务端登录、`code2Session`、部分云服务 API 才可能需要额外 Secret。
- 密码、AppSecret、云服务 Secret 和 Git 令牌不得写入前端源码或本文档。
- GitHub 登录凭证保存在 Git Credential Manager 中。

## 10. 原文档状态

原始 Word 文档没有被修改。

核对时：

- 文件大小：`144021` 字节
- 最后修改时间：`2026/11/25 16:55:52`
