document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const targetSection = document.getElementById('why-securepass');
  
  const handleScroll = () => {
    if (!targetSection) return;
    
    const triggerPoint = targetSection.offsetTop - 100; // Trigger slightly before the section hits top
    
    if (window.scrollY > triggerPoint) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Trigger once on load in case page is already scrolled
  handleScroll();
});
