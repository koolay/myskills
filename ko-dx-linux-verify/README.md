# ko-dx-linux-verify

用本地 smolvm microVM 验证真正依赖 Linux 的行为，同时把可原生完成的快速检查留在 macOS。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

必须在 Linux 验证，macOS 与 Linux CI 行为不同，或需要本地复现 Linux 容器、文件系统、内核及 Kubernetes 语义。

## 使用示例

```text
使用 ko-dx-linux-verify 复现 CI 的 Linux 文件权限失败。先读取仓库测试说明，确认 host、guest 和 CI 架构，只跑相关检查，并区分环境故障与产品缺陷。
```

## 输入与产出

- **输入：** 仓库和测试入口、失败记录；可选目标镜像、发行版、架构、网络、端口和 CI 命令。
- **产出：** 可复查的宿主与 guest 环境、镜像版本、资源、mount / network / port、命令退出码、产物和失败分类。

## 执行流程

1. 判断哪些检查确实需要 Linux，文件系统语义在 guest 磁盘验证。
2. 读取本机 smolvm 帮助，确认 Hypervisor 能力、镜像和 host / guest / CI 架构。
3. 优先一次性 machine，使用窄范围只读挂载，网络默认关闭，端口仅 loopback。
4. 运行最小命令、保留证据，只清理本次创建的资源，分类环境、测试、产品或未知失败。

## 边界与前提

需要可运行的 smolvm 和匹配目标的环境。禁止向 guest 挂载宿主 Docker socket；Docker API 测试使用 guest 内 daemon。凭据、SSH agent 和宽泛可写挂载不默认开放。本地 VM 不代表生产多租户安全隔离。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
