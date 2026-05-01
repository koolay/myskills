# My Skills

Personal collection of Qoder CLI dev skills, distilled from daily practice.

## Usage

Install all skills from this repo:

```bash
qoder skill install --from /path/to/myskills
```

Or install a specific skill:

```bash
qoder skill install --from /path/to/myskills/rca
```

## Skills

| Skill | Description |
|-------|-------------|
| [rca](./rca/) | Structured root cause analysis using 5-Why methodology |

## Creating a New Skill

```bash
mkdir <skill-name>
cp SKILL_TEMPLATE.md <skill-name>/SKILL.md
# Edit SKILL.md with your skill definition
```

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter (`name`, `description`) and the skill instructions in Markdown.

## Structure

```
myskills/
├── README.md
├── SKILL_TEMPLATE.md    # Template for new skills
├── <skill-name>/
│   └── SKILL.md         # Skill definition
└── ...
```
