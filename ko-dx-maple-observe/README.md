# ko-dx-maple-observe

把已经运行的 Maple Local 作为只读证据来源，用日志、链路和指标诊断本地服务。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

本地服务的错误、延迟、性能回归、日志模式、依赖关系或遥测缺失需要 Maple 证据。

## 使用示例

```text
使用 ko-dx-maple-observe 查看本地 checkout 服务最近 30 分钟的慢请求和错误，关联 trace 与日志。只读诊断，不启动服务、不修改配置。
```

## 输入与产出

- **输入：** 实际 service name、症状、最小时间窗口；可选 environment、trace ID、请求 ID、OTLP 配置和复现记录。
- **产出：** CLI / Local / 遥测状态、查询与置信度、可能原因、可观测性缺口、下一步和实际命令。

## 执行流程

1. 检查服务配置、CLI 和已运行的本地 Maple，所有查询显式使用 --local。
2. 确认 traces、logs、metrics 是否真实存在及是否可关联。
3. 从服务健康到错误、样本链路、关联日志和性能基线进行有界查询。
4. 结合源码解释证据，分别报告测量、推断、样本量和未知项。

## 边界与前提

需要已安装 CLI 和可达的 Maple Local；缺失时给出安装或启动指引。skill 不自动安装、启动、停止、重置、部署或暴露 Maple，不修改数据目录。诊断模式不自动增加 SDK 或埋点。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
