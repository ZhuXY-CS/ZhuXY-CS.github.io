---
permalink: /
title:
description: "Xianyu Zhu is a machine learning systems researcher working on distributed training, gradient compression, performance modeling, and high-performance computing."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<div class="academic-home">

<section id="about" class="home-hero" aria-labelledby="home-title">
  <p class="home-eyebrow">Machine learning systems · Distributed training · HPC</p>
  <h1 id="home-title">Xianyu Zhu</h1>
  <p class="home-role">I study how learning systems can train faster and scale more efficiently across communication- and compute-constrained platforms.</p>
  <p class="home-intro">
    I recently received a master's degree from the <a href="https://cs.ustc.edu.cn">School of Computer Science and Technology</a> at the <a href="https://ustc.edu.cn/">University of Science and Technology of China</a>. I was a member of the <a href="https://acsa.ustc.edu.cn/">Advanced Computer Systems Architecture Laboratory</a>, led by <a href="https://cs.ustc.edu.cn/2020/0426/c23235a460072/page.htm">Professor Hong An</a>.
  </p>
  <div class="home-actions" aria-label="Primary profile links">
    <a class="home-action home-action--primary" href="/cv/"><i class="fas fa-file-alt" aria-hidden="true"></i> View CV</a>
    <a class="home-action" href="https://scholar.google.com/citations?user=DHVjR2oAAAAJ"><i class="ai ai-google-scholar" aria-hidden="true"></i> Google Scholar</a>
    <a class="home-action" href="mailto:zhuxy@mail.ustc.edu.cn"><i class="fas fa-envelope" aria-hidden="true"></i> Email</a>
  </div>
  <div class="home-research-path" role="list" aria-label="Research path from algorithms to systems">
    <span role="listitem">Algorithms</span><i aria-hidden="true"></i>
    <span role="listitem">Communication</span><i aria-hidden="true"></i>
    <span role="listitem">Systems</span>
  </div>
  <p class="home-availability"><span aria-hidden="true"></span> Seeking related PhD opportunities for Fall 2026 or Spring 2027.</p>
</section>

<section id="research" class="home-section" aria-labelledby="research-title">
  <div class="home-section-heading">
    <p class="home-section-kicker">Research</p>
    <h2 id="research-title">Research focus</h2>
  </div>
  <div class="research-focus-grid">
    <article>
      <p class="research-focus-index">01</p>
      <h3>Communication-efficient training</h3>
      <p>Gradient sparsification and pipelined collectives that reduce communication overhead in distributed training.</p>
    </article>
    <article>
      <p class="research-focus-index">02</p>
      <h3>Scalable training systems</h3>
      <p>Runtime and scheduling techniques for foundation-model training on large-scale heterogeneous HPC platforms.</p>
    </article>
    <article>
      <p class="research-focus-index">03</p>
      <h3>Performance modeling</h3>
      <p>Data-driven models that reveal system bottlenecks and guide efficient configurations for distributed workloads.</p>
    </article>
  </div>

  <div class="home-subsection-heading">
    <h3>Research projects</h3>
    <p>Selected systems and applied machine-learning work.</p>
  </div>
  <div class="home-project-grid">
    <article class="home-project-card home-project-card--current">
      <p class="home-project-meta">Chinese Academy of Sciences · 2023–Present</p>
      <h3>Dataflow programming and runtime systems for domestic heterogeneous architectures</h3>
      <p>Project member working on gradient-compression algorithms for efficient distributed training.</p>
    </article>
    {% assign sorted_projects = site.projects | sort: 'rank' | reverse %}
    {% for post in sorted_projects %}
      <article class="home-project-card">
        <p class="home-project-meta">{{ post.badge }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.description }}</p>
        <a class="home-text-link" href="{{ post.url | relative_url }}">View project <span aria-hidden="true">→</span></a>
      </article>
    {% endfor %}
  </div>
</section>

<section id="publication" class="home-section" aria-labelledby="publication-title">
  <div class="home-section-heading home-section-heading--with-link">
    <div>
      <p class="home-section-kicker">Selected work</p>
      <h2 id="publication-title">First-author publications</h2>
    </div>
    <a class="home-text-link" href="/publications/">View all publications <span aria-hidden="true">→</span></a>
  </div>
  <div class="home-publication-list">
    {% assign featured_publications = site.publications | where: 'featured', true | sort: 'rank' | reverse %}
    {% for post in featured_publications %}
      {% include archive-single-publication.html %}
    {% endfor %}
  </div>
</section>

<section id="experience" class="home-section" aria-labelledby="experience-title">
  <div class="home-section-heading">
    <p class="home-section-kicker">Background</p>
    <h2 id="experience-title">Experience and education</h2>
  </div>
  <div class="home-timeline">
    <article>
      <p class="home-timeline-date">2025.07–09</p>
      <div>
        <h3>Research Assistant · The University of Hong Kong</h3>
        <p>Systems and Networking Laboratory, supervised by <a href="https://i.cs.hku.hk/~heming/">Professor Heming Cui</a>. Worked on distributed training for unified multimodal large models.</p>
      </div>
    </article>
    <article>
      <p class="home-timeline-date">2023–2026</p>
      <div>
        <h3>M.S. in Computer Science and Technology · USTC</h3>
        <p>Advanced Computer Systems Architecture Laboratory, University of Science and Technology of China.</p>
      </div>
    </article>
    <article>
      <p class="home-timeline-date">2019–2023</p>
      <div>
        <h3>B.S. in Computer Science and Technology · Northwest A&amp;F University</h3>
        <p>Parallel and Visual Processing Laboratory, supervised by Professor Bin Liu.</p>
      </div>
    </article>
  </div>

  <div class="home-facts-grid">
    <details>
      <summary>Academic service and recognition</summary>
      <div>
        <p>Reviewer for IEEE Transactions on Parallel and Distributed Systems (TPDS).</p>
        <ul>
          <li>National Scholarship</li>
          <li>President Scholarship</li>
          <li>Thanksgiving Scholarship for Modern and Contemporary Chinese Scientists</li>
          <li>Outstanding Graduate</li>
          <li>Top Ten Scientific Research Star</li>
        </ul>
      </div>
    </details>
    <details>
      <summary>Competitions</summary>
      <div>
        <ul>
          <li>11th Student RDMA Programming Competition — Third Prize</li>
          <li>2022 Mathematical Contest in Modeling — Meritorious Winner</li>
          <li>12th Blue Bridge Cup, Provincial Competition — First Prize</li>
          <li>2021 Group Programming Ladder Tournament — National Third Prize</li>
          <li>Computer Design Competition, Northwest Region — First Prize</li>
          <li>12th National Mathematics Competition — Second Prize</li>
        </ul>
      </div>
    </details>
  </div>

  <div class="home-toolkit" aria-labelledby="toolkit-title">
    <h3 id="toolkit-title">Technical toolkit</h3>
    <ul>
      <li>C/C++</li><li>Python</li><li>CUDA</li><li>PyTorch</li><li>TensorFlow</li><li>DeepSpeed</li><li>MPI</li><li>OpenMP</li><li>Linux</li><li>Sunway OceanLight</li>
    </ul>
  </div>
</section>

</div>
