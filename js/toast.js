// tech-inventory/js/toast.js
// Storefront toast notifications

function showToast(message, type = 'success') {

  let container =
    document.getElementById('toast-container');

  if (!container) {

    container = document.createElement('div');

    container.id = 'toast-container';

    document.body.appendChild(container);

  }


  const toast =
    document.createElement('div');

  toast.className =
    `storefront-toast toast-${type}`;


  const icon =
    type === 'error'
      ? '✕'
      : type === 'warning'
        ? '!'
        : '✓';


  toast.innerHTML = `
    <span class="toast-icon">
      ${icon}
    </span>

    <span class="toast-message">
      ${message}
    </span>
  `;


  container.appendChild(toast);


  setTimeout(() => {

    toast.classList.add('toast-hide');

    setTimeout(() => {
      toast.remove();
    }, 250);

  }, 3000);

}