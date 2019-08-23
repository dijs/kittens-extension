function sendAction(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, action, function() {
      console.log('success');
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.autocraft input[type="checkbox"]').forEach(el => {
    el.addEventListener('change', e => {
      const type = e.target.dataset.type;
      if (e.target.checked) {
        const threshold = parseInt(
          e.target.parentElement.querySelector('.threshold').value
        );
        sendAction({ type, threshold });
      } else {
        sendAction({ type, threshold: false });
      }
    });
  });

  document.querySelectorAll('.autocraft .threshold').forEach(el => {
    el.addEventListener('change', e => {
      sendAction({
        type: e.target.dataset.type,
        threshold: parseInt(e.target.value)
      });
    });
  });
});
