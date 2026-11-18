export interface SiteContent {
  articles?: Article[];
  branding: {
    siteName: string;
    siteTagline: string;
    logoUrl: string;
    navLinks: Array<{ label: string; url: string }>;
    contactButtonText: string;
    contactButtonUrl: string;
  };
  home: {
    hero: {
      badge: string;
      title: string;
      description: string;
      bgImage: string;
      ctaPrimaryText: string;
      ctaPrimaryLink: string;
      ctaSecondaryText: string;
      ctaSecondaryLink: string;
      features: Array<{ title: string; subtitle: string; icon: string }>;
    };
    services: {
      badge: string;
      title: string;
      subtitle: string;
      viewAllText: string;
      items: Array<{
        title: string;
        description: string;
        image: string;
        link: string;
      }>;
    };
    process: {
      badge: string;
      title: string;
      subtitle: string;
      steps: Array<{ number: string; title: string; description: string }>;
    };
    styles: {
      badge: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; description: string; image: string }>;
    };
    projects: {
      badge: string;
      title: string;
      subtitle: string;
      categories: string[];
      items: Array<{
        title: string;
        location: string;
        image: string;
        category: string;
        link?: string;
      }>;
    };
    testimonials: {
      badge: string;
      title: string;
      items: Array<{
        name: string;
        role: string;
        content: string;
        avatar?: string;
        rating: number;
      }>;
    };
    locations: {
      badge: string;
      title: string;
      subtitle: string;
      items: Array<{ name: string; address: string; phone: string }>;
    };
    parallaxBanner: {
      title: string;
      subtitle: string;
      buttonText: string;
      buttonLink: string;
      bgImage: string;
    };
    faq: {
      badge: string;
      title: string;
      items: Array<{ question: string; answer: string }>;
    };
    contact: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      titleLine3: string;
      description: string;
      phone: string;
      phoneHours: string;
      email: string;
      emailSubtitle: string;
      address: string;
      addressDetail: string;
      instagram: string;
      instagramSubtitle: string;
      formTitle: string;
      formSubtitle: string;
    };
    map: {
      title: string;
      embedUrl: string;
    };
    cta: {
      title: string;
      subtitle: string;
      buttonText: string;
      buttonLink: string;
    };
  };
  layananPage: {
    intro: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
      bgImage: string;
    };
    servicesDetail: {
      badge: string;
      title: string;
      description: string;
      items: Array<{
        number: string;
        title: string;
        description: string;
        image: string;
      }>;
    };
    whyUs: {
      badge: string;
      title: string;
      description: string;
      items: Array<{ title: string; description: string; icon: string }>;
    };
  };
  portofolioPage: {
    intro: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
      bgImage: string;
      stats: Array<{ number: string; label: string }>;
    };
    gallery: {
      badge: string;
      title: string;
      subtitle: string;
      categories: Array<{ id: string; label: string }>;
      items: Array<{
        id: number;
        category: string;
        title: string;
        location: string;
        type: string;
        image: string;
      }>;
    };
    banner: {
      title: string;
      subtitle: string;
      buttonText: string;
      buttonLink: string;
    };
  };
  tentangKamiPage: {
    intro: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
      bgImage: string;
      whoWeAreBadge: string;
      whoWeAreTitle: string;
      whoWeAreImage: string;
      whoWeAreParagraph1: string;
      whoWeAreParagraph2: string;
    };
    vision: {
      badge: string;
      title: string;
      visionText: string;
      missionTitle: string;
      missions: string[];
    };
    values: {
      badge: string;
      title: string;
      items: Array<{ title: string; description: string }>;
    };
    experience: {
      badge: string;
      title: string;
      subtitle: string;
      items: Array<{ year: string; title: string; description: string }>;
    };
  };
  footer: {
    aboutText: string;
    copyrightText: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
  };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  focusKeyword?: string;
  excerpt: string;
  category: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  status: "draft" | "published";
  body: string;
  seoTitle: string;
  seoDescription: string;
}

