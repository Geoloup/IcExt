function showTab(tabId) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
      tab.classList.remove('active');
  });

  // Show the selected tab
  const selectedTab = document.getElementById(tabId);
  selectedTab.classList.add('active');
}

// By default, show the first tab
document.addEventListener('DOMContentLoaded', () => {
  showTab('tab1');
});
