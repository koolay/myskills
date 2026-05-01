# Skill 命名规范

本文档定义了所有 skill 的命名规则，所有新增 skill 必须遵守。

## 命名格式

```
ko-{分类}-{功能}
```

三段式，全小写，`-` 连接。

| 段 | 说明 | 要求 |
|----|------|------|
| `ko` | 项目统一前缀 | 固定不变 |
| 分类 | 所属领域缩写 | 2 个字母，见下表 |
| 功能 | skill 具体名称 | 1-2 个词，kebab-case |

## 分类前缀

| 前缀 | 含义 | 覆盖范围 |
|------|------|----------|
| `dx` | Developer Experience | 调试、诊断、性能 |
| `cq` | Code Quality | 审查、重构、安全 |
| `gf` | Git Flow | commit、PR、changelog |
| `sd` | System Design | 技术方案、API、DB |
| `kb` | Knowledge Base | 文档、代码解读 |

新增分类需在此表中登记后方可使用。

## 目录与文件约定

- 每个 skill 对应一个目录，目录名即 skill 名称
- 目录内必须包含 `SKILL.md`，其 frontmatter 中的 `name` 字段必须与目录名一致
- 示例结构：
  ```
  ko-dx-rca/
  └── SKILL.md    # name: ko-dx-rca
  ```

## 已规划 Skill 清单

```
ko-dx-rca          根因分析
ko-dx-debug        错误追踪与调试
ko-dx-perf         性能分析

ko-cq-review       代码审查
ko-cq-refactor     重构建议
ko-cq-security     安全审计

ko-gf-commit       规范化 commit
ko-gf-pr           PR 审查与总结
ko-gf-changelog    变更日志生成

ko-sd-tech         技术方案设计
ko-sd-api          API 接口设计
ko-sd-schema       数据库 schema 设计

ko-kb-doc          技术文档撰写
ko-kb-explain      代码解读
```

## 命名检查清单

新增 skill 时逐项确认：

- [ ] 以 `ko-` 开头
- [ ] 分类前缀在上表中已登记
- [ ] 功能名不超过 2 个词
- [ ] 全小写，`-` 连接
- [ ] 目录名与 `SKILL.md` 中 `name` 一致