export const initialContent: SiteContent = {
  branding: {
    siteName: "Hansen",
    siteTagline: "Projects",
    logoUrl: "/logo-hansen.png",
    navLinks: [
      { label: "Beranda", url: "/" },
      { label: "Tentang Kami", url: "/tentang-kami" },
      { label: "Layanan", url: "/layanan" },
      { label: "Portofolio", url: "/portofolio" },
      { label: "Artikel", url: "/artikel" },
      { label: "Kontak", url: "#kontak-kami" },
    ],
    contactButtonText: "HUBUNGI KAMI",
    contactButtonUrl: "#kontak-kami",
  },
  home: {
    hero: {
      badge: "CUSTOM FURNITURE & INTERIOR",
      title: "WUJUDKAN RUANGAN YANG LEBIH BAIK, BERSAMA HANSEN PROJECTS",
      description:
        "Furnitur custom yang dirancang sesuai kebutuhan, ukuran ruang, dan gaya hunian Anda. Dari sudut kecil hingga setiap ruang yang ingin Anda maksimalkan.",
      bgImage: "/background.jpg",
      ctaPrimaryText: "KONSULTASI BERSAMA KAMI",
      ctaPrimaryLink: "#kontak-kami",
      ctaSecondaryText: "LIHAT PROYEK KAMI",
      ctaSecondaryLink: "/portofolio",
      features: [
        { title: "KUALITAS", subtitle: "TERBAIK", icon: "diamond" },
        { title: "TIM", subtitle: "PROFESIONAL", icon: "users" },
        { title: "GARANSI", subtitle: "KEPUASAN", icon: "shield" },
      ],
    },
    services: {
      badge: "LAYANAN KAMI",
      title: "LAYANAN KAMI",
      subtitle:
        "Solusi interior yang komprehensif dan disesuaikan dengan kebutuhan Anda.",
      viewAllText: "Lihat Semua Layanan",
      items: [
        {
          title: "Desain Interior",
          description:
            "Konsep, perencanaan, dan pengembangan desain yang detail.",
          image: "/services/interior.jpg",
          link: "/layanan",
        },
        {
          title: "Desain & Konstruksi",
          description: "Dari konsep awal hingga realisasi akhir.",
          image: "/services/construction.jpg",
          link: "/layanan",
        },
        {
          title: "Konstruksi & Fit Out",
          description:
            "Pelaksanaan profesional untuk ruang komersial dan residensial.",
          image: "/services/fitout.jpg",
          link: "/layanan",
        },
        {
          title: "Furnitur Kustom",
          description:
            "Solusi furnitur yang disesuaikan dengan kebutuhan proyek Anda.",
          image: "/services/furniture.jpg",
          link: "/layanan",
        },
      ],
    },
    process: {
      badge: "PROSES KERJA",
      title: "PROSES KERJA KAMI",
      subtitle: "Langkah terstruktur untuk mewujudkan impian interior Anda.",
      steps: [
        {
          number: "01",
          title: "Konsultasi & Brainstorming",
          description:
            "Mendengarkan ide, kebutuhan ruang, dan preferensi anggaran Anda secara mendalam.",
        },
        {
          number: "02",
          title: "Perencanaan & Desain 3D",
          description:
            "Membuat konsep layout visual 3D yang detail serta pemilihan material terbaik.",
        },
        {
          number: "03",
          title: "Produksi & Fabrikasi",
          description:
            "Pengerjaan furnitur oleh tenaga ahli di workshop kami dengan standar presisi tinggi.",
        },
        {
          number: "04",
          title: "Instalasi & Final Check",
          description:
            "Pemasangan di lokasi dengan pengawasan ketat hingga garansi pasca instalasi.",
        },
      ],
    },
    styles: {
      badge: "GAYA DESAIN",
      title: "PILIKAN GAYA INTERIOR",
      subtitle: "Berbagai pilihan konsep estetika sesuai kepribadian Anda.",
      items: [
        {
          title: "Modern Minimalis",
          description:
            "Garis bersih, fungsi maksimal, dan estetika simpel yang elegan.",
          image: "/styles/minimalist.jpg",
        },
        {
          title: "Luxury Classic",
          description:
            "Kemewahan detail ornamen dengan sentuhan material premium.",
          image: "/styles/luxury.jpg",
        },
        {
          title: "Scandinavian",
          description:
            "Kehangatan elemen kayu alam dengan nuansa ruang yang terang.",
          image: "/styles/scandinavian.jpg",
        },
        {
          title: "Industrial",
          description:
            "Karakter unik dengan sentuhan ekspos struktur dan material maskulin.",
          image: "/styles/industrial.jpg",
        },
      ],
    },
    projects: {
      badge: "PROYEK TERPILIH",
      title: "PROYEK TERPILIH",
      subtitle:
        "Jelajahi beberapa proyek terbaru kami untuk ruang hunian, komersial, dan hospitality.",
      categories: [
        "Semua",
        "Hunian",
        "Komersial",
        "Perkantoran",
        "Hospitality",
      ],
      items: [
        {
          title: "Hunian Pribadi",
          location: "Jakarta",
          image: "/projects/residential.jpg",
          category: "Hunian",
        },
        {
          title: "Interior Kantor",
          location: "Tangerang",
          image: "/services/fitout.jpg",
          category: "Perkantoran",
        },
        {
          title: "Ruang Retail",
          location: "Bandung",
          image: "/styles/luxury.jpg",
          category: "Komersial",
        },
        {
          title: "Proyek Hospitality",
          location: "Bali",
          image: "/styles/scandinavian.jpg",
          category: "Hospitality",
        },
      ],
    },
    testimonials: {
      badge: "TESTIMONI KLIEN",
      title: "APA KATA KLIEN KAMI",
      items: [
        {
          name: "Budi Santoso",
          role: "Pemilik Rumah Residensial",
          content:
            "Hansen Projects berhasil mewujudkan kitchen set impian kami dengan presisi luar biasa dan tepat waktu.",
          rating: 5,
        },
        {
          name: "Citra Lestari",
          role: "Founder Studio Creative",
          content:
            "Desain interior kantor kami jadi sangat elegan dan nyaman untuk produktivitas tim. Komunikasi sangat profesional.",
          rating: 5,
        },
        {
          name: "Hendrik Wijaya",
          role: "Owner Restaurant BSD",
          content:
            "Kualitas material dan pengerjaan kustom furnitur sangat memuaskan. Highly recommended!",
          rating: 5,
        },
      ],
    },
    locations: {
      badge: "LOKASI LAYANAN",
      title: "CAKUPAN AREA KAMI",
      subtitle:
        "Kami melayani pengerjaan proyek interior dan custom furniture di wilayah:",
      items: [
        {
          name: "Jabodetabek",
          address: "Jakarta, Bogor, Depok, Tangerang, Bekasi",
          phone: "+62 812-3456-7890",
        },
        {
          name: "Luar Jabodetabek",
          address: "Bandung, Jambi, Bali, Pekanbaru",
          phone: "+62 812-3456-7890",
        },
      ],
    },
    parallaxBanner: {
      title: "SIAP MEWUJUDKAN RUANG IMPIAN ANDA?",
      subtitle:
        "Konsultasikan kebutuhan interior dan custom furniture Anda bersama tim konsultan kami sekarang.",
      buttonText: "HUBUNGI KAMI SEKARANG",
      buttonLink: "#kontak-kami",
      bgImage: "/background.jpg",
    },
    faq: {
      badge: "FAQ",
      title: "PERTANYAAN SERING DIAJUKAN",
      items: [
        {
          question: "Berapa lama estimasi pengerjaan proyek interior?",
          answer:
            "Durasi tergantung pada skala proyek. Untuk custom furniture biasanya 2-4 minggu, sedangkan full interior 4-8 minggu.",
        },
        {
          question: "Apakah ada biaya untuk konsultasi awal?",
          answer:
            "Konsultasi awal dan diskusi konsep pertama adalah GRATIS tanpa kewajiban apapun.",
        },
        {
          question: "Apakah Hansen Projects memberikan garansi?",
          answer:
            "Ya, kami memberikan garansi pengerjaan dan struktur hingga 12 bulan setelah instalasi selesai.",
        },
      ],
    },
    contact: {
      badge: "KONTAK KAMI",
      titleLine1: "Pilih Cara yang",
      titleLine2: "Paling Nyaman untuk",
      titleLine3: "Menghubungi Kami.",
      description:
        "Tim kami siap membantu menjawab pertanyaan Anda, memberikan informasi lebih lanjut, atau menjadwalkan sesi konsultasi.",
      phone: "+62 812 3456 7890",
      phoneHours: "Senin – Jumat, 09.00 – 18.00 WIB",
      email: "hello@hansenprojects.com",
      emailSubtitle: "Kami akan membalas secepatnya.",
      address: "Jakarta, Indonesia",
      addressDetail:
        "Ruko BSD Junction Blok A No. 12\nTangerang Selatan, Banten 15345",
      instagram: "@hansenprojects",
      instagramSubtitle: "Lihat inspirasi proyek kami.",
      formTitle: "Mulai Proyek Anda",
      formSubtitle:
        "Ceritakan kebutuhan proyek Anda, tim kami siap membantu mewujudkannya.",
    },
    map: {
      title: "Lokasi Workshop",
      embedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.252227901642!2d106.76227639999999!3d-6.361392599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ef003004592f%3A0x939dada88c3db747!2sWorkshop%20Hansen%20Construction!5e0!3m2!1sen!2sid!4v1793033623447!5m2!1sen!2sid",
    },
    cta: {
      title: "Mulai Proyek Interior Anda Bersama Hansen Projects",
      subtitle:
        "Dapatkan penawaran terbaik dan konsultasi gratis dengan ahli kami.",
      buttonText: "KONSULTASI GRATIS",
      buttonLink: "#kontak-kami",
    },
  },
  layananPage: {
    intro: {
      badge: "LAYANAN KAMI",
      titleLine1: "Solusi Desain & Build",
      titleLine2: "Komprehensif",
      description:
        "Kami memadukan estetika, fungsi, dan kualitas material terbaik untuk menciptakan ruang yang sesuai dengan visi Anda.",
      bgImage: "/services/interior.jpg",
    },
    servicesDetail: {
      badge: "LAYANAN",
      title: "Layanan Kami",
      description:
        "Solusi furniture dan interior yang disesuaikan dengan kebutuhan ruang Anda.",
      items: [
        {
          number: "01",
          title: "Kitchen Set",
          description:
            "Solusi kitchen set custom yang dirancang untuk menyesuaikan ukuran, kebutuhan penyimpanan, dan aktivitas sehari-hari.",
          image: "/services/furniture.jpg",
        },
        {
          number: "02",
          title: "Interior Premium",
          description:
            "Perancangan interior dengan perhatian pada detail, material, fungsi, dan karakter ruang.",
          image: "/services/interior.jpg",
        },
        {
          number: "03",
          title: "Rumah",
          description:
            "Menciptakan ruang hunian yang nyaman, fungsional, dan sesuai dengan kebutuhan setiap anggota keluarga.",
          image: "/projects/residential.jpg",
        },
        {
          number: "04",
          title: "Apartemen",
          description:
            "Memaksimalkan ruang yang terbatas menjadi area yang nyaman, rapi, dan tetap memiliki karakter.",
          image: "/styles/minimalist.jpg",
        },
        {
          number: "05",
          title: "Kantor",
          description:
            "Menciptakan ruang kerja yang mendukung aktivitas, produktivitas, dan identitas perusahaan.",
          image: "/services/fitout.jpg",
        },
        {
          number: "06",
          title: "Hotel",
          description:
            "Solusi interior dan furniture untuk menciptakan pengalaman ruang yang nyaman dan sesuai dengan karakter hospitality.",
          image: "/styles/luxury.jpg",
        },
      ],
    },
    whyUs: {
      badge: "MENGAPA HANSEN PROJECTS",
      title: "Keunggulan Layanan Kami",
      description:
        "Mengapa ratusan klien memercayakan pengerjaan interior mereka kepada kami.",
      items: [
        {
          title: "Desain Kustom Terpersonalisasi",
          description:
            "Setiap detail dirancang sesuai dengan selera dan kebutuhan spesifik Anda.",
          icon: "pen",
        },
        {
          title: "Material Berkualitas Tinggi",
          description:
            "Menggunakan bahan pilihan yang kokoh, ramah lingkungan, dan tahan lama.",
          icon: "layers",
        },
        {
          title: "Pengerjaan Presisi & Tepat Waktu",
          description:
            "Didukung oleh pengrajin berpengalaman dengan jadwal kontrol ketat.",
          icon: "clock",
        },
        {
          title: "Garansi Pasca Instalasi",
          description:
            "Dukungan garansi pemeliharaan untuk rasa tenang dan kepuasan jangka panjang.",
          icon: "shield",
        },
      ],
    },
  },
  portofolioPage: {
    intro: {
      badge: "PORTOFOLIO",
      titleLine1: "Hasil Karya Terpilih",
      titleLine2: "Hansen Projects",
      description:
        "Jelajahi koleksi proyek interior dan custom furniture yang telah kami kerjakan dengan dedikasi tinggi.",
      bgImage: "/projects/residential.jpg",
      stats: [
        { number: "150+", label: "Proyek Selesai" },
        { number: "98%", label: "Klien Puas" },
        { number: "8+", label: "Tahun Pengalaman" },
      ],
    },
    gallery: {
      badge: "KATEGORI PROYEK",
      title: "Temukan Inspirasi Ruang Impian Anda",
      subtitle:
        "Jelajahi berbagai proyek yang telah kami selesaikan, disesuaikan dengan kebutuhan dan karakter setiap klien.",
      categories: [
        { id: "all", label: "Semua Proyek" },
        { id: "residential", label: "Hunian (Residential)" },
        { id: "commercial", label: "Komersial & Resto" },
        { id: "office", label: "Perkantoran" },
        { id: "kitchen", label: "Kitchen Set & Joinery" },
      ],
      items: [
        {
          id: 1,
          category: "residential",
          title: "Modern Residence Suite",
          location: "Jakarta Selatan",
          type: "Hunian Residensial",
          image: "/projects/residential.jpg",
        },
        {
          id: 2,
          category: "kitchen",
          title: "Custom Luxury Kitchen Set",
          location: "BSD City, Tangerang",
          type: "Kitchen Set Custom",
          image: "/services/furniture.jpg",
        },
        {
          id: 3,
          category: "commercial",
          title: "Contemporary Cafe & Lounge",
          location: "Bandung",
          type: "Komersial & Hospitality",
          image: "/services/interior.jpg",
        },
        {
          id: 4,
          category: "office",
          title: "Corporate HQ Executive Office",
          location: "SCBD, Jakarta",
          type: "Interior Perkantoran",
          image: "/services/fitout.jpg",
        },
        {
          id: 5,
          category: "residential",
          title: "Minimalist Penthouse Apartment",
          location: "Surabaya",
          type: "Apartemen Minimalis",
          image: "/styles/minimalist.jpg",
        },
        {
          id: 6,
          category: "commercial",
          title: "Boutique Retail Showroom",
          location: "Kemang, Jakarta",
          type: "Komersial Store",
          image: "/styles/luxury.jpg",
        },
        {
          id: 7,
          category: "kitchen",
          title: "Scandinavian Open Kitchen",
          location: "Bekasi",
          type: "Kitchen Set & Dining",
          image: "/styles/scandinavian.jpg",
        },
        {
          id: 8,
          category: "office",
          title: "Industrial Co-Working Space",
          location: "Jakarta Barat",
          type: "Office Workspace",
          image: "/styles/industrial.jpg",
        },
      ],
    },
    banner: {
      title: "Ingin Hasil Serupa Untuk Ruang Anda?",
      subtitle:
        "Diskusikan proyek Anda dengan tim profesional Hansen Projects.",
      buttonText: "KONSULTASI SEKARANG",
      buttonLink: "#kontak-kami",
    },
  },
  tentangKamiPage: {
    intro: {
      badge: "Tentang Kami",
      titleLine1: "Lebih Dari Sekadar Furniture,",
      titleLine2: "Kami Membangun Ruang Lebih Baik",
      description:
        "Hansen Projects hadir untuk menciptakan ruang yang fungsional, estetik, dan bermakna melalui solusi interior dan furniture custom yang disesuaikan dengan kebutuhan setiap klien.",
      bgImage: "/background.jpg",
      whoWeAreBadge: "SIAPA KAMI",
      whoWeAreTitle: "HANSEN PROJECTS",
      whoWeAreImage: "/services/interior.jpg",
      whoWeAreParagraph1:
        "Hansen Projects adalah perusahaan yang bergerak di bidang custom furniture dan interior. Kami membantu individu maupun bisnis mewujudkan ruang yang sesuai dengan kebutuhan, gaya hidup, dan karakter mereka.",
      whoWeAreParagraph2:
        "Dengan pengalaman dan perhatian terhadap detail, kami percaya bahwa setiap ruang memiliki potensi untuk menjadi lebih baik — bukan hanya indah secara visual, tetapi juga nyaman, fungsional, dan tahan lama.",
    },
    vision: {
      badge: "VISI & MISI",
      title: "Visi & Misi Kami",
      visionText:
        "Menjadi mitra terpercaya dalam menghadirkan solusi interior dan custom furniture berkualitas tinggi yang menginspirasi keindahan dan kenyamanan di setiap ruang.",
      missionTitle: "Misi Kami",
      missions: [
        "Menghadirkan desain interior inovatif yang memadukan fungsi dan estetika.",
        "Menggunakan material bermutu tinggi dengan standar pengerjaan berpresisi tinggi.",
        "Memberikan pelayanan profesional yang transparan, jujur, dan berorientasi pada kepuasan klien.",
      ],
    },
    values: {
      badge: "NILAI-NILAI KAMI",
      title: "Prinsip Utama Pengerjaan",
      items: [
        {
          title: "Integritas & Kejujuran",
          description:
            "Kami mengutamakan transparansi biaya, material, dan jadwal pengerjaan kepada seluruh klien.",
        },
        {
          title: "Kualitas Tanpa Kompromi",
          description:
            "Setiap detail pengerjaan diperhatikan secara seksama untuk hasil yang awet dan kokoh.",
        },
        {
          title: "Orientasi Pada Klien",
          description:
            "Kebutuhan dan kenyamanan Anda adalah kompas utama dalam setiap keputusan desain kami.",
        },
      ],
    },
    experience: {
      badge: "PENGALAMAN",
      title: "Perjalanan Karya Kami",
      subtitle:
        "Kilas balik milestone dan komitmen perkembangan Hansen Projects.",
      items: [
        {
          year: "2018",
          title: "Awal Berdiri",
          description:
            "Memulai langkah sebagai studio workshop pengerjaan custom furniture skala residensial.",
        },
        {
          year: "2021",
          title: "Ekspansi Layanan Interior",
          description:
            "Memperluas jangkauan layanan mencakup kontraktor interior komersial dan perkantoran.",
        },
        {
          year: "2024+",
          title: "Ratusan Proyek Terwujud",
          description:
            "Telah menyelesaikan lebih dari 150+ proyek dengan kepuasan klien tertinggi.",
        },
      ],
    },
  },
  footer: {
    aboutText:
      "Solusi interior dan custom furniture premium untuk hunian, komersial, dan perkantoran dengan pengerjaan profesional dan material berkualitas tinggi.",
    copyrightText: "© 2026 Hansen Projects. All Rights Reserved.",
    phone: "+62 812 3456 7890",
    email: "hello@hansenprojects.com",
    address: "Jakarta, Indonesia",
    instagram: "@hansenprojects",
  },
};
