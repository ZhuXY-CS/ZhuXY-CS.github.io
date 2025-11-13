---
permalink: /
title: ""
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<style>
/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 区块间距 */
section {
  padding-top: 20px;
  margin-top: -20px;
}

/* 标题样式 */
h2 {
  margin-top: 0px;
  padding-top: 0px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

/* 响应式间距 */
@media (max-width: 768px) {
  section {
    padding-top: 15px;
    margin-top: -15px;
  }
}
</style>

<!-- ==================== About Me Section ==================== -->
<section id="about">

<h2>🎃 About Me</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-align: justify; line-height: 1.6;">

Now, I am currently a master student in the <a href="https://cs.ustc.edu.cn">School of Computer Science and Technology</a> at the <a href="https://ustc.edu.cn/">University of Science and Technology of China (USTC)</a>.
I am a member of the <a href="https://acsa.ustc.edu.cn/">Advanced Computer Systems Architecture (ACSA) Laboratory</a>, which is led by <a href="https://cs.ustc.edu.cn/2020/0426/c23235a460072/page.htm">Professor Hong An</a>.
Before that, I obtained my bachelor's degree in Computer Science from Northwest A&F University in 2023.
During my undergraduate studies, I joined the Parallel and Visual Processing Laboratory led by <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Professor Bin Liu</a>.

<br>

As the <strong>first author</strong>, I have published in Performance Evaluation (PEVA) and IEEE/ACM Transactions on Computational Biology and Bioinformatics (TCBB).
My research interests lie at the intersection of <strong>high-performance computing</strong>, <strong>machine learning systems</strong>, and <strong>distributed training</strong>. Specifically, I focus on:

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Gradient Compression Algorithms:</strong> Developing efficient compression techniques to reduce communication overhead in distributed training</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Large-scale Distributed Systems:</strong> Building scalable solutions for training foundation models on HPC clusters</li>
</ul>

<br>

<strong>Now, I am seeking related PhD opportunities in 2026 Fall🍂🍂🍂</strong>

</div>

</section>

<!-- ==================== Education Section ==================== -->
<section id="education">

<h2>📖 Education</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 2.0;">

<strong><img src="http://zhuxy-cs.github.io/images/ustc_logo2_01.jpg" style="width:20px; vertical-align:middle; margin-right:6px;">University of Science and Technology of China</strong> (C9 League, Project 985 & 211) ⇒ From 2023 to Now<br>
<ul style="list-style-type: disc; margin-left: 20px; margin-top: 8px; margin-bottom: 20px;">
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Master of Computer Science and Technology in School of Computer Science and Technology</li>
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Lab: <a href="https://acsa.ustc.edu.cn/">Advanced Computer Systems Architecture (ACSA) Laboratory</a>, led by <a href="https://cs.ustc.edu.cn/2020/0426/c23235a460072/page.htm">Professor Hong An</a></li>
</ul>

<strong><img src="http://zhuxy-cs.github.io/images/nwafu-circle_01.jpg" style="width:20px; vertical-align:middle; margin-right:6px;">Northwest A&F University</strong> (Project 985 & 211) ⇒ From 2019 to 2023<br>
<ul style="list-style-type: disc; margin-left: 20px; margin-top: 8px; margin-bottom: 20px;">
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Bachelor of Computer Science and Technology in College of Information Engineering</li>
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Lab: <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Parallel and Visual Processing Laboratory</a>, led by <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Professor Bin Liu</a></li>
</ul>

</div>

</section>

<!-- ==================== Publication Section ==================== -->
<section id="publication">

<h2>📝 Publication</h2>

<div style="font-family: 'Times New Roman', Times, serif;">

<h3>📨 Submitted Paper</h3>
<ul style="margin-bottom: 1.5em;">
<li style="margin-bottom: 12px; line-height: 2.0 !important;">As <strong>first-author</strong>, the paper "Accelerating Large-Scale Distributed Training via Chunk-Wise Gradient Sparsification and Pipelined Communication" has been submitted to Journal of Computer Science and Technology  <strong>(JCST)</strong></li>
</ul>

<h3>📚 Published Paper</h3>

{% assign sorted_publications = site.publications | sort: 'rank' | reverse %}
{% for post in sorted_publications %}
  {% include archive-single-publication.html %}
{% endfor %}

</div>

</section>

<!-- ==================== Project Section ==================== -->
<section id="project">

<h2>🚀 Research Project</h2>

<div style="font-family: 'Times New Roman', Times, serif;">

<h3>Ongoing Project</h3>
<ul>
    <li>
        <strong>Dataflow Programming and Runtime System Framework Adapted to Domestic Heterogeneous System Architectures</strong><br>
        <em>Strategic Priority Research Program of Chinese Academy of Sciences</em><br>
        Role: Project Member | Duration: 2023 - Present<br>
        Focus: Gradient compression algorithms for efficient distributed training on heterogeneous architectures
    </li>
</ul>

<h3>Completed Project</h3>

{% assign sorted_projects = site.projects | sort: 'rank' | reverse %}
{% for post in sorted_projects %}
  {% include archive-single-project.html %}
{% endfor %}

</div>

</section>

<!-- ==================== Internship Section ==================== -->
<section id="internship">

<h2>⭐ Internship</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2019--2020, New Media Center of college, responsible for writing, interview and operation of official account</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2019--2020 Summer, Baidu AI Talents Camp, learning machine learning and AI framework PaddlePaddle</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2019 Winter and 2020 Winter, the event about outstanding student coming back to Alma Mater</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2022 Summer, Tedu Group's Artificial Intelligence Training Project</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2025.07, Hong Kong PhD Fellowship Summer Workshop in CUHK<img src="http://zhuxy-cs.github.io/images/CUHK_logo_01.jpg" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; margin-right:6px;"> </li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">2025.07--09, Research Assistant in Systems and Networking Lab in HKU<img src="http://zhuxy-cs.github.io/images/hku-logo-eps_01.jpg" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; margin-right:6px;">, supervised by <a href="https://i.cs.hku.hk/~heming/">Prof. Heming Cui</a>,
focusing on designing a more effective distributed training framework for the unified multimodal large model </li>
</ul>

</div>

</section>

<!-- ==================== Award Section ==================== -->
<section id="award">

<h2>🏆 Award</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<h3>🔥 Scholarship</h3>
<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">National Scholarship</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">President Scholarship</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Thanksgiving Scholarship for Modern and Contemporary Chinese Scientists (the highest-paying scholarship)</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">First-Class Professional Scholarship</li>
</ul>

<h3>✨ Honor</h3>
<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Outstanding Graduate</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Excellent College Student</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Advanced Individual in Social Practice</li>
</ul>

</div>

</section>

<!-- ==================== Competition Section ==================== -->
<section id="competition">

<h2>✅ Competition</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"11th Student RDMA Programming Competition", <b>Third Prize</b> </li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"2022 Mathematical Contest In Modeling(MCM)", <b>Meritorious Winner</b></li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"12th Blue Bridge Cup Competition", Provincial Competition <b>First Prize</b></li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"2021 Group Programming Ladder Tournament", National <b>Third Prize</b></li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"2022 The Competition of Computer Design", <b>First Prize</b> in Northwest Region</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">"12th National Mathematics Competition for College Students", <b>Second Prize</b></li>
</ul>

</div>

</section>

<!-- ==================== Skill Section ==================== -->
<section id="skill">

<h2>⚙️ Technical Skill</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Programming Language:</strong> C/C++, Python, CUDA, MPI</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Machine Learning:</strong> PyTorch, TensorFlow, Distributed Training Framework</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>High Performance Computing:</strong> OpenMP, MPI, CUDA Programming</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Tool & Platform:</strong> Git, Linux, Sunway OceanLight Supercomputer</li>
</ul>

</div>

</section>
