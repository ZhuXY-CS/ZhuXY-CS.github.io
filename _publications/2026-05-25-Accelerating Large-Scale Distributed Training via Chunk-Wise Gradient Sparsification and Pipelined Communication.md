---
title: "Accelerating Large-Scale Distributed Training via Chunk-Wise Gradient Sparsification and Pipelined Communication"
collection: publications
permalink: /publication/Chunk-GradComp
date: 2026-05-25
venue: 'Journal of Computer Science and Technology (JCST)'
rank: 2026
badge: 'JCST 2026'
badge_class: 'badge-journal'
image: 'https://zhuxy-cs.github.io/images/publications/Chunk-GradComp.png'
authors: '<strong>Xianyu Zhu</strong>, Ruohan Wu, Junshi Chen, Hong An'
author_list: '<strong>Xianyu Zhu¹</strong>, Ruohan Wu¹, Junshi Chen¹², Hong An¹²'
affiliations: '¹School of Computer Science and Technology, University of Science and Technology of China, Hefei, China<br>²Laoshan Laboratory, Qingdao, China'
description: 'An algorithm designed to accelerate distributed data parallel training via chunk-wise gradient sparsification and pipelined communication.'
keywords: '<strong>High-Performance Computing</strong>, <strong>Performance Modeling</strong>, <strong>Deep Learning</strong>, <strong>Distributed Training</strong>'
posterurl: 'http://zhuxy-cs.github.io/poster/Chunk-GradComp.pdf'
doi: 'https://doi.org/10.0000/0000'
googlescholar: 'https://www.sciencedirect.com/science/article/pii/000000'
citation: ' Xianyu Zhu, Ruohan Wu,  Junshi Chen,  Hong An &quot;Accelerating Large-Scale Distributed Training via Chunk-Wise Gradient Sparsification and Pipelined Communication.&quot; Journal of Computer Science and Technology (JCST), 2026.'
bibtex: |
  @article{zhu2026Chunk-GradComp,
    title={Accelerating Large-Scale Distributed Training via Chunk-Wise Gradient Sparsification and Pipelined Communication},
    author={Zhu, Xianyu and Wu, Ruohan and Chen, Junshi and An, Hong},
    journal={Journal of Computer Science and Technology (JCST)},
    year={2026}
  }
---


**************************************************************

**Keywords: Communication Optimization, Deep Learning, Distributed Training, Gradient Compression**


--------

## Abstract

<div style="font-family: 'Times New Roman', Times, serif;">
<p style="text-align: justify;">
As deep learning models grow in size, the resulting surge in gradient data has made communication a primary
bottleneck in large-scale distributed training. Gradient sparsification algorithms can improve communication efficiency by selectively transmitting only the most significant gradient elements. However, existing TopK-based sparsification methods still suffer from computational bottleneck and inefficient sparse communication. In this paper, we introduce Chunk-GradComp, a novel framework designed to reduce gradient selection overhead and hide communication latency. The Chunk-GradComp consists of two main components. (1) Chunk-TopK partitions the gradient into multiple chunks and performs TopK selection in a single chunk per iteration, avoiding the full gradient filtering; (2) Chunk-AllGather maximizes the overlap between computation and communication, by dividing the selected data into smaller segments for pipelined transmission. Additionally, it employs performance modeling to automatically determine the optimal pipeline depth, which enables adaptive optimization under diverse conditions. Experimental results demonstrate that Chunk-TopK can achieve up to 0.1% compression ratio with negligible accuracy loss on classic CV and NLP tasks. When combined, Chunk-TopK and Chunk-AllGather reduce total communication time by up to 80%, achieving a 3× to 4.74× speedup over the DenseAllReduce baseline. In summary, Chunk-GradComp offers a practical and scalable solution for large-scale distributed training by significantly reducing communication overhead without compromising model accuracy.
</p>
</div>


--------
