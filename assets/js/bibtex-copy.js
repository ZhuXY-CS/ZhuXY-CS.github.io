// assets/js/bibtex-copy.js
(function () {
  function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    const originalBg = button.style.background || '#0066cc';
    button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
    button.style.background = '#28a745';
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = originalBg;
    }, 1600);
  }

  function fallbackCopy(text, button) {
    // 兼容 Safari/iOS 的可选中隐藏域：不使用 z-index:-1
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';   // 离屏但可选中
    ta.style.opacity = '0';
    document.body.appendChild(ta);

    let ok = false;
    try {
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (ok) showCopySuccess(button);
    else alert('自动复制失败，请按 Ctrl/Cmd + C 复制选中的文本');
  }

  async function copyText(text, button) {
    // 优先 Clipboard API（需 HTTPS 或 localhost）
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(button);
        return;
      } catch (e) {
        // 继续走 fallback
      }
    }
    fallbackCopy(text, button);
  }

  function bindAll() {
    document.querySelectorAll('.bibtex-copy-btn').forEach((btn) => {
      // 避免重复绑定
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';

      btn.addEventListener('click', () => {
        const box = btn.closest('.bibtex-box');
        const pre = box && box.querySelector('.bibtex-content');
        const text = pre ? (pre.textContent || pre.innerText || '') : '';
        copyText(text, btn);
      });

      btn.addEventListener('mouseover', () => (btn.style.background = '#0052a3'));
      btn.addEventListener('mouseout',  () => (btn.style.background = '#0066cc'));
    });
  }

  // 首次加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  // 若站点使用 PJAX/Turbo 等无刷新导航，这里再兜一层
  window.addEventListener('pageshow', bindAll);
})();