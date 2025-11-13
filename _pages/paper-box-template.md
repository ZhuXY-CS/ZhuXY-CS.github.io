---
title: "Paper Box Template Usage Guide"
permalink: /paper-box-template/
author_profile: false
---

# 论文展示模板使用指南

基于Yang Zhang博士的主页设计，我已经为你的网站实现了优雅的论文展示格式。

## 📸 准备论文配图

请为每篇论文准备一张配图（建议尺寸：500x300像素），并放置在 `/images/publications/` 目录下。配图可以是：
- 论文的架构图
- 主要实验结果图
- 系统框架图
- 算法流程图

## 📝 论文文件格式

在 `_publications` 目录下的每个论文文件应包含以下内容：

### 1. Front Matter（头部配置）

```yaml
---
title: "论文标题"
collection: publications
permalink: /publication/url-slug
date: YYYY-MM-DD
venue: '期刊/会议名称'
paperbox: true  # 启用paper-box样式
badge: '会议缩写 年份'  # 如 'ICPP 2024' 或 'JCST 2025'
badge_class: 'badge-conference'  # 或 'badge-journal', 'badge-preprint', 'badge-workshop'
image: '/images/publications/论文图片.png'
citation: '引用格式'
---
```

### 2. Paper Box HTML结构

```html
<div class="paper-box">
  <div class="paper-box-image">
    <div>
      <div class="badge badge-journal">期刊/会议 年份</div>
      <img src="/images/publications/论文图片.png" alt="图片描述" width="100%">
    </div>
  </div>
  <div class="paper-box-text">
    <p><a href="论文链接">论文标题</a></p>

    <p>作者1, <strong>你的名字</strong>, 作者3, ...</p>

    <p>论文简介（1-2句话描述论文主要贡献）</p>

    <p>Keywords: <strong>关键词1</strong>, <strong>关键词2</strong>, <strong>关键词3</strong></p>

    <p>
      <a href="PDF链接"><i class="fas fa-file-pdf"></i> PDF</a>
      <a href="DOI链接"><i class="fas fa-link"></i> DOI</a>
      <a href="Google Scholar链接"><i class="fas fa-graduation-cap"></i> Google Scholar</a>
    </p>
  </div>
</div>
```

## 🎨 Badge样式类别

- `badge-conference`: 蓝色，用于会议论文
- `badge-journal`: 绿色，用于期刊论文
- `badge-preprint`: 橙色，用于预印本
- `badge-workshop`: 紫色，用于研讨会论文

## ✨ 已更新的论文示例

我已经为以下论文更新了格式：
1. **SwFormer** (JCST 2025) - 期刊论文样式
2. **SWattention** (J. Supercomputing 2024) - 期刊论文样式

## 📌 注意事项

1. 请为每篇论文准备相应的配图，文件名建议使用论文简称（如 `swformer.png`）
2. 确保你的名字在作者列表中使用 `<strong>` 标签加粗
3. 关键词应该简洁明了，3-5个为宜
4. 论文简介控制在1-2句话，突出主要贡献

## 🚀 下一步

1. 为其他论文创建配图并上传到 `/images/publications/`
2. 按照上述模板更新其他论文的格式
3. 在浏览器中查看效果：`jekyll serve` 然后访问 `http://localhost:4000/publications/`

---

如需进一步定制样式，可以编辑 `_sass/layout/_custom-overrides.scss` 文件中的 paper-box 相关样式。