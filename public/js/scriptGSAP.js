// GSAP Animation for "upload" with Stagger and Blink
gsap.from("h1 span", {
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.1,
  ease: "back.out(1.7)",
  onStart: function () {
    // Add blinking effect for each letter
    gsap.to("h1 span", {
      keyframes: [
        { opacity: 0, duration: 0.2 },
        { opacity: 1, duration: 0.2 },
        { opacity: 0, duration: 0.2 },
        { opacity: 1, duration: 0.2 },
      ],
      stagger: 0.1,
      repeat: 1, // Blink twice
      delay: 0.5,
    });
  },
});

gsap.from("p", {
  opacity: 0,
  y: 30,
  duration: 1,
  delay: 0.8,
  ease: "power2.out",
});
gsap.from(".space-y-10 div", {
  opacity: 0,
  y: 20,
  duration: 0.8,
  stagger: 0.2,
  delay: 1.0,
  ease: "power2.out",
});
gsap.from(".submit-btn", {
  opacity: 0,
  scale: 0.9,
  duration: 0.8,
  delay: 1.6,
  ease: "elastic.out(1, 0.5)",
});

// Form Submission Logic
document.querySelector(".submit-btn").addEventListener("click", () => {
  const teachersInput = document.querySelector('input[name="teachersFile"]');
  const subjectsInput = document.querySelector('input[name="subjectsFile"]');
  const roomsInput = document.querySelector('input[name="roomsFile"]');
  const form = document.getElementById("uploadForm");

  if (
    teachersInput instanceof HTMLInputElement &&
    subjectsInput instanceof HTMLInputElement &&
    roomsInput instanceof HTMLInputElement
  ) {
    form.querySelector('input[name="teachersFile"]').files = teachersInput.files;
    form.querySelector('input[name="subjectsFile"]').files = subjectsInput.files;
    form.querySelector('input[name="roomsFile"]').files = roomsInput.files;
    form.submit();
  }
});