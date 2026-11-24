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

.affiliation-label {
  display: inline-block;
  white-space: nowrap;
}

.affiliation-logo {
  width: var(--affiliation-logo-size, 0.96em);
  height: var(--affiliation-logo-size, 0.96em);
  object-fit: contain;
  vertical-align: middle;
  margin-inline-end: 0.32em;
}

.affiliation-logo--wordmark {
  width: auto;
}

.affiliation-logo--lab {
  --affiliation-logo-size: 0.78em;
}

.affiliation-logo--university {
  --affiliation-logo-size: 1.1em;
}

#education .education-heading .affiliation-logo--university {
  --affiliation-logo-size: 1.2em;
}

#education .education-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 1rem;
  align-items: baseline;
}

#education .education-date {
  justify-self: end;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 480px) {
  #education .education-heading {
    grid-template-columns: minmax(0, 1fr);
  }
}

#publication .paper-box {
  padding-block: 0.8em !important;
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

<h2>👨🏻‍🎓 About Me</h2>

<div class="academic-prose">

I recently received a master's degree from the <a href="https://cs.ustc.edu.cn"><span class="affiliation-label"><img class="affiliation-logo" src="/images/ustc-cs-emblem.png" alt="">School</span> of Computer Science and Technology</a> at the <a href="https://ustc.edu.cn/"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/ustc_logo2_01.jpg" alt="">University</span> of Science and Technology of China (USTC)</a>.
I was a member of the <a href="https://acsa.ustc.edu.cn/"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--lab" src="/images/acsa-emblem.png" alt="">Advanced</span> Computer Systems Architecture (ACSA) Laboratory</a>, which is led by <a href="https://cs.ustc.edu.cn/2020/0426/c23235a460072/page.htm">Professor Hong An</a>.
Before that, I obtained my bachelor's degree in Computer Science from the <a href="https://cie.nwsuaf.edu.cn/en/index.htm"><span class="affiliation-label"><img class="affiliation-logo" src="/images/nwafu-cie-emblem.png" alt="">College</span> of Information Engineering (CIE)</a> at <a href="https://en.nwsuaf.edu.cn/"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/nwafu-circle_01.jpg" alt="">Northwest</span> A&amp;F University</a> in 2023.
During my undergraduate studies, I joined the <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--lab" src="/images/parallel-visual-processing-emblem.png" alt="">Parallel</span> and Visual Processing Laboratory</a> led by <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Professor Bin Liu</a>.

<br>

<!-- As the <strong>first author</strong>, I have published in Journal of Computer Science and Technology (JCST), Performance Evaluation (PEVA), and IEEE/ACM Transactions on Computational Biology and Bioinformatics (TCBB).
Since 2026, I have served as a reviewer for IEEE Transactions on Parallel and Distributed Systems (TPDS). -->

My research interests lie at the intersection of <strong>high-performance computing</strong>, <strong>machine learning systems</strong>, and <strong>distributed training</strong>. Specifically, I focus on:

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Gradient Compression</strong> — Combining gradient sparsification with pipelined communication to reduce synchronization overhead in large-scale data-parallel training while preserving model accuracy.</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Memory-Efficient Training</strong> — Designing runtimes that adapt GPU memory management to workload demands to lower peak memory use and sustain training throughput.</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Efficient Multimodal Inference</strong> — Coordinating request scheduling, GPU memory management, and power control to meet latency targets and reduce energy use when serving mixed text and image generation requests.</li>
</ul>

<br>

<strong>I am currently seeking PhD opportunities for Spring/Fall 2027.</strong>

</div>

</section>

<!-- ==================== Education Section ==================== -->
<section id="education">

<h2>📖 Education</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 2.0;">

<div class="education-heading">
    <span><strong><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/ustc_logo2_01.jpg" alt="">University</span> of Science and Technology of China</strong> (C9 League, 985 &amp; 211 University)</span>
    <span class="education-date">2023–2026</span>
</div>
<ul style="list-style-type: disc; margin-left: 20px; margin-top: 8px; margin-bottom: 20px;">
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Master's degree in Computer Science and Technology, <a href="https://cs.ustc.edu.cn"><span class="affiliation-label"><img class="affiliation-logo" src="/images/ustc-cs-emblem.png" alt="">School</span> of Computer Science and Technology</a></li>
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Lab: <a href="https://acsa.ustc.edu.cn/"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--lab" src="/images/acsa-emblem.png" alt="">Advanced</span> Computer Systems Architecture (ACSA) Laboratory</a>, led by <a href="https://cs.ustc.edu.cn/2020/0426/c23235a460072/page.htm">Professor Hong An</a></li>
</ul>

