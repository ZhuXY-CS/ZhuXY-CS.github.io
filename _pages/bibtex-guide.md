---
title: "BibTeX引用指南"
permalink: /bibtex-guide/
author_profile: false
---

# 📚 BibTeX引用功能使用指南

## 功能说明

我们已经更新了论文页面的引用功能：
1. **移除了Download Paper链接** - 论文下载链接已从页面底部移除
2. **添加了BibTeX代码块** - 每篇论文现在可以显示可复制的BibTeX引用格式

## 如何添加BibTeX引用

在每篇论文的markdown文件头部（front matter）中添加`bibtex`字段：

```yaml
---
title: "论文标题"
collection: publications
# ... 其他字段 ...
citation: '传统引用格式'
bibtex: |
  @article{作者年份关键词,
    title={论文标题},
    author={作者列表},
    journal={期刊名称},
    year={年份},
    doi={DOI编号},
    publisher={出版社}
  }
---
```

## BibTeX格式示例

### 期刊论文 (Journal Article)
```bibtex
@article{zhu2023ladnet,
  title={LAD-Net: A Novel Light Weight Model for Early Apple Leaf Pests and Diseases Classification},
  author={Zhu, Xianyu and Li, Jinjiang and Jia, Runchang and Liu, Bin and Yao, Zhuohan and Yuan, Aihong and Huo, Yingqiu and Zhang, Haixi},
  journal={IEEE/ACM Transactions on Computational Biology and Bioinformatics},
  year={2023},
  doi={10.1109/TCBB.2022.3191854},
  publisher={IEEE}
}
```

### 会议论文 (Conference Paper)
```bibtex
@inproceedings{li2022appleyolo,
  title={Apple-YOLO: A novel mobile terminal detector based on YOLOv5 for early apple leaf diseases},
  author={Li, Jinjiang and Zhu, Xianyu and Jia, Runchang and Liu, Bin and Yu, Cong},
  booktitle={2022 IEEE 46th Annual Computers, Software, and Applications Conference (COMPSAC)},
  pages={1234--1241},
  year={2022},
  organization={IEEE}
}
```

## 页面显示效果

添加BibTeX后，在论文详情页面会显示：
- **Recommended citation**: 传统的文字引用格式
- **BibTeX按钮**: 点击展开显示BibTeX代码
- **可复制代码块**: 用户可以直接复制BibTeX代码

## 注意事项

1. **使用管道符号 `|`**: 在YAML中，多行文本需要使用管道符号
2. **保持缩进**: BibTeX内容需要正确缩进（通常是2个空格）
3. **特殊字符**: 如果标题中包含特殊字符（如冒号），需要用引号包围
4. **作者格式**: 使用 `LastName, FirstName` 格式，多个作者用 `and` 连接

## 已更新的论文示例

以下论文已添加BibTeX引用：
- SwFormer (JCST 2025)
- SWattention (J. Supercomputing 2024)
- LAD-Net (IEEE/ACM TCBB 2023)
- Apple-YOLO (COMPSAC 2022)

## 快速复制模板

```yaml
bibtex: |
  @article{KEY,
    title={},
    author={},
    journal={},
    year={},
    doi={},
    publisher={}
  }
```

或者会议论文：

```yaml
bibtex: |
  @inproceedings{KEY,
    title={},
    author={},
    booktitle={},
    pages={},
    year={},
    organization={}
  }
```

---

如需进一步帮助，请参考已更新的论文文件作为示例。