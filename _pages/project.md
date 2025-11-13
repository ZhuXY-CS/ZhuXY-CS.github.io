---
layout: archive
title: "Research Projects"
permalink: /project/
author_profile: true
hide_title: true
---

<h2>🚀 Ongoing Projects</h2>
<div style="font-family: 'Times New Roman', Times, serif;">
    <ul>
        <li>
            <strong>Dataflow Programming and Runtime System Framework Adapted to Domestic Heterogeneous System Architectures</strong><br>
            <em>Strategic Priority Research Program of Chinese Academy of Sciences</em><br>
            Role: Project Member | Duration: 2023 - Present<br>
            Focus: Gradient compression algorithms for efficient distributed training on heterogeneous architectures
        </li>
    </ul>
</div>

**********************************************************

<h2>🎉 Completed Projects</h2>

{% assign sorted_projects = site.projects | sort: 'rank' | reverse %}
{% for post in sorted_projects %}
  {% include archive-single-project.html %}
{% endfor %}


{% include base_path %}

<!-- New style rendering if publication categories are defined -->
{% if site.publication_category %}
  {% for category in site.publication_category  %}
    {% assign title_shown = false %}
    {% for post in site.publications reversed %}
      {% if post.category != category[0] %}
        {% continue %}
      {% endif %}
      {% unless title_shown %}
        <h2>{{ category[1].title }}</h2><hr />
        {% assign title_shown = true %}
      {% endunless %}
      {% include archive-single.html %}
    {% endfor %}
  {% endfor %}
{% else %}
  {% for post in site.publications reversed %}
    {% include archive-single.html %}
  {% endfor %}
{% endif %}