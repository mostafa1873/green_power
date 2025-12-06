// * الإعدادات الأساسية والثوابت (لكلا الصفحتين) *

const lang = document.documentElement.lang; // جلب اللغة الحالية: 'en', 'ar', 'it'
const params = new URLSearchParams(window.location.search);
const id = params.get("id"); // جلب الـ ID لتفاصيل المنتج

// 1. تعريف رقم الهاتف
const phoneNumber = "201103009403";

// 2. نصوص زر 'View Details' (لصفحة المنتجات)
const buttonTexts = {
    en: "View Details",
    ar: "عرض التفاصيل",
    it: "Vedi Dettagli"
};
const buttonText = buttonTexts[lang] || buttonTexts.en;

// 3. نصوص وأهداف زر الواتساب (لصفحة التفاصيل)
const whatsappData = {
    // English
    en: {
        text: "Order via WhatsApp",
        message: "Hello, I am interested in ordering the product: ",
        variants_title: "Available Variants & Sizes",
        not_found: "<h2>Product Not Found</h2>"
    },
    // Arabic
    ar: {
        text: "اطلب الآن عبر واتساب",
        message: "مرحباً، أنا مهتم بطلب المنتج: ",
        variants_title: "الأصناف والأحجام المتوفرة",
        not_found: "<h2>المنتج غير موجود</h2>"
    },
    // Italian
    it: {
        text: "Ordina su WhatsApp",
        message: "Ciao, sono interessato a ordinare il prodotto: ",
        variants_title: "Varianti e Misure Disponibili",
        not_found: "<h2>Prodotto non trovato</h2>"
    }
};
const currentWhatsapp = whatsappData[lang] || whatsappData.en;


// 4. دالة لإنشاء قائمة التباينات (Variants List)
function createVariantsList(variants, currentLang) {
    if (!variants || variants.length === 0) {
        return '';
    }

    let listHtml = `<h4 class="variants-title">${currentWhatsapp.variants_title}</h4><ul class="variants-list">`;
    
    variants.forEach(variant => {
        const variantName = variant[`name_${currentLang}`] || variant.name_en; 
        listHtml += `<li><i class="fa-solid fa-seedling"></i> ${variantName}</li>`;
    });

    listHtml += `</ul>`;
    return listHtml;
}


// * معالج تحميل بيانات المنتج (صفحة التفاصيل) *

if (id) {
    fetch("products.json")
        .then(res => res.json())
        .then(data => {
            const product = data.products.find(p => p.id == id);

            if (!product) {
                document.getElementById("productDetails").innerHTML = currentWhatsapp.not_found;
                return;
            }

            const name = product[`name_${lang}`];
            const description = product[`description_${lang}`];
            const whatsappMessage = encodeURIComponent(
                `${currentWhatsapp.message} ${name}.`
            );
            const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
            const variantsListHtml = createVariantsList(product.variants, lang);

            document.getElementById("productDetails").innerHTML = `
                <div class="product-left">
                    <img src="${product.image}" alt="${name}">
                </div>

                <div class="product-right">
                    <h1>${name}</h1>
                    
                    <p class="desc">${description}</p>
                    
                    ${variantsListHtml}

                    <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                        <i class="fa-brands fa-whatsapp"></i> ${currentWhatsapp.text} 
                    </a>
                </div>
            `;
        })
        .catch(err => console.error("Error fetching product details:", err));
}


// * معالج تحميل المنتجات (صفحة المنتجات) *

else {
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('products-container');
            if (!container) return;

            data.products.forEach(product => {
                let name = product[`name_${lang}`];
                let description = product[`description_${lang}`].substring(0, 80) + '...';
                let productPage = `product-detail.html?id=${product.id}&lang=${lang}`; 

                const card = document.createElement('div');
                card.classList.add('col-lg-4', 'col-md-6', 'mb-4');
                card.innerHTML = `
                    <div class="product-card">
                        <img src="${product.image}" alt="${name}">
                        <div class="product-content">
                            <h3>${name}</h3>
                            <a href="${productPage}" class="btn-details">${buttonText}</a> 
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => console.error("Error fetching products list:", err));
}

// * وظائف شريط التنقل (Navbar Functions) *

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Navbar Scroll Effect (إضافة كلاس عند التمرير)
    window.addEventListener("scroll", function () {
        let navbar = document.querySelector(".navbar");
        
        if (navbar) {
            if (window.scrollY > 2) {
                navbar.classList.add("navbar-scrolled");
            } else {
                navbar.classList.remove("navbar-scrolled");
            }
        }
    });

    // 2. Active Link State (تفعيل الرابط النشط)
    let currentFilePath = window.location.pathname.split('/').pop() || 'index.html'; 
    currentFilePath = currentFilePath.split('?')[0]; 
    
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        // الحصول على اسم الملف من رابط العنصر وتجريده من معلمات URL
        let linkFilePath = link.getAttribute('href').split('/').pop();
        linkFilePath = linkFilePath.split('?')[0]; 
        
        // تفعيل الرابط إذا تطابق اسم الملف
        if (linkFilePath === currentFilePath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. Fix Language Switch (تصحيح تبديل اللغة في صفحة التفاصيل)
    const currentId = params.get("id");
    const langDropdown = document.getElementById('language-switcher-dropdown'); 

    if (currentId && langDropdown) {
        
        const isCurrentPageInSubFolder = lang !== 'en';

        langDropdown.querySelectorAll('a').forEach(link => {
            const currentHref = link.getAttribute('href'); 
            
            let newLangCode = 'en'; 
            if (link.textContent.includes('Arabic') || currentHref.includes('/ar/')) {
                newLangCode = 'ar';
            } else if (link.textContent.includes('Italian') || currentHref.includes('/it/')) {
                newLangCode = 'it';
            }
            
            let targetPath = `product-detail.html`;
            if (newLangCode !== 'en') {
                targetPath = `${newLangCode}/product-detail.html`;
            }
            
            let pathPrefix = isCurrentPageInSubFolder ? '../' : '';
            
            const finalPath = `${pathPrefix}${targetPath}`;
            
            link.href = `${finalPath}?id=${currentId}&lang=${newLangCode}`;
        });
    }

    setTimeout(() => {
        let heroText = document.querySelector(".hero-text");
        if (heroText) {
            heroText.classList.add("visible");
        }
    }, 700);
});