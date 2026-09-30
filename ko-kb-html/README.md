# ko-kb-html

为适合浏览、导航或图表交互的长文档创建自包含 HTML，并保持源文档与生成流程可重复。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

架构、PRD、计划、审查、研究和报告需要 HTML；或 Mermaid 显示为代码、缩放模糊、全屏或移动端布局出现问题。

## 使用示例

```text
使用 ko-kb-html 为 docs/architecture.md 生成离线 HTML companion，保留 Markdown。渲染 Mermaid，提供清晰的缩放、拖动和全屏，并检查移动端溢出及重复生成结果。
```

## 输入与产出

- **输入：** 源文档或待修复 HTML、文档类型与读者；涉及生成内容时提供原生成器，涉及图表时提供 Mermaid 源码。
- **产出：** 独立 HTML、保留的 Markdown、必要时的可重复生成器，以及实际检查结果和未验证项。

## 执行流程

1. 判断 HTML 是否有阅读价值，读取对应文档类型的质量要求。
2. 优先语义 HTML、内联 CSS / SVG 和少量原生 JavaScript，复用项目已有工具。
3. 批量或重复生成时采用生成器；Mermaid 优先构建时渲染，保留可展开源码。
4. 检查桌面、移动端、图表交互及重复运行；修复应落在生成器后再重新生成。

## 边界与前提

默认离线、零新增依赖；需要 Mermaid 等新增依赖时先处理授权。短答复和明确只要 Markdown 的任务不生成 HTML。不能将未经浏览器检查的视觉或交互结果说成已验证。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
- [references/html-quality-targets.md](./references/html-quality-targets.md) - 按文档类型区分的 HTML 质量要求
- [references/md-to-html-companion-implementation.md](./references/md-to-html-companion-implementation.md) - Markdown 到 HTML 的可重复生成实现
- [references/mermaid-interaction-pattern.md](./references/mermaid-interaction-pattern.md) - Mermaid 渲染及交互规则
- [templates/markdown-html-companion-generator.mjs](./templates/markdown-html-companion-generator.mjs) - Markdown HTML companion 生成器模板
