# 脸书小助手 - Astro 版本

专为 Facebook 注册设计的身份生成工具,现已迁移至 Astro 框架。

## 主要变更

### 技术栈迁移
- ✅ 从 **Next.js** 迁移至 **Astro 5**
- ✅ 保留 React 组件(通过 Astro Islands)
- ✅ 使用 **Vercel Edge Functions** 适配器
- ✅ 改进的服务器端渲染性能

### IP 检测优化
- ✅ 简化为使用 **单一可靠的第三方 API** (ip-api.com)
- ✅ 移除多服务竞速策略,提高响应速度
- ✅ 优化缓存机制
- ✅ 免费且稳定(每月 45 请求/分钟限制)

### 性能优化
- 更快的首屏加载速度
- 更小的 JavaScript 包体积
- 服务器端渲染优化
- 边缘函数部署支持

## 项目结构

```
├── src/
│   ├── components/      # React 组件
│   │   ├── MainApp.tsx         # 主应用
│   │   ├── MailPage.tsx        # 临时邮箱页面
│   │   ├── FavoritesPage.tsx   # 收藏页面
│   │   ├── NavigationMenu.tsx  # 导航菜单
│   │   ├── SharedBackground.tsx# 背景组件
│   │   └── FreeNoticeModal.tsx # 免费提示弹窗
│   ├── layouts/         # Astro 布局
│   │   └── Layout.astro        # 主布局
│   ├── lib/            # 工具库
│   │   ├── generator.ts        # 信息生成器
│   │   ├── countryData.ts      # 国家数据
│   │   ├── domains.ts          # 邮箱域名
│   │   ├── mailData.ts         # 邮箱数据管理
│   │   └── backgroundContext.tsx # 背景上下文
│   ├── pages/          # Astro 页面
│   │   ├── index.astro         # 首页
│   │   ├── mail/
│   │   │   ├── index.astro    # 临时邮箱页面
│   │   │   └── favorites.astro # 收藏页面
│   │   └── api/
│   │       └── ip-info.ts     # IP 检测 API
│   └── styles/         # 全局样式
│       └── globals.css
├── astro.config.mjs    # Astro 配置
├── tailwind.config.ts  # Tailwind 配置
└── tsconfig.json      # TypeScript 配置
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## API 端点

### IP 检测 API
- **路径**: `/api/ip-info`
- **方法**: GET
- **服务商**: ip-api.com
- **特性**:
  - 自动检测用户真实 IP
  - 支持代理和 CDN 环境
  - 5 分钟缓存
  - 地理位置信息(国家、城市、时区等)

## 部署

项目已配置 Vercel 适配器,可直接部署到 Vercel:

```bash
npm run build
```

构建后的文件会输出到 `.vercel/output` 目录,可直接上传到 Vercel。

## 主要功能

- ✅ 支持 30+ 国家/地区的身份信息生成
- ✅ 真实手机号格式(各国运营商号段)
- ✅ 智能密码生成(模拟真实用户习惯)
- ✅ 临时邮箱大全
- ✅ 收藏功能
- ✅ 响应式设计
- ✅ 移动端优化
- ✅ 触觉反馈

## 技术细节

### IP 检测实现
使用 ip-api.com 免费服务:
- 无需 API Key
- 支持 IPv4/IPv6
- 精确到城市级别
- 包含时区、地区信息
- 自动处理私有 IP 和代理

### React Islands
关键交互组件使用 React,通过 Astro Islands 模式按需加载:
- `client:load` - 页面加载时立即加载
- `client:only` - 仅在客户端渲染

## 浏览器兼容性

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动浏览器支持

## 许可证

MIT

## 联系方式

Telegram: [@fang180](https://t.me/fang180)
