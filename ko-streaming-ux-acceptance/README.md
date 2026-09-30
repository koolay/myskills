# ko-streaming-ux-acceptance

用分层证据验证流式体验，同时证明传输节奏、界面更新、终止响应和最终内容完整性。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

流式聊天卡顿、成批跳字，或修改 buffering、flush interval、渲染节奏和首个可见 chunk 延迟。

## 使用示例

```text
读取 ko-streaming-ux-acceptance/SKILL.md，验收聊天流式输出的跳字问题。先定义可见延迟与追赶上限，追踪服务端到 DOM 的完整链路，用确定性 burst 测量中间帧并核对最终文本。
```

## 输入与产出

- **输入：** 症状或相关 diff、产品阈值、生产数据路径，以及组件、协议和浏览器测试入口。
- **产出：** accepted / rejected / partially verified 结论、前后可见时间证据、序列与最终文本、终止/错误旁路、Markdown / Unicode / 可访问性检查及未验证边界。

## 执行流程

1. 定义首个可见 chunk、最大静默、追赶期限及终止/错误响应等可测条件。
2. 追踪 producer → transport → store → Markdown renderer → DOM，定位暂停与跳变产生的层。
3. 在相关边界构建旧行为会失败的节奏、pacing、渲染、浏览器时序和协议检查。
4. 只修复制造静默的拥有层，分离权威状态与展示进度，保留 Unicode 和终止旁路。
5. 逐层取得通过证据，并区分产品、测试配置和基础设施失败。

## 边界与前提

最终字符串正确不能证明视觉流畅；必须观察中间 DOM 变化。时间阈值属于具体产品，不能套用统一数值。目录是历史名称 ko-streaming-ux-acceptance，SKILL.md 的 name 为 streaming-ux-acceptance，调用时以工具实际发现的名称为准。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
