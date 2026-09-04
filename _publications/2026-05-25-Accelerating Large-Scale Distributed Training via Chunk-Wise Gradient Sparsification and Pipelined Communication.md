---
title: "Accelerating Large-Scale Distributed Training via Chunk-Wise Gradient Sparsification and Pipelined Communication"
collection: publications
permalink: /publication/Chunk-GradComp
date: 2026-05-25
venue: 'Journal of Computer Science and Technology (JCST)'
rank: 2026
badge: 'JCST 2026'
badge_class: 'badge-journal'
image: '/images/publications/Chunk-GradComp.png'
authors: '<strong>Xianyu Zhu</strong>, Ruohan Wu, Junshi Chen, Hong An'
author_list: '<strong>Xianyu Zhu¹</strong>, Ruohan Wu¹, Junshi Chen¹², Hong An¹²'
affiliations: '¹School of Computer Science and Technology, University of Science and Technology of China, Hefei, China<br>²Laoshan Laboratory, Qingdao, China'
description: 'An algorithm designed to accelerate distributed data parallel training via chunk-wise gradient sparsification and pipelined communication.'
keywords: '<strong>Communication Optimization</strong>, <strong>Deep Learning</strong>, <strong>Distributed Training</strong>, <strong>Gradient Compression</strong>'
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
Gradient sparsification algorithms improve communication efficiency in large-scale distributed training by selectively transmitting only the most significant gradient components. However, the existing TopK-based sparsification methods still suffer from computational bottlenecks and inefficient sparse communication procedures. In this paper, we introduce Chunk-GradComp, a novel framework designed to reduce the overhead incurred by gradient selection and hide communication latency. Chunk-GradComp consists of two main components. 1) Chunk-TopK partitions the target gradient into multiple chunks and performs TopK selection in a single chunk; 2) Chunk-AllGather divides the selected data into smaller segments for pipelined transmission. Additionally, it employs performance modeling to automatically determine the optimal pipeline depth. Experimental results demonstrate that Chunk-TopK can operate at a compression ratio as low as 0.1% with negligible accuracy loss. When combined, Chunk-TopK and Chunk-AllGather reduce the total communication time by up to 80%, achieving a 3× to 4.74× speedup over the DenseAllReduce baseline.
</p>
</div>


--------
