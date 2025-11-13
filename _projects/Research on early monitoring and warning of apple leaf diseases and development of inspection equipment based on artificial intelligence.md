---
title: "Research on early monitoring and warning of apple leaf diseases and development of inspection equipment based on artificial intelligence"
collection: projects
permalink: /projects/apple-disease-monitoring
project_type: "Member; Provincial Key Research Program (2021 Jan to 2022 Dec)"
badge: "2021-2022"
badge_class: "badge-project"
image: "/images/projects/apple-disease-monitoring.png"
description: "AI-based early detection system for apple leaf diseases with inspection robot development and cloud monitoring platform."
keywords: "<strong>AI Diagnosis</strong>, <strong>Inspection Robot</strong>, <strong>Cloud Platform</strong>, <strong>Disease Detection</strong>"
thumbnail: "http://zhuxy-cs.github.io/images/apple_disease_thumbnail.jpg"
demo: "#demo"
rank: 2021
---

<style>
.page__content p, .page__content li {
    text-align: justify !important;
}
</style>

********************************

<h2>🎯 Project Aim</h2>
<ul style="text-align: justify;">
<li>Realize the automatic inspection in the orchard</li>
<li>Construct monitoring and early warning platform</li>
</ul>

<h2>📓 Project Content</h2>
<ul style="text-align: justify;">
<li>Establishment of Apple Leaf Diseases and Pests Sample Set and Big Data Platform</li>
<li>Build a new real-time diagnosis model for early-stage diseases and pests of apple leaves.</li>
<li>Develop an inspection robot for diseases and pests on apple leaves and create a monitoring and early warning platform.</li>
<li>Construction, Integration and Demonstration Application of the Cloud-based Collaborative Platform</li>
</ul>

<h2>🪨 Project Difficulties</h2>
<p style="text-align: justify;">The deep convolutional neural network algorithm for diagnosing diseases and pests on apple leaves has become a research hotspot in the field of smart agriculture both at home and abroad. Although significant breakthroughs have been made in model construction and disease and pest diagnosis in previous research work, there are still some technical challenges in the real-time detection of early-stage diseases and pests on apple leaves and the development of related equipment:</p>
<ul style="text-align: justify;">
<li>The sample set needs to fully cover the onset characteristics and patterns of early-stage diseases and pests on apple leaves. Given that the models in existing target detection technologies have extremely high requirements for early-stage images of diseases and pests, how to capture and collect sufficient early-stage disease and pest images under natural light conditions, and at the same time use data enhancement technologies such as generative adversarial networks to generate a large number of high-quality samples. Also, how to evaluate the quality of the generated samples from the two aspects of diversity and resolution to ensure the quality of the dataset is the first challenge in this project.</li>
<li>Under open and complex environments, the diagnosis model for diseases and pests on apple leaves should have an adaptive mechanism. Since different neural network algorithms have their own advantages, how to integrate the advantages of these networks, propose an early-stage disease and pest detection model for apple leaves that takes into account both accuracy and speed, and how to achieve model adaptation in the face of unknown disease and pest situations is the </li>
<li>Under natural conditions such as severe occlusion, the inspection robot should have comprehensive real-time monitoring capabilities. From the perspective of feature analysis, the samples to be detected have situations such as large differences within the same species, small differences between similar species, and serious lack of feature information, making the detection extremely difficult. Based on the research on model optimization and compression technologies for inspection robots of apple leaf diseases with limited resources, how to improve the inference speed of the robot's detection is the third challenge in this project.</li>
</ul>

<h2 id="demo"> ☁️ The demo of detection on the web</h2>

<div style="text-align: center;">
  <video width="640" height="360" controls
         poster="http://zhuxy-cs.github.io/images/apple_disease_thumbnail.jpg"
         style="display: block; margin: auto; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); border-radius: 8px;">
    <source src="http://zhuxy-cs.github.io/videos/apple_disease_detection_web.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>
