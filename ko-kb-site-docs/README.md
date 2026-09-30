# ko-kb-site-docs

先设计读者任务、页面结构和导航，再生成或修复项目文档站点。

执行规则以 [SKILL.md](./SKILL.md) 为准；安装方法见[项目 README](../README#安装与使用)。

## 适用场景

需要文档站、页面层级、导航、生成的 API / CLI reference、搜索、图表、静态发布产物或断链与构建修复。

## 使用示例

```text
使用 ko-kb-site-docs 整理现有文档站，面向新用户和维护者。保留公开 URL，重组导航，把 API reference 接到使用指南，并验证构建及 Mermaid 渲染。
```

## 输入与产出

- **输入：** 现有文档、代码、schema、示例或提纲；目标读者；可选站点框架、发布目标和范围。
- **产出：** 变更文件、读者与页面结构、关键路由、实际 build / preview 结果、图表状态及发布和兼容性缺口。

## 执行流程

1. 确定读者及任务，列出最小页面集和稳定 slug。
2. 按用户任务组织首页、指南、reference、运维和贡献入口，保护已有 URL。
3. 复用现有框架；为生成文档记录来源与再生成命令，配置导航和必要功能。
4. 验证构建、预览、关键路由、链接和真实图表输出。

## 边界与前提

一篇 Markdown 或独立 HTML 不需要文档站；独立 HTML 用 ko-kb-html。不要为了框架名新增框架。公开路径中的秘密、未明确的 URL 兼容性和未经授权的删除需要先暂停。

## 相关文件

- [SKILL.md](./SKILL.md) - agent 执行指令
- [evals/evals.json](./evals/evals.json) - 压力与使用场景
- [references/vitepress-mermaid.md](./references/vitepress-mermaid.md) - VitePress Mermaid 渲染参考
