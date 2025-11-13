---
title: "SWattention: designing fast and memory-efficient attention for a new Sunway Supercomputer"
collection: publications
permalink: /publication/SWattention
date: 2024-01-01
venue: 'The Journal of Supercomputing'
rank: 2024
badge: 'J. Supercomputing 2024'
badge_class: 'badge-journal'
image: '/images/publications/swattention.jpg'
authors: 'Ruohan Wu, <strong>Xianyu Zhu</strong>, Junshi Chen, Sha Liu, Tianyu Zheng, Xin Liu, Hong An'
author_list: 'Ruohan Wu¹, <strong>Xianyu Zhu¹</strong>, Junshi Chen¹², Sha Liu¹, Tianyu Zheng¹, Xin Liu¹, Hong An¹²'
affiliations: '¹School of Computer Science and Technology, University of Science and Technology of China, Hefei, China<br>²Laoshan Laboratory, Qingdao, China'
description: 'A highly efficient method for computing exact attention on the SW26010pro processor with two-level parallel task partition strategy.'
keywords: '<strong>Artificial Intelligence</strong>, <strong>Attention Optimization</strong>, <strong>Parallel Programs</strong>, <strong>Sunway Architecture</strong>'
googlescholar: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=k2ajuuEAAAAJ&citation_for_view=k2ajuuEAAAAJ:qjMakFHDy7sC'
doi: 'https://doi.org/10.1007/s11227-024-05890-8'
citation: ' Ruohan Wu,  Xianyu Zhu,  Junshi Chen,  Sha Liu,  Tianyu Zheng,  Xin Liu,  Hong An, &quot;SWattention: designing fast and memory-efficient attention for a new Sunway Supercomputer.&quot; The Journal of Supercomputing, 2024.'
bibtex: |
  @article{wu2024swattention,
    title={SWattention: designing fast and memory-efficient attention for a new Sunway Supercomputer},
    author={Wu, Ruohan and Zhu, Xianyu and Chen, Junshi and Liu, Sha and Zheng, Tianyu and Liu, Xin and An, Hong},
    journal={The Journal of Supercomputing},
    year={2024},
    publisher={Springer}
  }
---


--------

**Keywords: attention optimization, parallel programs, Sunway architecture, FlashAttention**


--------

## Abstract
<div style="font-family: 'Times New Roman', Times, serif;">
<p style="text-align: justify;">
In the past few years, Transformer - based large language models (LLM) have become the dominant technology in a series of applications. To scale up the sequence length of the Transformer, FlashAttention is proposed to compute exact attention with reduced memory requirements and faster execution. However, implementing the FlashAttention algorithm on the new generation Sunway Supercomputer faces many constraints such as the unique heterogeneous architecture and the limited memory bandwidth.
This work proposes SWattention, a highly efficient method for computing the exact attention on the SW26010pro processor. To fully utilize the 6 core groups (CG) and 64 cores per CG on the processor, we design a two - level parallel task partition strategy. Asynchronous memory access is employed to ensure that memory access overlaps with computation. Additionally, a tiling strategy is introduced to determine optimal SRAM block sizes.
Compared with the standard attention, SWattention achieves around 2.0x speedup for FP32 training and 2.5x speedup for mixed-precision training. The sequence lengths range from 1k to 8k and scale up to 16k without being out of memory. As for the end-to-end performance, SWattention achieves up to 1.26x speedup for training GPT-style models, which demonstrates that SWattention enables longer sequence length for LLM training.
</p>
</div>


--------
