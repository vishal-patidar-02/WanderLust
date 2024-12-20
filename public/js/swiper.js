document.addEventListener("DOMContentLoaded", function () {
    const swiper = new Swiper(".mySwiper", {
      slidesPerView: 10,
      spaceBetween: 20,
      slidesPerGroup: 3,
      breakpoints: {
        50: {
          slidesPerView: 4, // On smallest screens,
          slidesPerGroup: 3,
        },
        400: {
          slidesPerView: 4, // On smallest screens,
          slidesPerGroup: 3,
        },
        640: {
          slidesPerView: 6, // On smaller screens,
          slidesPerGroup: 4,
        },
        768: {
          slidesPerView: 7, // On medium screens,
          slidesPerGroup: 4,
        },
        1024: {
          slidesPerView: 10, // On larger screens,
          slidesPerGroup: 6,
        },
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  });

  // let taxSwitch = document.getElementById("flexSwitchCheckDefault");
  // taxSwitch.addEventListener("click", () => {
  //   let taxInfo = document.getElementsByClassName("tax-info");
  //   for (info of taxInfo) {
  //     if (info.style.display != "inline") {
  //       info.style.display = "inline";
  //     } else {
  //       info.style.display = "none";
  //     }
  //   }
  // });