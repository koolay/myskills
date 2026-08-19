---
name: ko-dx-linux-verify
description: "Use when a macOS developer needs to validate Linux-specific behavior, reproduce a macOS/Linux discrepancy, or run a Linux-only container or Kubernetes check locally with smolvm."
---

# macOS 上的 Linux 验证

**Goal:** 在 macOS 上把真正依赖 Linux 语义的检查放进本地 smolvm microVM，保留能在 macOS 原生完成的快速检查。输出可复现的验证记录、失败分类和下一步。

**Use when:** 用户明确说“必须在 Linux 验证/测试”、本地 macOS 与 CI/Linux 行为不一致、需要验证 Linux kernel/filesystem/container/Kubernetes 语义，或需要在不依赖远程 Linux 主机的情况下复现 Linux-only 问题。

**Do not use when:** 只是普通单元测试、纯 macOS 行为、已有稳定的远程 CI 执行流程，或用户需要生产级多租户隔离；后者应使用正式 CI/云运行时并另做安全评估。

## Inputs

- **primary_input** - 要验证的命令、测试目标、失败日志或测试脚本。
- **repository** (required) - 当前仓库路径及其构建/测试说明。
- **context** (optional) - 目标 Linux 发行版、host/guest/CI 架构、容器镜像、网络需求、端口、CI 命令和已知限制。
- **scope** (optional) - 默认只运行最小相关 Linux 检查，不重跑整个测试套件。

## Execution

### Phase 1: 判断是否真的需要 Linux

1. 先读取仓库的 `AGENTS.md`、README、构建文件和测试说明；确认正确的测试入口。
2. 把目标分成两类：
   - **macOS 原生**：纯业务逻辑、与内核无关的单元测试，留在宿主机快速运行。
   - **Linux guest**：Linux kernel API、`/proc`/`/sys`、glibc/musl、Linux 权限/owner、信号、cgroup/namespace、Linux 容器、systemd、Linux 网络栈、Kubernetes 或 Docker daemon 语义。
3. 如果用户只是想要“完整测试”，先在 macOS 原生跑能安全运行的部分，再明确列出必须进入 Linux guest 的剩余检查；不要把所有测试默认搬进 VM。
4. 文件系统语义需要在 guest 自己的磁盘上验证。不要把 macOS bind mount 当成 ext4/Linux guest 文件系统测试。

### Phase 2: 检查 smolvm 与测试环境

