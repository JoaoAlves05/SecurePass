document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const targetSection = document.getElementById('why-securepass');
  
  const handleScroll = () => {
    // Trigger immediately after scrolling a bit
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Trigger once on load in case page is already scrolled
  handleScroll();
});
