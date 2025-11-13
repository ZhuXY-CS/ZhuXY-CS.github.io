---
title: "Early Diagnosis of Apple Leaf Pests and Diseases of Artificial Intelligence and Inspection Robots"
collection: projects
permalink: /projects/apple-inspection-robot
project_type: "Leader; Provincial Innovative Entrepreneurial Training Plan Program (2021 May to 2022 May)"
badge: "2021-2022"
badge_class: "badge-project"
image: "/images/projects/apple-inspection-robot.jpg"
description: "Deep learning models for early detection of apple leaf diseases with successful deployment on Jetson TX2 inspection robot."
keywords: "<strong>Deep Learning</strong>, <strong>LAD-Net</strong>, <strong>Jetson TX2</strong>, <strong>Inspection Robot</strong>"
demo: "#demo"
rank: 2022
---


********************************

<style>
.page__content p, .page__content li {
    text-align: justify !important;
}
</style>

<h2>🎯 Project Aim</h2>
<ul style="text-align: justify;">
<li>Design a lightweight deep learning pipeline that identifies early-stage apple leaf pests and diseases with high accuracy.</li>
<li>Deploy the optimized model on Jetson TX2 and integrate it with an autonomous inspection robot for in-orchard monitoring.</li>
</ul>

<h2>📓 Project Content</h2>
<ul style="text-align: justify;">
<li>Collected field images covering eight early-stage apple leaf diseases and expanded the dataset ~12× through digital augmentation to support robust training.</li>
<li>Adopted Mosaic augmentation and proposed the Apple-CSP lightweight module to improve recognition of small lesion targets while keeping the network compact.</li>
<li>Introduced asymmetric dilated convolution and the LAD-Inception structure, leading to LAD-Net and ALS-Net models that balance accuracy, speed, and parameter count.</li>
<li>Ported the models to Jetson TX2 and collaborated on a wheeled inspection robot with remote monitoring, autonomous navigation, and cloud data synchronization.</li>
</ul>

<h2>🪨 Project Difficulties</h2>
<p style="text-align: justify;">Key challenges encountered during the project included:</p>
<ul style="text-align: justify;">
<li>Capturing sufficient early-stage disease imagery under natural light while maintaining dataset diversity and quality after augmentation.</li>
<li>Preserving detection accuracy for tiny lesions despite aggressive lightweighting required for edge deployment.</li>
<li>Achieving stable hardware-software integration on the resource-constrained Jetson TX2 platform, including navigation, perception, and cloud connectivity for the inspection robot.</li>
</ul>


<h2 id="demo"> 🌾 The demo of detection in the field experiment</h2>

<div style="text-align: center;">
  <video width="640" height="360" controls
         poster="http://zhuxy-cs.github.io/images/robot_based_detection_experiment.png"
         style="display: block; margin: auto; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); border-radius: 8px;">
    <source src="http://zhuxy-cs.github.io/videos/robot_experiment.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>
