---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
hide_title: true
---

<p class="home-section-kicker">Research output</p>
<h1>Publications</h1>
<p>My work spans communication-efficient distributed training, performance modeling, high-performance computing, and efficient machine learning.</p>

{% assign sorted_publications = site.publications | sort: 'rank' | reverse %}
{% for post in sorted_publications %}
  {% include archive-single-publication.html %}
{% endfor %}
