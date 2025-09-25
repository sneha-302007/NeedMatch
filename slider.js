document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".slider-img");
    const prevBtn = document.querySelector(".slider-btn.prev");
    const nextBtn = document.querySelector(".slider-btn.next");
    const sliderContainer = document.querySelector(".slider-container");

    let index = 0;
    let interval;

    function showSlide(i) {
        slides.forEach(slide => slide.classList.remove("active"));
        slides[i].classList.add("active");
    }

    function nextSlide() {
        index = (index + 1) % slides.length;
        showSlide(index);
    }

    function prevSlide() {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    }

    function startAutoSlide() {
        interval = setInterval(nextSlide, 3000);
    }

    function stopAutoSlide() {
        clearInterval(interval);
    }

    nextBtn.addEventListener("click", () => {
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
    });

    prevBtn.addEventListener("click", () => {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });

    // ⏸️ Pause on hover
    sliderContainer.addEventListener("mouseenter", stopAutoSlide);
    sliderContainer.addEventListener("mouseleave", startAutoSlide);

    showSlide(index);
    startAutoSlide();
});