# 月相日记

独立 Cloudflare Worker + D1 服务。公开 Jekyll 网站仅放入口，敏感记录不进入 Git 仓库。界面包含纪念日解锁、一次性设备授权、经期开始/结束日期、备注、修改/删除、按已记录间隔计算的粗略参考日期和设备撤销。

## 已创建资源

- 页面：https://our-moon-diary.zhuxycs.workers.dev/
- Worker：our-moon-diary
- D1：moon-diary（绑定名称必须为 DB）
- 数据库 ID：02f2e675-5fe2-46c0-a850-d807873a4077

## 首次启用

1. 打开本机 `setup.html`（通过 localhost 服务访问，以支持 Web Crypto），亲自填写纪念日并生成配置。
2. Cloudflare Worker → Settings → Variables and Secrets → Add，Type 选 Secret，Name 填 CONFIG，Value 填生成的 JSON，保存并部署。
3. 打开线上页面，填写日期和生成的一次性授权码，授权自己的第一台设备。
4. 登录后可生成一小时内有效的一次性授权码，在对方设备上手动使用。
5. 保存 CONFIG 的私密备份并关闭配置页。DATA_KEY 一旦更换，旧记录无法用新密钥解密。不要把配置、授权码或真实记录提交到 Git。

CONFIG 包含 ANSWER_DIGEST（规范 YYYY-MM-DD 的 SHA-256）、BOOTSTRAP_DIGEST（随机首台设备授权码的 SHA-256）、DATA_KEY（32 字节随机 AES 密钥的 base64）。答案不内置在代码中。

## 安全边界

- 正确日期不足以授权陌生设备，需随机 256 位一次性授权码；设备 Cookie 180 天有效。
- 会话和设备 Cookie 为 Secure / HttpOnly / SameSite=Strict / __Host-，数据库只保存凭证哈希。
- 每次读取、修改、删除和分享都在服务端检查设备与会话。会话最多 8 小时，20 分钟无 API 活动失效；前端 5 分钟无操作或进入后台立即清空内容并发起服务端锁定。断网或浏览器强杀时锁定请求不能保证到达，仍由后端过期时间兜底。
- 解锁限制为每 IP 每小时 10 次、全站每小时 100 次，含成功尝试；写入每设备每分钟 30 次。限流使用 D1 原子计数。
- 写接口只接受同源 Origin 与 JSON。CORS 或隐藏入口不能替代鉴权。
- 日期与备注在应用中用 AES-256-GCM 加密，D1 保存密文。服务端持有密钥，因此这不是端到端加密，Cloudflare 账号管理员和受信任的服务端仍有解密能力。
- 页面与 API 均 no-store、noindex；不使用第三方脚本、字体或统计；备注通过 textContent 渲染。
- 两台设备拥有相同权限。授权过期、清除 Cookie 或撤销设备后，重新授权。若所有设备丢失，管理员可通过更新 BOOTSTRAP_DIGEST 恢复，必须保留原 DATA_KEY。
- 当前记录列表最多返回最近更新的 500 条。参考日期是已记录开始日期平均间隔的简单计算，不用于医疗判断。
- 删除会删掉当前数据库记录，但托管平台备份可能保留历史副本；不保证立即抹除所有备份。

## 开发与部署

Node 22.13+（测试使用 node:sqlite）。运行 `npm install` 后使用 `npm run dev` / `npm run deploy`。数据库初始化：`npx wrangler d1 execute moon-diary --remote --file schema.sql`。本地测试配置放 `.dev.vars`，生产用 `wrangler secret put CONFIG`，这些文件已忽略。

`node build-dashboard.mjs` 将页面、样式和脚本打包为 `dashboard-worker.js`，便于直接在 Cloudflare 编辑器部署。它不包含任何密钥或真实记录，生成文件已忽略。

测试：`node --test tests/*.test.mjs`。集成测试使用内存 SQLite 和虚构日期，验证鉴权、加密读写、锁定、邀请一次性、撤销、过期、CSRF 与限流。
