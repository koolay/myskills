# ko-cq-review

用明确的审查范围、多个视角和证据分级，检查代码变更的缺陷、回归与验收遗漏。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

审查当前 diff、PR、分支、commit 范围，或按计划、工单、验收条件检查实现。

## 使用示例

```text
使用 ko-cq-review 审查当前分支相对 main 的变更，包含未提交改动。按 docs/plan.md 检查验收条件，只报告问题，不修改代码。
```

## 输入与产出

- **输入：** 必需：变更范围。可选：需求、架构约束、检查结果，以及 review-only 或 review-and-fix 模式。
- **产出：** 带文件位置、影响、证据和最小修复建议的发现；决策项、后续项、验证范围及 approve / request-changes / incomplete 结论。

## 执行流程

1. 构建包含范围、需求、上下文和验证状态的审查材料。
2. 执行 diff、上下文边界和需求验收视角，覆盖正确性、可读性、架构、安全及性能。
3. 验证并去重候选问题，分类为 must-fix、should-fix、decision-needed、defer 或 noise。
4. 默认返回发现；只有明确要求 review-and-fix 时才修复范围内的确定问题并验证。

## 边界与前提

顺序自审不等于独立审查；只有环境和当前授权允许时才委派视角。没有需求时标明跳过验收审查。审查结论不授权合并或向外部系统发送评论。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