1. 检查宿主机、架构与工具版本：

   ```bash
   uname -a
   uname -m
   smolvm --version
   smolvm machine --help
   smolvm machine run --help
   ```

   CLI 参数随版本变化；以本机 `--help` 和 [local examples](https://smolmachines.com/docs/local/examples) 为准，不要凭记忆拼接参数。
2. 确认 macOS 的 Hypervisor.framework 能用；smolvm 二进制需要正确的 Hypervisor.framework entitlement。启动失败时先归类为宿主机/安装问题，不要把它误报为测试失败。
3. 选择目标镜像或现有 pack，并固定版本或 digest。先确认 host arch、guest arch 和 CI arch；默认使用匹配架构的镜像。无法确认架构或只能使用不匹配架构时先 HALT，除非用户明确要求验证跨架构行为。记录 CPU、内存、镜像 digest、smolvm 版本和 guest 的 `uname -a`/`/etc/os-release`。
4. 默认关闭 guest 网络。区分宿主侧拉取镜像/依赖与 guest 出站网络；只有 guest 确实需要 DNS、下载依赖或访问测试服务时才打开，并使用最窄的 hostname/CIDR allow-list。对 CDN 或动态 DNS 依赖，不把 hostname allow-list 当成稳定保证，优先预置依赖或固定可验证的端点。网络失败必须在报告中标为环境限制。

### Phase 3: 创建最小、可复现的 guest

1. 优先使用一次性的 `machine run`；需要在代码中集成时再使用本地 SDK 的 `target: "local"`（或 Python 的 `target="local"`）在进程内启动 machine。SDK 已包含本地 runtime、boot helper 和 guest root filesystem，不需要先启动 `smolvm serve` daemon。参见 [local SDK](https://smolmachines.com/docs/sdk/with-local)。
2. 只把仓库需要的目录以绝对路径挂入 `/workspace`，默认只读；把测试产物挂到单独的 writable 输出目录。Writable mount 产生的文件可能按 guest 用户（包括 root）写回宿主机，结束后检查 owner 和权限。
3. 如果使用 CLI，先用本机帮助确认 `machine run`、mount、network、port 和 cleanup 的参数，再执行等价命令。传输方式按文件大小和实测成本选择 `machine cp` 或 volume mount，不使用固定容量阈值。
4. 只有测试确实调用 Docker API、Testcontainers、Compose 或构建镜像时，才使用 [Docker-in-a-machine](https://smolmachines.com/docs/guides/docker-in-a-machine)。Docker daemon 应运行在 guest 内；本 skill 永不把宿主机 Docker socket 挂给 guest。用户明确要求此做法时也先 HALT，因为它授予 guest 宿主 Docker daemon 的高权限；改用 guest 内 daemon。
5. 发布 guest 端口时默认只绑定宿主 loopback；如果当前 CLI/SDK 无法限制宿主暴露面，先 HALT，不要直接公开端口。
6. Kubernetes 测试优先使用一次性 machine 内的 k3s/k3d 集群；k3d 若需要 Docker API，遵守 guest 内 daemon 规则。VM-per-pod runtime shim 是实验性能力，必须单独记录版本和兼容性，不把它当作稳定默认路径。参见 [Kubernetes in a microVM](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm)。

### Phase 4: 执行、收集和清理

1. 在 guest 内先打印环境证据，再运行最小测试命令：

   ```bash
   uname -a
   uname -m
   cat /etc/os-release
   <build-or-test-command>
   ```

2. 保留退出码、stdout/stderr、测试报告、镜像 digest、端口映射、是否启网和关键 mount 列表。不要把整份日志原样塞进最终回答；提取失败测试和首个根因。
3. 优先用一次性 `machine run` 或唯一临时名称。若使用持久 machine，先记录本次创建的名称和归属；发现同名已有 machine 时 HALT，不覆盖、不停止、不删除。用 `trap`、SDK 的 `try/finally` 或等价机制只清理本次调用成功创建的资源。用户提供的既有 machine 默认保留，除非用户明确要求停止或删除。
4. 将结果分为：
   - **environment failure**：smolvm、entitlement、镜像、网络、端口或依赖准备失败；
   - **test failure**：Linux guest 已启动且测试断言失败；
   - **product defect**：代码在 Linux 语义下确实表现错误；
   - **flaky/unknown**：证据不足，说明下一次最小复现需要什么。
5. 若测试失败，最多做一次同命令复跑来排除明显瞬态问题；不要通过放宽权限、打开所有网络或挂载整个主目录来“修复”失败。

### Phase 5: 输出验证报告

使用下面的固定结构；命令、版本和限制必须可复查。

```markdown
# Linux verification: <target>

## Result
- status: pass | test-failed | environment-failed | flaky | blocked
- first failing check: <name or none>

## Why Linux is required
- <kernel/filesystem/container/Kubernetes reason>

## Environment
- host: macOS <version>, <host arch>
- smolvm: <version>
- guest: <image/digest>, <guest arch>, <kernel>, <distribution>
- CI target: <arch or unknown>
- resources: <cpus>, <memory>
- network: disabled | enabled, with reason and allow-list
- mounts/ports: <least-privilege summary; ports none or loopback-only>
- forwarded capabilities: <ssh-agent, secrets, Docker API, or none>

## Commands and evidence
- native checks: <commands and results>
- guest checks: <commands and exit codes>
- artifacts: <paths or none>

## Diagnosis and limitations
- <environment/test/product/flaky classification>
- <mount, network, architecture, entitlement, or version caveat>

## Next step
- <smallest concrete fix, CI follow-up, or escalation>
```

## Important Principles

- Keep macOS-native tests fast; use the VM only for Linux semantics.
- Treat the guest as untrusted. Mount narrow paths, prefer read-only, keep network off by default, keep published ports on loopback, and never expose host secrets or the host Docker socket to a guest.
- A local smolvm VM is a reproducibility aid, not a hardened multi-user security boundary; do not claim production isolation from this workflow.
- Pin versions where possible and record every environment variable or capability that changes the result.
- Prefer an ephemeral machine and ownership-scoped cleanup over clever caching. Reuse a compatible pack or golden machine only when startup cost is measured and state reset is explicit.
- Keep `--ssh-agent`, secret injection, and equivalent credential forwarding disabled by default. An SSH agent keeps private keys on the host but still lets the guest request signatures; enable it only for a trusted workload after explicit approval, and record it in the report.
- If a command or feature is version-sensitive, consult the installed `--help` output and the first-party docs before acting. If a linked path is unavailable or its example differs, use the current [smolvm README/CLI reference](https://github.com/smol-machines/smolvm#readme) and do not infer flags from an old example.

## Halt Conditions

- HALT if the repository, test command, target Linux image/digest, host/guest/CI architecture, or required Linux behavior is missing and a safe assumption would change the result; ask one concise question.
- HALT if a requested persistent machine name already exists and its ownership was not created and recorded by this invocation.
- HALT before mounting secrets, the whole home directory, the host Docker socket, SSH agent/credentials, or broad writable paths; explain the exposure and propose the least-privilege alternative. The host Docker socket remains prohibited for guest workloads, even when explicitly requested.
- HALT if smolvm cannot start because of Hypervisor.framework entitlement, unsupported architecture, or missing host capability; report the environment blocker and do not label the test as passed.
- HALT before enabling unrestricted network access or changing host security settings; use a narrow allow-list or ask for approval.
- HALT if the user asks for production multi-tenant isolation, destructive host cleanup, or a Kubernetes production architecture; route to a security/architecture workflow instead.

## Sources

- [smolvm repository](https://github.com/smol-machines/smolvm)
- [Smol Machines local SDK](https://smolmachines.com/docs/sdk/with-local)
- [Local examples](https://smolmachines.com/docs/local/examples)
- [Kubernetes in a microVM](https://smolmachines.com/docs/guides/kubernetes-in-a-microvm)
- [Agent sandboxes and CI](https://smolmachines.com/docs/guides/agent-sandboxes-ci)
- [Docker in a machine](https://smolmachines.com/docs/guides/docker-in-a-machine)
