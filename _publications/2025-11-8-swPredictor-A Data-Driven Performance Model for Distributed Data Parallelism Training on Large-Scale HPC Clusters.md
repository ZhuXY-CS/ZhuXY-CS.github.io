---
title: "swPredictor: A Data-Driven Performance Model for Distributed Data Parallelism Training on Large-Scale HPC Clusters"
collection: publications
permalink: /publication/swPredictor
date: 2025-03-06
venue: 'Performance Evaluation: An International Journal (PEVA)'
rank: 2025
badge: 'PEVA 2025'
badge_class: 'badge-journal'
image: 'https://zhuxy-cs.github.io/images/publications/swPredicter.jpg'
authors: '<strong>Xianyu Zhu</strong>, Ruohan Wu, Junshi Chen, Hong An'
author_list: '<strong>Xianyu Zhu¹</strong>, Ruohan Wu¹, Junshi Chen¹², Hong An¹²'
affiliations: '¹School of Computer Science and Technology, University of Science and Technology of China, Hefei, China<br>²Laoshan Laboratory, Qingdao, China'
description: 'A framework designed to accelerate foundation models via intra-op tiling and inter-op scheduling on the new Sunway Supercomputer.'
keywords: '<strong>High-Performance Computing</strong>, <strong>Performance Modeling</strong>, <strong>Deep Learning</strong>, <strong>Distributed Training</strong>'
posterurl: 'http://zhuxy-cs.github.io/poster/swPredictor-poster.pdf'
doi: 'https://doi.org/10.1016/j.peva.2025.102530'
googlescholar: 'https://www.sciencedirect.com/science/article/pii/S0166531625000641'
citation: ' Xianyu Zhu, Ruohan Wu,  Junshi Chen,  Hong An &quot;swPredictor: A Data-Driven Performance Model for Distributed Data Parallelism Training on Large-Scale HPC Clusters.&quot; Performance Evaluation: An International Journal (PEVA), 2025.'
bibtex: |
  @article{zhu2025swPredictor,
    title={swPredictor: A Data-Driven Performance Model for Distributed Data Parallelism Training on Large-Scale HPC Clusters},
    author={Zhu, Xianyu and Wu, Ruohan and Chen, Junshi and An, Hong},
    journal={Performance Evaluation: An International Journal},
    year={2025},
    publisher={Elsevier}
  }
---


**************************************************************

**Keywords: swPredictor, FI-Net, FNO-Inception, Performance Modeling, HPC, Distributed Data Parallelism**


--------

## Abstract

<div style="font-family: 'Times New Roman', Times, serif;">
<p style="text-align: justify;">
Given the complexity of heterogeneous architectures and multi-node collaboration, large-scale HPC (High-Performance Computing) clusters pose challenges in resource utilization and performance optimization during distributed data parallelism (DDP) training. Performance modeling aims to identify application bottlenecks and guide algorithm design, but existing performance models rarely consider the impact of system architecture on communication performance or provide a systematic analysis of distributed training. To address these issues, this paper proposes swPredictor, a data-driven performance model devised for accurately predicting the performance of DDP training. First, an original performance dataset is developed based on various communication patterns at runtime to avoid systematic errors. Subsequently, a novel multi-branch module FNO-Inception is proposed, combining FNO (Fourier Neural Operator) layer with Inception structure to simultaneously utilize various frequency features. Finally, by introducing the FNO-Inception module, a novel regression model FI-Net is constructed
to fit complex nonlinear relationships. The experimental results demonstrate that FI-Net can accurately predict the performance of DDP training on the Sunway OceanLight supercomputer with an overall MAPE of 0.93%, which outperforms the other baseline models.
</p>
</div>


--------
