/**
 * 单页面平滑滚动和导航高亮功能
 */

document.addEventListener('DOMContentLoaded', function() {

  // 1. 平滑滚动到锚点
  const navLinks = document.querySelectorAll('a[href^="/#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').replace('/#', '');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 计算滚动位置（考虑导航栏高度）
        const navHeight = 60; // 导航栏高度
        const targetPosition = targetElement.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // 更新URL但不刷新页面
        history.pushState(null, null, '#' + targetId);
      }
    });
  });

  // 2. 滚动时高亮当前区块对应的导航项
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.greedy-nav a[href^="/#"]');

  function highlightNavigation() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // 偏移量

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.parentElement.classList.remove('active');
      if (item.getAttribute('href') === '/#' + currentSection) {
        item.parentElement.classList.add('active');
      }
    });
  }

  // 监听滚动事件
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(highlightNavigation);
  });

  // 页面加载时检查URL中的锚点
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setTimeout(() => {
        const navHeight = 60;
        const targetPosition = targetElement.offsetTop - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  // 初始高亮
  highlightNavigation();
});
