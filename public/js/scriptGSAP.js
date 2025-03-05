// Selecting all letters and applying stagger animation
gsap.from(".letter", {
  opacity: 0,
  y: 20,
  duration: 0.6,
  stagger: 0.1, // Now stagger will work
  ease: "power3.out",
});
