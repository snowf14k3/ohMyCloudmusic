# ohMyCloudmusic

基于 [Tauri 2](https://tauri.app/) 的网易云音乐桌面客户端，直接加载网易云音乐 Web Player，并补充系统托盘、无边框窗口、扫码登录、全局快捷键和封面 Mini 模式等桌面能力。

> 本项目是非官方客户端，与网易云音乐及杭州网易云音乐科技有限公司无关。

## 平台支持

| 平台 | 状态 | WebView |
| --- | --- | --- |
| Windows 10/11 | 支持 | Microsoft Edge WebView2 |
| Linux | 支持 | WebKitGTK 4.1 |

当前主要在 Windows 上开发和验证。Linux 的实际表现可能因发行版、桌面环境和 WebKitGTK 版本而不同。

## 功能

- 直接加载 `https://music.163.com/st/webplayer`
- 自定义 User-Agent，避免暴露桌面容器标识
- 无边框主窗口，并向网页导航栏注入窗口控制按钮
- 最小化、最大化、关闭到托盘和窗口拖动
- 封面 Mini 模式
  - 320 × 320 封面窗口
  - 始终置顶
  - 上一首、播放/暂停、下一首
  - 恢复主窗口
- 系统托盘
  - 显示或隐藏主窗口
  - 显示当前歌曲信息
  - 播放控制
  - 打开登录窗口
  - 退出应用
- 网易云音乐 App 扫码登录
  - 本地登录界面
  - Rust 端请求二维码登录接口
  - 授权成功后向主 WebView 写入登录 Cookie
- 单实例运行，再次启动时唤起已有窗口
- 记忆窗口大小、位置和最大化状态
- 轮询 MediaSession、音频元素和页面 DOM，同步歌曲与播放状态
- 全局播放快捷键

## 快捷键

| 快捷键 | 操作 |
| --- | --- |
| `Ctrl+Alt+P` | 播放/暂停 |
| `Ctrl+Alt+Left` | 上一首 |
| `Ctrl+Alt+Right` | 下一首 |

代码中还注册了 `Ctrl+Alt+Up` 和 `Ctrl+Alt+Down`，但当前网页播放器没有稳定的音量控制接口，因此暂不将其视为正式功能。

全局快捷键可能与系统或其他应用冲突。注册失败不会阻止客户端启动，但对应快捷键将不可用。

## 环境要求

通用依赖：

- [Node.js](https://nodejs.org/) 20 或更高版本
- [pnpm](https://pnpm.io/) 10
- [Rust](https://www.rust-lang.org/tools/install) stable

### Windows

需要安装：

- Visual Studio 2022 Build Tools
- “使用 C++ 的桌面开发”工作负载
- Windows 10/11 SDK
- Microsoft Edge WebView2 Runtime

Windows 10 和 Windows 11 通常已安装 WebView2 Runtime。项目生成的安装程序配置为使用 WebView2 bootstrapper。

### Linux

Linux 需要 WebKitGTK 和系统托盘相关开发包。Ubuntu/Debian 可执行：

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  curl \
  file \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  libxdo-dev \
  pkg-config \
  wget
```

其他发行版请安装对应的 WebKitGTK 4.1、AppIndicator、OpenSSL、GTK 和基础编译工具包。

## 开发

进入项目目录并安装依赖：

```bash
cd ohMyCloudmusic
pnpm install
```

启动开发版本：

```bash
pnpm dev
```

仅检查 Rust 代码：

```bash
cd src-tauri
cargo check
```

运行 Rust 测试：

```bash
cd src-tauri
cargo test
```

## 构建

执行完整构建：

```bash
pnpm build
```

`bundle.targets` 设置为 `all`，Tauri 会根据当前操作系统生成该平台支持的安装包。

常见输出位置：

```text
src-tauri/target/release/
src-tauri/target/release/bundle/
```

Windows 通常生成 NSIS/MSI 安装包，Linux 通常生成 DEB/AppImage 等当前环境支持的格式。Tauri 不支持在 Windows 上直接交叉生成 Linux 图形应用安装包，反之亦然；请在对应系统或 CI Runner 中分别构建。

## 使用

### 登录

1. 点击网页中的登录入口，或在托盘菜单中选择“登录”。
2. 使用网易云音乐 App 扫描弹窗中的二维码。
3. 在手机端确认授权。
4. 客户端写入登录 Cookie、关闭登录窗口并刷新主页面。

二维码登录请求通过网易云音乐 Web API 完成。接口发生变化时，登录功能可能需要同步调整。

### 托盘与退出

- 点击关闭按钮只会隐藏主窗口，不会退出应用。
- 单击托盘图标可以显示或隐藏主窗口。
- 再次运行程序会唤起已有实例。
- 如需完全退出，请使用托盘菜单中的“退出”。

### Mini 模式

点击注入到网页导航栏中的 Mini 按钮进入封面模式。窗口会缩放为 320 × 320 并保持置顶。将鼠标移到窗口底部可显示歌曲信息和播放控制，点击恢复按钮返回主窗口。

## 项目结构

```text
.
├─ src/
│  ├─ index.html          # Tauri 前端资源占位页
│  ├─ inject.js           # 注入网易云页面的窗口、媒体和 Mini 模式逻辑
│  └─ login.html          # 本地扫码登录界面
├─ src-tauri/
│  ├─ capabilities/       # Tauri 权限配置
│  ├─ icons/              # 桌面应用图标
│  ├─ src/
│  │  ├─ lib.rs           # 应用初始化、命令、窗口和快捷键
│  │  ├─ login.rs         # 登录窗口
│  │  ├─ media.rs         # 媒体状态
│  │  ├─ netease.rs       # 二维码登录 API 与二维码生成
│  │  └─ tray.rs          # 系统托盘及动态菜单
│  ├─ Cargo.toml
│  └─ tauri.conf.json
├─ package.json
└─ pnpm-lock.yaml
```

## 工作原理

### 主窗口

Rust 使用 `WebviewWindowBuilder` 创建无边框窗口并加载网易云 Web Player。`src/inject.js` 通过 Tauri initialization script 注入页面，负责窗口控件、Mini 模式、登录入口拦截、媒体状态读取和窗口状态持久化。

### 媒体状态

项目不修改 `MediaSession.prototype` 或 `HTMLAudioElement.prototype`。这类原型补丁可能导致部分 WebView2 版本崩溃。当前实现通过定时读取 MediaSession、音频元素和网页 DOM 获取歌曲信息及播放状态，并将状态发送给 Rust 更新托盘。

### 扫码登录

Rust 端请求网易云二维码登录接口并生成二维码。授权成功后，响应中的 Cookie 会写入主 WebView，随后刷新播放器页面。登录页是本地资源，不直接嵌入网易云完整登录页面。

## 已知限制

- 客户端依赖网易云音乐 Web Player 的页面结构和非公开 Web API，网页更新可能导致注入逻辑或扫码登录失效。
- 播放控制依赖 MediaSession、音频元素或网页按钮，不能保证在网易云所有页面状态下工作。
- 音量快捷键当前尚未可靠实现。
- 开机自启动插件已经接入，但尚未提供设置界面或托盘开关。
- Linux 的托盘、全局快捷键和窗口行为可能受 Wayland/X11、桌面环境与系统组件影响。
- 应用需要联网，离线播放和音乐下载不在当前范围内。
- 当前没有自动更新功能。

## 常见问题

### 再次运行后没有出现新窗口

应用采用单实例模式，并且关闭按钮默认隐藏到托盘。请检查系统托盘并单击应用图标，或从托盘菜单中选择“显示/隐藏窗口”。

### Windows 页面空白或 WebView 无法启动

确认 Microsoft Edge WebView2 Runtime 已安装并更新到较新版本。也可以先从托盘完全退出旧进程，再重新启动。

### Linux 无法编译 WebKitGTK

确认安装的是 WebKitGTK 4.1 开发包，而不是仅安装运行时。不同发行版的软件包名称可能不同。

### 全局快捷键无效

快捷键可能已被系统或其他应用占用。退出占用程序后重启客户端，使其重新注册快捷键。

### 扫码后没有登录

请刷新二维码后重试，并确认系统时间和网络正常。网易云登录接口或 Cookie 策略发生变化时，也可能需要更新客户端实现。

## 隐私与安全

- 登录凭据不会写入项目源码或仓库。
- 登录 Cookie 由 WebView 管理，用于保持网易云登录状态。
- 客户端会连接网易云音乐及其资源域名。
- 请勿将包含个人 Cookie、调试日志或本地构建产物的文件提交到仓库。

## 免责声明

本项目仅用于学习和个人使用。音乐内容、商标和服务由其对应权利人提供。使用本项目时请遵守网易云音乐服务条款、当地法律法规及内容版权要求。

本项目不提供音乐破解、付费内容绕过或下载功能。

## 贡献

欢迎提交 Issue 或 Pull Request。提交代码前建议至少执行：

```bash
cd src-tauri
cargo check
cargo test
```

涉及网页注入逻辑时，请同时在 Windows 和 Linux 上验证主窗口、扫码登录、托盘及关闭到托盘行为。
