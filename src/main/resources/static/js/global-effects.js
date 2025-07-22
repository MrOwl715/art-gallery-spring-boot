document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===============================================
    // Hiệu ứng 1: Trang web xuất hiện mềm mại khi tải
    // ===============================================
    // Xóa class 'preload' khỏi body để kích hoạt hiệu ứng transition trong CSS
    document.body.classList.remove('preload');


    // ===============================================
    // Hiệu ứng 2: Spotlight "màu mè" đi theo chuột
    // ===============================================
    // Chỉ kích hoạt hiệu ứng này trên các màn hình lớn (desktop)
    if (window.matchMedia("(min-width: 992px)").matches) {
        document.body.addEventListener('mousemove', e => {
            // Cập nhật vị trí của chuột vào các biến CSS
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
    }


    // ===============================================
    // Hiệu ứng 3: Các thẻ (card) hiện ra khi cuộn chuột
    // ===============================================
    // Sử dụng Intersection Observer API để có hiệu năng tốt nhất
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Kích hoạt khi 10% của element hiện ra
    });

    // Tìm tất cả các thẻ có class .card và quan sát chúng
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        observer.observe(card);
    });

});

// Thêm vào file: js/global-effects.js

// ===============================================
// Hiệu ứng 5: Kích hoạt và làm đẹp Tooltip
// ===============================================
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"], [title]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));