<div class="education-heading">
    <span><strong><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/nwafu-circle_01.jpg" alt="">Northwest</span> A&amp;F University</strong> (985 &amp; 211 University)</span>
    <span class="education-date">2019–2023</span>
</div>
<ul style="list-style-type: disc; margin-left: 20px; margin-top: 8px; margin-bottom: 20px;">
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Bachelor's degree in Computer Science and Technology, <a href="https://cie.nwsuaf.edu.cn/en/index.htm"><span class="affiliation-label"><img class="affiliation-logo" src="/images/nwafu-cie-emblem.png" alt="">College</span> of Information Engineering</a></li>
    <li style="margin-bottom: 12px; line-height: 2.2 !important;">Lab: <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--lab" src="/images/parallel-visual-processing-emblem.png" alt="">Parallel</span> and Visual Processing Laboratory</a>, led by <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Professor Bin Liu</a></li>
</ul>

</div>

</section>

<!-- ==================== Publication Section ==================== -->
<section id="publication">

<h2>📝 Publications</h2>

<div style="font-family: 'Times New Roman', Times, serif;">

<h3>📚 Published Papers</h3>

{% assign sorted_publications = site.publications | sort: 'rank' | reverse %}
{% for post in sorted_publications %}
  {% include archive-single-publication.html %}
{% endfor %}

</div>

</section>

<!-- ==================== Project Section ==================== -->
<section id="project">

<h2>📽️ Research Projects</h2>

<div style="font-family: 'Times New Roman', Times, serif;">

<h3>🚀 Ongoing Project</h3>
<ul>
    <li>
        <strong>Dataflow Programming and Runtime System Framework Adapted to Domestic Heterogeneous System Architectures</strong><br>
        <em>Strategic Priority Research Program of Chinese Academy of Sciences</em><br>
        Role: Project Member | Duration: 2023 - Present<br>
        Focus: Gradient compression algorithms for efficient distributed training on heterogeneous architectures
    </li>
</ul>

<h3>🎉 Completed Projects</h3>

{% assign sorted_projects = site.projects | sort: 'rank' | reverse %}
{% for post in sorted_projects %}
  {% include archive-single-project.html %}
{% endfor %}

</div>

</section>

<!-- ==================== Experience Section ==================== -->
<section id="internship">

<h2>⭐ Experience & Academic Service</h2>

<ul class="experience-list">
  <!-- <li class="experience-entry">
    <span class="experience-date">Aug 2026 – Present</span>
    <div class="experience-body">
      <strong class="experience-role">Research Assistant</strong>
      <div class="experience-organization">Foundation Models and Federated Learning research group, University of Technology Sydney</div>
      <p class="experience-note">Supervised by <a href="https://profiles.uts.edu.au/Guodong.Long">Prof. Guodong Long</a></p>
    </div>
  </li> -->
  <li class="experience-entry">
    <span class="experience-date">2026 – Present</span>
    <div class="experience-body">
      <strong class="experience-role">Reviewer</strong>
      <div class="experience-organization">IEEE Transactions on Parallel and Distributed Systems (TPDS)</div>
    </div>
  </li>
  <li class="experience-entry">
    <span class="experience-date">Jul 2025 – Jan 2026</span>
    <div class="experience-body">
      <strong class="experience-role">Research Assistant</strong>
      <div class="experience-organization">Systems and Networking Lab, <span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/hku-logo-eps_01.jpg" alt="">The University</span> of Hong Kong</div>
      <p class="experience-note">Supervised by <a href="https://i.cs.hku.hk/~heming/">Prof. Heming Cui</a>, focusing on distributed training for unified multimodal large models.</p>
    </div>
  </li>
  <li class="experience-entry">
    <span class="experience-date">Jul 2025</span>
    <div class="experience-body">
      <strong class="experience-role">Participant</strong>
      <div class="experience-organization">Hong Kong PhD Fellowship Summer Workshop, <span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/CUHK_logo_01.jpg" alt="">The Chinese</span> University of Hong Kong</div>
    </div>
  </li>
  <li class="experience-entry experience-entry--compact">
    <span class="experience-date">Aug 2023</span>
    <div class="experience-body">
      <div class="experience-heading"><strong class="experience-role">Participant</strong> <span class="experience-separator" aria-hidden="true">&middot;</span> <span class="experience-organization"><a href="https://dl.ccf.org.cn/albumList/getMeetingDetail6666263336028160">CCF HPC China 2023</a></span></div>
    </div>
  </li>
  <li class="experience-entry experience-entry--compact">
    <span class="experience-date">Fall 2022</span>
    <div class="experience-body">
      <div class="experience-heading"><strong class="experience-role">Teaching Assistant</strong> <span class="experience-separator" aria-hidden="true">&middot;</span> <span class="experience-organization">Parallel Computing</span></div>
      <p class="experience-note"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/nwafu-circle_01.jpg" alt="">Northwest</span> A&amp;F University &middot; Assisted <a href="https://cie.nwsuaf.edu.cn/szdw/js/2014110093/index.htm">Prof. Bin Liu</a></p>
    </div>
  </li>
  <li class="experience-entry experience-entry--compact">
    <span class="experience-date">Summer 2022</span>
    <div class="experience-body">
      <div class="experience-heading"><strong class="experience-role">AI Trainee</strong> <span class="experience-separator" aria-hidden="true">&middot;</span> <span class="experience-organization"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--wordmark" src="/images/tedu-logo.png" alt="">Tedu</span> Group</span></div>
      <p class="experience-note">Developed a multi-object image annotation platform.</p>
    </div>
  </li>
  <li class="experience-entry experience-entry--compact">
    <span class="experience-date">Summer 2021</span>
    <div class="experience-body">
      <div class="experience-heading"><strong class="experience-role">Participant</strong> <span class="experience-separator" aria-hidden="true">&middot;</span> <span class="experience-organization"><span class="affiliation-label"><img class="affiliation-logo affiliation-logo--wordmark" src="/images/baidu-logo.png" alt="">Baidu</span> AI Talents Camp</span></div>
      <p class="experience-note">Studied machine learning and PaddlePaddle.</p>
    </div>
  </li>
  <li class="experience-entry">
    <span class="experience-date">2019 – 2020</span>
    <div class="experience-body">
      <strong class="experience-role">Staff Member</strong>
      <div class="experience-organization">New Media Center, <span class="affiliation-label"><img class="affiliation-logo affiliation-logo--university" src="/images/nwafu-circle_01.jpg" alt="">Northwest</span> A&amp;F University</div>
    </div>
  </li>
