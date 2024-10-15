let swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 40,
    navigation: {
        nextEl: ".box-btn-right",
        prevEl: ".box-btn-left"
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        1100: {
            slidesPerView: 3,
            spaceBetween: 5,
        },
    },
});