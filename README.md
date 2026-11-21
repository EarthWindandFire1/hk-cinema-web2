# Beyond the Golden Age / web2

基于 `D:\Python\ymy\web` 原Demo改造的五章演讲型网站。本地静态项目，无需npm、Python依赖或构建步骤。

## 在线访问与更新

- 网站：[Beyond the Golden Age](https://earthwindandfire1.github.io/hk-cinema-web2/)
- 公开仓库：[GitHub](https://github.com/EarthWindandFire1/hk-cinema-web2)
- GitHub Pages发布来源：`main` 分支的根目录 `/`；`.nojekyll`保留静态文件。
- 修改后运行 `node verify.cjs`，再提交并推送到`main`；Pages将自动重新部署。
- 本地直接打开方式仍然有效；不要提交登录凭据或`.env`文件。

## 打开

直接双击 `index.html` 即可使用。图表库、数据、影院照片和电影海报均保存在项目内；Google Fonts不可用时自动使用系统字体。网站不依赖外部数据接口。

也可在此目录运行 `python -m http.server 8022 --bind 127.0.0.1`，浏览器访问 `http://127.0.0.1:8022`。

## 演示

左侧五个按钮分页，也支持左右方向键、底部上一章/下一章和URL hash直达。页面内容可上下滚动。Fullscreen可进入全屏，Speaker cues显示逐图中文提示。[presentation.md](presentation.md)是8分钟配套文稿。

保留四张主要图、六张证据图与可排序、分页的电影表。筛选作用于产量、类型、评分关注散点和电影表；合作网络与证据图明确标记为固定。默认年代1950s—2020s。

## 相对原Demo的修正

- 年代上界包含整个所选年代，修复只算到2020年、漏算2021—2026的问题。
- 不把2,880报告口径冒充本地数据量：保留原 `data.js` 的2,876条，其中1950—2026年有2,855条、2,769条带评分；其余21条早于1950年。
- 产量与评分采用独立纵轴面板。类型图标签明确为全部类型标签中的占比，并基于当前筛选重算。
- 全年代网络保持原900节点投影，不宣称网络响应筛选，也不把节点投影称为显示了全部连线的网络图。
- 最新2026奖项只用作开场；历史奖项图保留原始截至2025年的数据。
- 表格显示所有符合筛选且带评分的电影，分页8条，点击列名排序。

## 文件

- `index.html` / `style.css` / `app.js`：界面、视觉与交互。
- `data.js`：原Demo数据，未改写。
- `hk_logic.js`：原Demo计算逻辑及年代边界修复。
- `plotly.min.js`：本地图表运行库。
- `assets/`：真实电影海报、影院照片，来源见 `sources.md`。
- `presentation.md`：逐图演讲文稿与时间安排。
- `verify.cjs`：验证数据边界与10张图保留情况，运行 `node verify.cjs`。