</ul>

</section>

<!-- ==================== Award Section ==================== -->
<section id="award">

<h2>🏆 Awards</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<h3>🔥 Scholarships</h3>
<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">National Scholarship</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">President Scholarship</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Thanksgiving Scholarship for Modern and Contemporary Chinese Scientists</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">First-Class Professional Scholarship</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">First-Class Academic Scholarship</li>
</ul>

<h3>✨ Honors</h3>
<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Outstanding Graduate</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Excellent College Student</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">Advanced Individual in Social Practice</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;">One of the 100 Campus Stars - Top Ten Scientific Research Stars </li>
</ul>

</div>

</section>

<!-- ==================== Competition Section ==================== -->
<section id="competition">

<h2>✅ Competitions</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<ul class="competition-list">
  <li class="competition-entry">
    <strong class="competition-award">Third Prize</strong>
    <div class="competition-body">
      <span class="competition-name">11th Student RDMA Programming Competition</span>
    </div>
  </li>
  <li class="competition-entry">
    <strong class="competition-award">Meritorious Winner</strong>
    <div class="competition-body">
      <span class="competition-name">2022 Mathematical Contest in Modeling (MCM)</span>
    </div>
  </li>
  <li class="competition-entry">
    <strong class="competition-award">First Prize</strong>
    <div class="competition-body">
      <span class="competition-name">12th Blue Bridge Cup <span class="competition-name-end">Competition
        <span class="competition-level">Provincial Competition</span></span></span>
    </div>
  </li>
  <li class="competition-entry">
    <strong class="competition-award">Third Prize</strong>
    <div class="competition-body">
      <span class="competition-name">2021 Group Programming Ladder <span class="competition-name-end">Tournament
        <span class="competition-level">National</span></span></span>
    </div>
  </li>
  <li class="competition-entry">
    <strong class="competition-award">First Prize</strong>
    <div class="competition-body">
      <span class="competition-name">2022 The Competition of Computer <span class="competition-name-end">Design
        <span class="competition-level">Northwest Region</span></span></span>
    </div>
  </li>
  <li class="competition-entry">
    <strong class="competition-award">Second Prize</strong>
    <div class="competition-body">
      <span class="competition-name">12th National Mathematics Competition for College Students</span>
    </div>
  </li>
</ul>

</div>

</section>

<!-- ==================== Skill Section ==================== -->
<section id="skill">

<h2>⚙️ Technical Skills</h2>

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

<ul style="margin-bottom: 1.5em;">
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Parallel &amp; Distributed Computing:</strong> CUDA C, MPI, NCCL, OpenMP</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>ML Frameworks &amp; Libraries:</strong> PyTorch, DeepSpeed, TensorFlow, PaddlePaddle</li>
    <li style="margin-bottom: 12px; line-height: 2.0 !important;"><strong>Programming Languages:</strong> C/C++, Python</li>
</ul>

</div>

</section>
