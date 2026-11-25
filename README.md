# 银幕电影资讯小程序

基于 Vue 3 与 uni-app 的电影资讯项目，覆盖首页、片库、搜索、电影详情和个人中心。

## 已实现功能

- 首页热映轮播、正在热映、趋势榜和即将上映片单
- 片库类型、年代、评分筛选，网格/列表切换和分页加载
- 电影详情、剧情、演职员、预告片入口、剧照和短评
- 收藏、浏览历史、本地短评和数据清理
- TMDB API 数据层，以及无 Key 时可运行的本地演示数据
- 微信小程序与 H5 共用页面和组件

## 目录结构

```text
components/          通用组件
data/                本地电影数据
pages/               页面
services/            TMDB 数据服务
styles/              全局视觉样式
utils/               本地存储和格式化工具
static/              静态资源
```

## 本地运行

### HBuilderX

1. 使用 HBuilderX 打开项目目录。
2. 运行到浏览器即可预览 H5。
3. 运行到微信开发者工具即可调试小程序。

也可以使用标准 CLI：

```powershell
npm run dev:h5
```

### 构建 H5

执行标准生产构建：

```powershell
npm run build:h5
```

构建结果位于：

```text
unpackage/dist/build/h5
```

在 HBuilderX 中也可以选择“发行 -> 网站-H5手机版”。

HBuilderX 命令行发行方式：

```powershell
& "D:\Users\Administrator\Desktop\HBuilderX\cli.exe" publish web --project "D:\Users\Administrator\Desktop\codex_work\movie-info-miniapp" --webTitle "银幕电影资讯"
```

## TMDB 配置

项目默认读取本地演示数据。配置 Key 后会自动优先请求 TMDB：

1. 复制 `.env.example` 为 `.env.local`。
2. 填写 `VITE_TMDB_API_KEY`。
3. 重新构建 H5 或重新运行项目。

开发阶段也可以在 HBuilderX 控制台执行：

```js
uni.setStorageSync('tmdb_api_key', '你的 TMDB v3 API Key')
```

公开 H5 中的 Key 会出现在前端构建产物里，仅适合课程和非商业用途。需要保密时应增加服务端代理。

## 国内预告片接口

配置 `.env.local`：

```text
VITE_MEDIA_API_BASE=https://media-api.example.com/api
```

详情页会请求：

```text
GET {VITE_MEDIA_API_BASE}/movies/{movieId}/trailer
```

接口返回示例：

```json
{
	"playUrl": "https://video.example.com/trailers/movie.mp4",
	"poster": "https://video.example.com/trailers/movie-cover.jpg",
	"provider": "腾讯云点播",
	"duration": 150
}
```

页面使用微信小程序原生 `<video>` 播放，不再跳转 YouTube。未配置国内媒体接口时，
页面会显示“预告片暂未收录”。如需播放演示视频，可以显式配置
`VITE_DEMO_TRAILER_URL`。

正式使用自有视频时，需要在微信公众平台配置对应的 `request` 和
`downloadFile` 合法域名。

### uniCloud 云函数

项目已内置：

```text
uniCloud-alipay/cloudfunctions/getMovieTrailer
uniCloud-alipay/database/movie_trailers.schema.json
```

使用前需要：

1. 在 HBuilderX 中登录 DCloud 账号。
2. 创建并绑定 uniCloud 服务空间。
3. 上传 `getMovieTrailer` 云函数。
4. 上传 `movie_trailers` 数据表结构。
5. 在集合中录入每部电影的真实国内预告片记录。

前端会优先调用 `uniCloud.callFunction`；云函数不可用时，再尝试
`VITE_MEDIA_API_BASE` 指定的国内媒体接口。

## 微信小程序

生成微信小程序构建：

```powershell
npm run build:mp-weixin
```

构建结果位于：

```text
dist/build/mp-weixin
```

使用微信开发者工具导入该目录即可在微信小程序模拟器中预览。

当前微信小程序 AppID：

```text
wxb5004cac1abf9727
```

如需切换到其他微信小程序，请同步修改 `src/manifest.json` 中的
`mp-weixin.appid`。

## 部署路径

`manifest.json` 已按 GitHub 仓库名 `movie-info-miniapp` 配置：

```text
/movie-info-miniapp/
```

如果 GitHub 仓库名不同，需要同步修改 `h5.router.base` 和 `h5.publicPath`。

## 当前状态

项目已部署到 GitHub Pages：

```text
https://xue-gcc.github.io/movie-info-miniapp/
```

GitHub 仓库：

```text
https://github.com/Xue-gcc/movie-info-miniapp
```

Pages 发布源为 `gh-pages` 分支根目录。
