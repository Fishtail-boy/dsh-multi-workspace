# dsh-multi-workspace (fork)

给 DeepSeek Harness 的工作区挂**多个项目文件夹**：第一个选中的文件夹是不可变的原生工作区根，插件记录全部附加文件夹，并指定其中一个作为模型上下文里的主项目。

> 本仓库是 [zhanghd/dsh-multi-workspace](https://github.com/zhanghd/dsh-multi-workspace) 的 fork，补上了 **DSH 0.2.1-rc.5 的兼容性修复**和**独立构建**，并附带预构建产物。插件行为与上游一致。

## 为什么需要这个 fork

上游仓库是 DSH monorepo 里的源码切片，直接装不了：

- 没有发布到 npm，也没有 GitHub Release 预构建包；
- 没有 `prepare` 脚本——DSH 官方文档明确写了 `dsh plugin add github:...` 只会拿到源码、不会执行构建，TypeScript 包到手就是没有 `lib/` 的空壳；
- 依赖全是 `workspace:^`，`tsconfig` 继承 `../../../../tsconfig.base.json`，客户端产物还要用 monorepo 内的 `packages/client/tsdown.client.ts` 生成——离开 DSH 源码树编译不出来；
- 而且它是照着**另一版 DSH API** 写的，在 0.2.1-rc.5 上编译不过、跑起来也会抛错。

本仓库解决了以上全部问题，改动见 [CHANGES.md](./CHANGES.md)。

## 功能

> 在 DSH 0.2.2-rc.1 桌面端实测：`+` 或工作区菜单里的「新建多文件夹项目…」会打开多文件夹对话框，
> 可添加任意多个目录、指定主项目，创建后附加目录会进入模型上下文。

- 侧边栏 **Add workspace → Add workspace...**：选一个原生根目录 + 任意多个附加文件夹，可命名、可指定主项目；
- 工作区行的 **⋯ 菜单 → Edit project**：事后改名、增删文件夹、切换主项目；
- 附加文件夹会注入模型上下文（主项目路径 + 附加文件夹清单），并加入可写根；
- 保存映射**不会**创建/删除/修改任何项目文件；卸载后原生工作区和项目文件原样保留。

## 安装

已针对 **DSH 0.2.1-rc.5**（桌面端）验证。仓库里带预构建 `lib/`，**不需要构建**。

```sh
git clone https://github.com/<you>/dsh-multi-workspace.git
cd dsh-multi-workspace

dsh plugin --profile <profile> add \
  "link:$PWD" \
  "link:$PWD/packages/client" \
  "link:$PWD/packages/host"
```

Windows PowerShell：

```powershell
$r = "C:/path/to/dsh-multi-workspace"
dsh plugin --profile desktop add "link:$r" "link:$r/packages/client" "link:$r/packages/host"
```

装完**重启 DSH**（bundle 列表只在启动时读取）。

验证：

```sh
dsh --profile <profile> --dump-config | grep multi-workspace
```

应看到 `# == dsh-multi-workspace` 一层，以及它把 `@deepseek-ai/dsh-web-app` 的
`directory-picker` 行禁用、插入三个新行。

## 自行构建

需要 Node.js 22+ 与 pnpm 11：

```sh
pnpm install
pnpm build
```

`pnpm build` 依次构建 host、client（走 `vendor/dsh-build/` 里 vendored 的 DSH 客户端打包预设）和根包。

## 卸载

```sh
dsh plugin --profile <profile> remove dsh-multi-workspace \
  dsh-multi-workspace-client dsh-multi-workspace-host
```

插件的映射存在 `$DSH_HOME/multi-workspaces.json`，需要的话一并删除。原生工作区与项目文件不受影响。

## 目录结构

```
.
├── cordis.patch.yml              # bundle 层：禁用内置 directory-picker，插入三行
├── lib/                          # 根包产物（预构建，已提交）
├── packages/
│   ├── client/                   # 浏览器半边（目录流 UI + remote 客户端）
│   └── host/                     # Node 半边（映射持久化 + 模型上下文注入）
├── vendor/dsh-build/             # vendored DSH 客户端打包预设（MIT，仅构建期）
└── CHANGES.md                    # 相对上游的全部改动
```

## 兼容性

| DSH | 状态 |
| --- | --- |
| 0.2.2-rc.1 | **已验证**：新建多文件夹项目、编辑项目、模型上下文注入 |
| 0.2.1-rc.5 | 已验证构建；客户端槽位接管需 0.2.2 |

**已知限制（0.2.2-rc.1）**：附加文件夹是**只读**的。0.2.2 移除了运行时注册可写根的接口，
沙箱只认启动时的静态配置，所以模型能读附加目录、能用绝对路径访问，但写入只能落在主项目目录。

DSH 版本不匹配时，`dsh` 会在启动阶段按 peer 依赖范围拒绝加载。

## 致谢

- 插件作者 [@skylarking](https://github.com/skylarking)，原始实现与设计说明见 [AGENT_NOTE.md](./AGENT_NOTE.md)；
- 构建预设来自 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（MIT）。

## License

MIT，见 [LICENSE](./LICENSE)。
