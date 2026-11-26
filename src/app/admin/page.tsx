"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useContent } from "@/context/ContentContext";
import ImagePicker from "@/components/admin/ImagePicker";
import ArticlesManager from "@/components/admin/ArticlesManager";
import { SiteContent } from "@/data/initialContent";
import {
  FiLock,
  FiSave,
  FiRefreshCw,
  FiGlobe,
  FiLayout,
  FiHome,
  FiLayers,
  FiGrid,
  FiInfo,
  FiSliders,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiLogOut,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function AdminPage() {
  const {
    content,
    updateContent,
    saveToGitHub,
    reloadContent,
    loading,
    saving,
  } = useContent();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Active Main Tab State
  const [activeTab, setActiveTab] = useState<
    | "github"
    | "branding"
    | "home"
    | "layanan"
    | "portofolio"
    | "tentang"
    | "footer"
    | "artikel"
  >("home");

  // Home Sub-Tab State
  const [homeSubTab, setHomeSubTab] = useState<
    | "hero"
    | "services"
    | "process"
    | "styles"
    | "projects"
    | "testimonials"
    | "locations"
    | "parallax"
    | "faq"
    | "contact"
    | "map"
    | "cta"
  >("hero");

  // Layanan Sub-Tab State
  const [layananSubTab, setLayananSubTab] = useState<
    "intro" | "detail" | "whyUs"
  >("intro");

  // Portofolio Sub-Tab State
  const [portfolioSubTab, setPortfolioSubTab] = useState<
    "intro" | "gallery" | "banner"
  >("intro");

  // Tentang Kami Sub-Tab State
  const [tentangSubTab, setTentangSubTab] = useState<
    "intro" | "vision" | "values" | "experience"
  >("intro");

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Ask the server whether the HttpOnly session cookie is valid.
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/auth", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!cancelled && response.ok && data.authenticated) {
          const loaded = await reloadContent();
          if (!cancelled && loaded.success) setIsAuthenticated(true);
          else if (!cancelled) setLoginError(loaded.message || "Konten CMS gagal dimuat.");
        }
      } catch {
        // A failed session check leaves the login form visible.
      }
    };
    void checkSession();
    return () => { cancelled = true; };
  }, [reloadContent]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordInput("");
        const loaded = await reloadContent();
        if (loaded.success) {
          setIsAuthenticated(true);
          showToast("Selamat datang di Admin CMS Hansen Projects!", "success");
        } else {
          setLoginError(loaded.message || "Konten CMS gagal dimuat.");
        }
      } else {
        setLoginError(data.message || "Password salah, silakan coba lagi.");
      }
    } catch {
      setLoginError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "same-origin" }).catch(() => undefined);
    // Clear full article bodies from the shared client state after logout.
    updateContent({
      ...content,
      articles: (content.articles || [])
        .filter((article) => article.status === "published")
        .map((article) => ({ ...article, body: "" })),
    });
    setIsAuthenticated(false);
  };

  const handleSaveAll = async () => {
    const res = await saveToGitHub();
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.message, "error");
    }
  };

  const handleSyncInitial = async () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mengembalikan konten website ke data default kode? Artikel yang sudah ada akan tetap dipertahankan."
      )
    ) {
      try {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ syncInitial: true, articles: content.articles || [] }),
        });
        const data = await res.json();
        if (data.success) {
          const loaded = await reloadContent();
          if (loaded.success) showToast("Konten berhasil disinkronkan ke kode default!", "success");
          else showToast(loaded.message || "Konten tersimpan, tetapi gagal dimuat ulang.", "error");
        } else {
          showToast(data.message || "Gagal sinkronisasi.", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Gagal sinkronisasi.", "error");
      }
    }
  };

  // Helper mutation functions
  const updateBranding = <Key extends keyof SiteContent["branding"]>(key: Key, value: SiteContent["branding"][Key]) => {
    updateContent({
      ...content,
      branding: {
        ...content.branding,
        [key]: value,
      },
    });
  };

  const updateHome = <Key extends keyof SiteContent["home"]>(key: Key, value: SiteContent["home"][Key]) => {
    updateContent({
      ...content,
      home: {
        ...content.home,
        [key]: value,
      },
    });
  };

  const updateLayananPage = <Key extends keyof SiteContent["layananPage"]>(
    key: Key,
    value: SiteContent["layananPage"][Key],
  ) => {
    updateContent({
      ...content,
      layananPage: {
        ...content.layananPage,
        [key]: value,
      },
    });
  };

  const updatePortofolioPage = <Key extends keyof SiteContent["portofolioPage"]>(
    key: Key,
    value: SiteContent["portofolioPage"][Key],
  ) => {
    updateContent({
      ...content,
      portofolioPage: {
        ...content.portofolioPage,
        [key]: value,
      },
    });
  };

  const updateTentangKamiPage = <Key extends keyof SiteContent["tentangKamiPage"]>(
    key: Key,
    value: SiteContent["tentangKamiPage"][Key],
  ) => {
    updateContent({
      ...content,
      tentangKamiPage: {
        ...content.tentangKamiPage,
        [key]: value,
      },
    });
  };

  const updateFooter = <Key extends keyof SiteContent["footer"]>(key: Key, value: SiteContent["footer"][Key]) => {
    updateContent({
      ...content,
      footer: {
        ...content.footer,
        [key]: value,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060c14] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Luxury Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dbae6b]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#002044]/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md bg-[#0a1524]/90 backdrop-blur-xl border border-[#dbae6b]/30 p-8 rounded-2xl shadow-2xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#002044] via-[#0b2447] to-[#dbae6b]/30 p-0.5 mb-4 shadow-lg flex items-center justify-center border border-[#dbae6b]/40">
              <Image
                src="/logo-hansen.png"
                alt="Hansen Projects Logo"
                width={40}
                height={40}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-widest text-[#dbae6b] uppercase">
              HANSEN PROJECTS
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
              Content Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Password Admin
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full bg-[#001833] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs pl-10 pr-10 py-3 rounded-lg focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white text-sm"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/60 border border-red-800/60 p-3 rounded-lg">
                <FiAlertCircle className="shrink-0 text-base" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-[#dbae6b] via-[#edd097] to-[#dbae6b] text-[#002044] font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <FiRefreshCw className="animate-spin text-base" />
              ) : (
                "MASUK KE PANEL ADMIN"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-4">
            <p className="text-[11px] text-gray-400">
              Disinkronisasi dengan GitHub REST API & PAT Classic
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070e17] text-white font-sans flex flex-col">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-xs font-bold transition-all transform animate-bounce ${
            toast.type === "success"
              ? "bg-[#0b2b1a] border-emerald-500 text-emerald-300"
              : "bg-red-950 border-red-500 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheckCircle className="text-lg text-emerald-400" />
          ) : (
            <FiAlertCircle className="text-lg text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-[#0b1728] border-b border-[#dbae6b]/20 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={content.branding.logoUrl || "/logo-hansen.png"}
              alt="Logo"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <div>
              <span className="text-sm font-serif font-bold text-[#dbae6b] tracking-widest uppercase">
                {content.branding.siteName} CMS
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">
                Panel Kelola Konten
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#001730] px-3 py-1.5 rounded-full border border-white/10 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Koneksi GitHub dikelola server
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#dbae6b] bg-[#001730] border border-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <FiGlobe /> Lihat Website
          </a>

          <button
            onClick={reloadContent}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-[#001730] border border-white/10 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            title="Muat Ulang Data dari GitHub"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={handleSyncInitial}
            disabled={loading || saving}
            className="hidden md:flex items-center gap-1.5 text-xs text-[#dbae6b] hover:bg-[#dbae6b]/20 bg-[#001730] border border-[#dbae6b]/30 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            title="Sinkronkan seluruh konten CMS dengan data awal kode"
          >
            <FiRefreshCw /> Sinkronkan Default
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#dbae6b] to-[#c2954e] text-[#002044] font-bold text-xs px-4 py-2 rounded-lg shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? (
              <FiRefreshCw className="animate-spin text-sm" />
            ) : (
              <FiSave className="text-sm" />
            )}
            Simpan Ke GitHub
          </button>

          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/40 transition-colors text-base"
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* Dashboard Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Sidebar */}
        <aside className="w-full md:w-64 bg-[#091322] border-r border-[#dbae6b]/15 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#dbae6b] px-3 py-2">
            NAVIGASI PANELS
          </p>

          {/* <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "github"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiGithub className="text-base shrink-0" /> Konfigurasi GitHub
          </button> */}

          <button
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "branding"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiSliders className="text-base shrink-0" /> Logo & Header Nav
          </button>

          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "home"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiHome className="text-base shrink-0" /> Halaman Beranda (Home)
          </button>

          <button
            onClick={() => setActiveTab("layanan")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "layanan"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiLayers className="text-base shrink-0" /> Halaman Layanan
          </button>

          <button
            onClick={() => setActiveTab("portofolio")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "portofolio"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiGrid className="text-base shrink-0" /> Halaman Portofolio
          </button>

          <button
            onClick={() => setActiveTab("tentang")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "tentang"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiInfo className="text-base shrink-0" /> Halaman Tentang Kami
          </button>

          <button
            onClick={() => setActiveTab("artikel")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "artikel"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiLayers className="text-base shrink-0" /> Artikel & SEO
          </button>

          <button
            onClick={() => setActiveTab("footer")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === "footer"
                ? "bg-[#dbae6b] text-[#002044] font-bold shadow-md"
                : "text-gray-300 hover:bg-[#001c3d] hover:text-white"
            }`}
          >
            <FiLayout className="text-base shrink-0" /> Footer Website
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#070e17]">
          {activeTab === "artikel" && <ArticlesManager />}
          {/* TAB 1: GITHUB CONFIG */}
          {activeTab === "github" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">Penyimpanan GitHub</h2>
              <p className="rounded-xl border border-[#dbae6b]/20 bg-[#0b1728] p-6 text-sm leading-7 text-gray-300">
                Token dan tujuan repository dikelola sebagai environment variable server. Atur GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, dan GITHUB_PATH di environment deployment; secret tidak lagi dimasukkan atau disimpan di browser.
              </p>
            </div>
          )}

          {/* TAB 2: BRANDING & HEADER */}
          {activeTab === "branding" && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Logo & Header Navigasi
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Atur logo brand, nama perusahaan, serta tombol kontak di
                  bagian header navigasi atas.
                </p>
              </div>

              <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6">
                <ImagePicker
                  label="Logo Brand Perusahaan"
                  value={content.branding.logoUrl}
                  onChange={(val) => updateBranding("logoUrl", val)}
                  helpText="Upload file gambar logo (Max 1 MB) atau gunakan Link URL."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Nama Brand Utama
                    </label>
                    <input
                      type="text"
                      value={content.branding.siteName}
                      onChange={(e) =>
                        updateBranding("siteName", e.target.value)
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Tagline / Sub-nama
                    </label>
                    <input
                      type="text"
                      value={content.branding.siteTagline}
                      onChange={(e) =>
                        updateBranding("siteTagline", e.target.value)
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Teks Tombol Header
                    </label>
                    <input
                      type="text"
                      value={content.branding.contactButtonText}
                      onChange={(e) =>
                        updateBranding("contactButtonText", e.target.value)
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Link Target Tombol Header
                    </label>
                    <input
                      type="text"
                      value={content.branding.contactButtonUrl}
                      onChange={(e) =>
                        updateBranding("contactButtonUrl", e.target.value)
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BERANDA (HOME) */}
          {activeTab === "home" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Kelola Konten Halaman Beranda (Home)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Pilih section di bawah ini untuk mengedit judul, teks, gambar,
                  dan elemen kartu.
                </p>
              </div>

              {/* Sub-Tabs for Home */}
              <div className="flex flex-wrap gap-2 border-b border-[#dbae6b]/20 pb-3">
                {[
                  { id: "hero", label: "Hero Banner" },
                  { id: "services", label: "Layanan" },
                  { id: "process", label: "Proses Kerja" },
                  { id: "styles", label: "Gaya Interior" },
                  { id: "projects", label: "Proyek Terpilih" },
                  { id: "testimonials", label: "Testimoni" },
                  { id: "locations", label: "Lokasi" },
                  { id: "parallax", label: "Parallax Banner" },
                  { id: "faq", label: "FAQ" },
                  { id: "contact", label: "Section Kontak" },
                  { id: "map", label: "Peta Google Maps" },
                  { id: "cta", label: "CTA Banner" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setHomeSubTab(sub.id as typeof homeSubTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      homeSubTab === sub.id
                        ? "bg-[#dbae6b] text-[#002044]"
                        : "bg-[#0b1728] text-gray-300 hover:bg-[#001c3d]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Home Hero Editor */}
              {homeSubTab === "hero" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <ImagePicker
                    label="Gambar Background Hero"
                    value={content.home.hero.bgImage}
                    onChange={(val) =>
                      updateHome("hero", { ...content.home.hero, bgImage: val })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Badge Text (Atas Judul)
                    </label>
                    <input
                      type="text"
                      value={content.home.hero.badge}
                      onChange={(e) =>
                        updateHome("hero", {
                          ...content.home.hero,
                          badge: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Utama Hero (Headline)
                    </label>
                    <textarea
                      rows={2}
                      value={content.home.hero.title}
                      onChange={(e) =>
                        updateHome("hero", {
                          ...content.home.hero,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Deskripsi Singkat Hero (Subline)
                    </label>
                    <textarea
                      rows={3}
                      value={content.home.hero.description}
                      onChange={(e) =>
                        updateHome("hero", {
                          ...content.home.hero,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Teks Tombol Utama
                      </label>
                      <input
                        type="text"
                        value={content.home.hero.ctaPrimaryText}
                        onChange={(e) =>
                          updateHome("hero", {
                            ...content.home.hero,
                            ctaPrimaryText: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Target Link Tombol Utama
                      </label>
                      <input
                        type="text"
                        value={content.home.hero.ctaPrimaryLink}
                        onChange={(e) =>
                          updateHome("hero", {
                            ...content.home.hero,
                            ctaPrimaryLink: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Home Services Editor */}
              {homeSubTab === "services" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Section Layanan
                      </label>
                      <input
                        type="text"
                        value={content.home.services.title}
                        onChange={(e) =>
                          updateHome("services", {
                            ...content.home.services,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Subtitle Layanan
                      </label>
                      <input
                        type="text"
                        value={content.home.services.subtitle}
                        onChange={(e) =>
                          updateHome("services", {
                            ...content.home.services,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 focus:border-[#dbae6b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Daftar Kartu Layanan Beranda (
                        {content.home.services.items.length})
                      </h4>
                      <button
                        onClick={() => {
                          const updated = [
                            ...content.home.services.items,
                            {
                              title: "Layanan Baru",
                              description: "Deskripsi layanan baru.",
                              image: "/services/interior.jpg",
                              link: "/layanan",
                            },
                          ];
                          updateHome("services", {
                            ...content.home.services,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 hover:bg-[#dbae6b]/30 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Layanan
                      </button>
                    </div>

                    {content.home.services.items.map((srv, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-4 relative"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#dbae6b]">
                            Kartu #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const updated =
                                content.home.services.items.filter(
                                  (_, i) => i !== idx,
                                );
                              updateHome("services", {
                                ...content.home.services,
                                items: updated,
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <FiTrash2 /> Hapus
                          </button>
                        </div>

                        <ImagePicker
                          label={`Gambar Layanan #${idx + 1}`}
                          value={srv.image}
                          onChange={(val) => {
                            const updated = [...content.home.services.items];
                            updated[idx].image = val;
                            updateHome("services", {
                              ...content.home.services,
                              items: updated,
                            });
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-300 mb-1">
                              Judul Layanan
                            </label>
                            <input
                              type="text"
                              value={srv.title}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.services.items,
                                ];
                                updated[idx].title = e.target.value;
                                updateHome("services", {
                                  ...content.home.services,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-300 mb-1">
                              Link Target
                            </label>
                            <input
                              type="text"
                              value={srv.link}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.services.items,
                                ];
                                updated[idx].link = e.target.value;
                                updateHome("services", {
                                  ...content.home.services,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-300 mb-1">
                            Deskripsi Singkat
                          </label>
                          <textarea
                            rows={2}
                            value={srv.description}
                            onChange={(e) => {
                              const updated = [...content.home.services.items];
                              updated[idx].description = e.target.value;
                              updateHome("services", {
                                ...content.home.services,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Process Editor */}
              {homeSubTab === "process" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Section Proses
                      </label>
                      <input
                        type="text"
                        value={content.home.process.title}
                        onChange={(e) =>
                          updateHome("process", {
                            ...content.home.process,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Subtitle Proses
                      </label>
                      <input
                        type="text"
                        value={content.home.process.subtitle}
                        onChange={(e) =>
                          updateHome("process", {
                            ...content.home.process,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                      Langkah-Langkah Kerja ({content.home.process.steps.length}
                      )
                    </h4>
                    {content.home.process.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Nomor (Contoh: 01)
                            </label>
                            <input
                              type="text"
                              value={st.number}
                              onChange={(e) => {
                                const updated = [...content.home.process.steps];
                                updated[idx].number = e.target.value;
                                updateHome("process", {
                                  ...content.home.process,
                                  steps: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Judul Langkah
                            </label>
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const updated = [...content.home.process.steps];
                                updated[idx].title = e.target.value;
                                updateHome("process", {
                                  ...content.home.process,
                                  steps: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Deskripsi Langkah
                          </label>
                          <textarea
                            rows={2}
                            value={st.description}
                            onChange={(e) => {
                              const updated = [...content.home.process.steps];
                              updated[idx].description = e.target.value;
                              updateHome("process", {
                                ...content.home.process,
                                steps: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Styles Editor */}
              {homeSubTab === "styles" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Section Gaya Interior
                    </label>
                    <input
                      type="text"
                      value={content.home.styles.title}
                      onChange={(e) =>
                        updateHome("styles", {
                          ...content.home.styles,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Koleksi Gaya Interior (
                        {content.home.styles.items.length})
                      </h4>
                      <button
                        onClick={() => {
                          const updated = [
                            ...content.home.styles.items,
                            {
                              title: "Gaya Baru",
                              description: "Deskripsi gaya baru.",
                              image: "/styles/minimalist.jpg",
                            },
                          ];
                          updateHome("styles", {
                            ...content.home.styles,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Gaya
                      </button>
                    </div>

                    {content.home.styles.items.map((st, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#dbae6b]">
                            Gaya #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const updated = content.home.styles.items.filter(
                                (_, i) => i !== idx,
                              );
                              updateHome("styles", {
                                ...content.home.styles,
                                items: updated,
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <FiTrash2 /> Hapus
                          </button>
                        </div>

                        <ImagePicker
                          label={`Gambar Gaya #${idx + 1}`}
                          value={st.image}
                          onChange={(val) => {
                            const updated = [...content.home.styles.items];
                            updated[idx].image = val;
                            updateHome("styles", {
                              ...content.home.styles,
                              items: updated,
                            });
                          }}
                        />

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Nama Gaya Interior
                          </label>
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => {
                              const updated = [...content.home.styles.items];
                              updated[idx].title = e.target.value;
                              updateHome("styles", {
                                ...content.home.styles,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Deskripsi Gaya
                          </label>
                          <textarea
                            rows={2}
                            value={st.description}
                            onChange={(e) => {
                              const updated = [...content.home.styles.items];
                              updated[idx].description = e.target.value;
                              updateHome("styles", {
                                ...content.home.styles,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Projects Editor */}
              {homeSubTab === "projects" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Section Proyek Terpilih
                    </label>
                    <input
                      type="text"
                      value={content.home.projects.title}
                      onChange={(e) =>
                        updateHome("projects", {
                          ...content.home.projects,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Item Proyek Beranda (
                        {content.home.projects.items.length})
                      </h4>
                      <button
                        onClick={() => {
                          const updated = [
                            ...content.home.projects.items,
                            {
                              title: "Proyek Baru",
                              location: "Jakarta",
                              category: "Hunian",
                              image: "/projects/residential.jpg",
                            },
                          ];
                          updateHome("projects", {
                            ...content.home.projects,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Proyek
                      </button>
                    </div>

                    {content.home.projects.items.map((pj, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#dbae6b]">
                            Proyek #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const updated =
                                content.home.projects.items.filter(
                                  (_, i) => i !== idx,
                                );
                              updateHome("projects", {
                                ...content.home.projects,
                                items: updated,
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <FiTrash2 /> Hapus
                          </button>
                        </div>

                        <ImagePicker
                          label={`Gambar Proyek #${idx + 1}`}
                          value={pj.image}
                          onChange={(val) => {
                            const updated = [...content.home.projects.items];
                            updated[idx].image = val;
                            updateHome("projects", {
                              ...content.home.projects,
                              items: updated,
                            });
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Judul Proyek
                            </label>
                            <input
                              type="text"
                              value={pj.title}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.projects.items,
                                ];
                                updated[idx].title = e.target.value;
                                updateHome("projects", {
                                  ...content.home.projects,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Lokasi
                            </label>
                            <input
                              type="text"
                              value={pj.location}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.projects.items,
                                ];
                                updated[idx].location = e.target.value;
                                updateHome("projects", {
                                  ...content.home.projects,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Kategori
                            </label>
                            <input
                              type="text"
                              value={pj.category}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.projects.items,
                                ];
                                updated[idx].category = e.target.value;
                                updateHome("projects", {
                                  ...content.home.projects,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Testimonials Editor */}
              {homeSubTab === "testimonials" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Section Testimoni
                    </label>
                    <input
                      type="text"
                      value={content.home.testimonials.title}
                      onChange={(e) =>
                        updateHome("testimonials", {
                          ...content.home.testimonials,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Item Testimoni ({content.home.testimonials.items.length}
                        )
                      </h4>
                      <button
                        onClick={() => {
                          const updated = [
                            ...content.home.testimonials.items,
                            {
                              name: "Nama Klien",
                              role: "Pemilik Rumah",
                              content: "Testimoni memuaskan...",
                              rating: 5,
                            },
                          ];
                          updateHome("testimonials", {
                            ...content.home.testimonials,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Testimoni
                      </button>
                    </div>

                    {content.home.testimonials.items.map((ts, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#dbae6b]">
                            Testimoni #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const updated =
                                content.home.testimonials.items.filter(
                                  (_, i) => i !== idx,
                                );
                              updateHome("testimonials", {
                                ...content.home.testimonials,
                                items: updated,
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <FiTrash2 /> Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Nama Klien
                            </label>
                            <input
                              type="text"
                              value={ts.name}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.testimonials.items,
                                ];
                                updated[idx].name = e.target.value;
                                updateHome("testimonials", {
                                  ...content.home.testimonials,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Profesi / Role
                            </label>
                            <input
                              type="text"
                              value={ts.role}
                              onChange={(e) => {
                                const updated = [
                                  ...content.home.testimonials.items,
                                ];
                                updated[idx].role = e.target.value;
                                updateHome("testimonials", {
                                  ...content.home.testimonials,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Pesan / Kesan Testimoni
                          </label>
                          <textarea
                            rows={3}
                            value={ts.content}
                            onChange={(e) => {
                              const updated = [
                                ...content.home.testimonials.items,
                              ];
                              updated[idx].content = e.target.value;
                              updateHome("testimonials", {
                                ...content.home.testimonials,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Parallax Banner Editor */}
              {homeSubTab === "parallax" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <ImagePicker
                    label="Gambar Background Parallax Banner"
                    value={content.home.parallaxBanner.bgImage}
                    onChange={(val) =>
                      updateHome("parallaxBanner", {
                        ...content.home.parallaxBanner,
                        bgImage: val,
                      })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Parallax Banner
                    </label>
                    <input
                      type="text"
                      value={content.home.parallaxBanner.title}
                      onChange={(e) =>
                        updateHome("parallaxBanner", {
                          ...content.home.parallaxBanner,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Subtitle Parallax Banner
                    </label>
                    <input
                      type="text"
                      value={content.home.parallaxBanner.subtitle}
                      onChange={(e) =>
                        updateHome("parallaxBanner", {
                          ...content.home.parallaxBanner,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Teks Tombol Parallax
                      </label>
                      <input
                        type="text"
                        value={content.home.parallaxBanner.buttonText}
                        onChange={(e) =>
                          updateHome("parallaxBanner", {
                            ...content.home.parallaxBanner,
                            buttonText: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Target Link Tombol Parallax
                      </label>
                      <input
                        type="text"
                        value={content.home.parallaxBanner.buttonLink}
                        onChange={(e) =>
                          updateHome("parallaxBanner", {
                            ...content.home.parallaxBanner,
                            buttonLink: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Home FAQ Editor */}
              {homeSubTab === "faq" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Section FAQ
                    </label>
                    <input
                      type="text"
                      value={content.home.faq.title}
                      onChange={(e) =>
                        updateHome("faq", {
                          ...content.home.faq,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Daftar FAQ ({content.home.faq.items.length})
                      </h4>
                      <button
                        onClick={() => {
                          const updated = [
                            ...content.home.faq.items,
                            {
                              question: "Pertanyaan Baru?",
                              answer: "Jawaban penjelasan pertanyaan baru.",
                            },
                          ];
                          updateHome("faq", {
                            ...content.home.faq,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Pertanyaan
                      </button>
                    </div>

                    {content.home.faq.items.map((fq, idx) => (
                      <div
                        key={idx}
                        className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-bold text-[#dbae6b]">
                            FAQ #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const updated = content.home.faq.items.filter(
                                (_, i) => i !== idx,
                              );
                              updateHome("faq", {
                                ...content.home.faq,
                                items: updated,
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <FiTrash2 /> Hapus
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Pertanyaan
                          </label>
                          <input
                            type="text"
                            value={fq.question}
                            onChange={(e) => {
                              const updated = [...content.home.faq.items];
                              updated[idx].question = e.target.value;
                              updateHome("faq", {
                                ...content.home.faq,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Jawaban
                          </label>
                          <textarea
                            rows={3}
                            value={fq.answer}
                            onChange={(e) => {
                              const updated = [...content.home.faq.items];
                              updated[idx].answer = e.target.value;
                              updateHome("faq", {
                                ...content.home.faq,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Contact & Map Editors */}
              {(homeSubTab === "contact" || homeSubTab === "map") && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Nomor Telepon / WA
                      </label>
                      <input
                        type="text"
                        value={content.home.contact.phone}
                        onChange={(e) =>
                          updateHome("contact", {
                            ...content.home.contact,
                            phone: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Email Resmi Perusahaan
                      </label>
                      <input
                        type="text"
                        value={content.home.contact.email}
                        onChange={(e) =>
                          updateHome("contact", {
                            ...content.home.contact,
                            email: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Detail Alamat Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={content.home.contact.addressDetail}
                      onChange={(e) =>
                        updateHome("contact", {
                          ...content.home.contact,
                          addressDetail: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Google Maps Embed URL
                    </label>
                    <input
                      type="text"
                      value={content.home.map.embedUrl}
                      onChange={(e) =>
                        updateHome("map", {
                          ...content.home.map,
                          embedUrl: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Home Subtab: Locations */}
              {homeSubTab === "locations" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl max-w-4xl space-y-6">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Pengaturan Section Lokasi Layanan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge Lokasi
                      </label>
                      <input
                        type="text"
                        value={content.home.locations.badge}
                        onChange={(e) =>
                          updateHome("locations", {
                            ...content.home.locations,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Utama
                      </label>
                      <input
                        type="text"
                        value={content.home.locations.title}
                        onChange={(e) =>
                          updateHome("locations", {
                            ...content.home.locations,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Sub-judul Deskripsi
                    </label>
                    <input
                      type="text"
                      value={content.home.locations.subtitle}
                      onChange={(e) =>
                        updateHome("locations", {
                          ...content.home.locations,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                        Daftar Kartu Lokasi ({content.home.locations.items.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.home.locations.items,
                            {
                              name: "Nama Wilayah",
                              address: "Daftar Kota / Area",
                              phone: "+62 812-3456-7890",
                            },
                          ];
                          updateHome("locations", {
                            ...content.home.locations,
                            items: updated,
                          });
                        }}
                        className="text-xs bg-[#dbae6b]/20 text-[#dbae6b] hover:bg-[#dbae6b] hover:text-[#001730] px-3 py-1.5 rounded transition font-semibold"
                      >
                        + Tambah Lokasi
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.home.locations.items.map((loc, idx) => (
                        <div
                          key={idx}
                          className="bg-[#001730] p-4 rounded-lg border border-[#dbae6b]/20 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#dbae6b]">
                              Lokasi #{idx + 1}
                            </span>
                            {content.home.locations.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = content.home.locations.items.filter(
                                    (_, i) => i !== idx
                                  );
                                  updateHome("locations", {
                                    ...content.home.locations,
                                    items: updated,
                                  });
                                }}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">
                                Nama Area / Wilayah
                              </label>
                              <input
                                type="text"
                                value={loc.name}
                                onChange={(e) => {
                                  const updated = [...content.home.locations.items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    name: e.target.value,
                                  };
                                  updateHome("locations", {
                                    ...content.home.locations,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#0b1728] border border-[#dbae6b]/30 text-white text-xs px-3 py-2 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">
                                Cakupan Kota
                              </label>
                              <input
                                type="text"
                                value={loc.address}
                                onChange={(e) => {
                                  const updated = [...content.home.locations.items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    address: e.target.value,
                                  };
                                  updateHome("locations", {
                                    ...content.home.locations,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#0b1728] border border-[#dbae6b]/30 text-white text-xs px-3 py-2 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">
                                Nomor Telepon
                              </label>
                              <input
                                type="text"
                                value={loc.phone}
                                onChange={(e) => {
                                  const updated = [...content.home.locations.items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    phone: e.target.value,
                                  };
                                  updateHome("locations", {
                                    ...content.home.locations,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#0b1728] border border-[#dbae6b]/30 text-white text-xs px-3 py-2 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Home Subtab: CTA Banner */}
              {homeSubTab === "cta" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl max-w-4xl space-y-6">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Pengaturan Section CTA Banner Bawah
                  </h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul CTA Banner
                    </label>
                    <textarea
                      rows={2}
                      value={content.home.cta.title}
                      onChange={(e) =>
                        updateHome("cta", {
                          ...content.home.cta,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Sub-judul Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      value={content.home.cta.subtitle}
                      onChange={(e) =>
                        updateHome("cta", {
                          ...content.home.cta,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Teks Tombol
                      </label>
                      <input
                        type="text"
                        value={content.home.cta.buttonText}
                        onChange={(e) =>
                          updateHome("cta", {
                            ...content.home.cta,
                            buttonText: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Target Link Tombol
                      </label>
                      <input
                        type="text"
                        value={content.home.cta.buttonLink}
                        onChange={(e) =>
                          updateHome("cta", {
                            ...content.home.cta,
                            buttonLink: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAYANAN PAGE */}
          {activeTab === "layanan" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Kelola Konten Halaman Layanan (/layanan)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Edit bagian intro header, daftar kartu 6 layanan kustom, dan
                  section keunggulan layanan.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-[#dbae6b]/20 pb-3">
                {[
                  { id: "intro", label: "Intro & Header" },
                  { id: "detail", label: "Daftar Kartu Layanan (6 Grid)" },
                  { id: "whyUs", label: "Mengapa Memilih Kami" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setLayananSubTab(sub.id as typeof layananSubTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      layananSubTab === sub.id
                        ? "bg-[#dbae6b] text-[#002044]"
                        : "bg-[#0b1728] text-gray-300 hover:bg-[#001c3d]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {layananSubTab === "intro" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <ImagePicker
                    label="Background Header Layanan"
                    value={content.layananPage.intro.bgImage}
                    onChange={(val) =>
                      updateLayananPage("intro", {
                        ...content.layananPage.intro,
                        bgImage: val,
                      })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Baris Judul 1
                    </label>
                    <input
                      type="text"
                      value={content.layananPage.intro.titleLine1}
                      onChange={(e) =>
                        updateLayananPage("intro", {
                          ...content.layananPage.intro,
                          titleLine1: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Baris Judul 2 (Highlight Emas)
                    </label>
                    <input
                      type="text"
                      value={content.layananPage.intro.titleLine2}
                      onChange={(e) =>
                        updateLayananPage("intro", {
                          ...content.layananPage.intro,
                          titleLine2: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {layananSubTab === "detail" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                      Kartu Detail Layanan (
                      {content.layananPage.servicesDetail.items.length})
                    </h4>
                    <button
                      onClick={() => {
                        const updated = [
                          ...content.layananPage.servicesDetail.items,
                          {
                            number: "07",
                            title: "Layanan Baru",
                            description: "Deskripsi.",
                            image: "/services/furniture.jpg",
                          },
                        ];
                        updateLayananPage("servicesDetail", {
                          ...content.layananPage.servicesDetail,
                          items: updated,
                        });
                      }}
                      className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                    >
                      <FiPlus /> Tambah Layanan
                    </button>
                  </div>

                  {content.layananPage.servicesDetail.items.map((sd, idx) => (
                    <div
                      key={idx}
                      className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-[#dbae6b]">
                          Layanan {sd.number}
                        </span>
                        <button
                          onClick={() => {
                            const updated =
                              content.layananPage.servicesDetail.items.filter(
                                (_, i) => i !== idx,
                              );
                            updateLayananPage("servicesDetail", {
                              ...content.layananPage.servicesDetail,
                              items: updated,
                            });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <FiTrash2 /> Hapus
                        </button>
                      </div>

                      <ImagePicker
                        label={`Gambar ${sd.title}`}
                        value={sd.image}
                        onChange={(val) => {
                          const updated = [
                            ...content.layananPage.servicesDetail.items,
                          ];
                          updated[idx].image = val;
                          updateLayananPage("servicesDetail", {
                            ...content.layananPage.servicesDetail,
                            items: updated,
                          });
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Nomor Urut
                          </label>
                          <input
                            type="text"
                            value={sd.number}
                            onChange={(e) => {
                              const updated = [
                                ...content.layananPage.servicesDetail.items,
                              ];
                              updated[idx].number = e.target.value;
                              updateLayananPage("servicesDetail", {
                                ...content.layananPage.servicesDetail,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Judul Layanan
                          </label>
                          <input
                            type="text"
                            value={sd.title}
                            onChange={(e) => {
                              const updated = [
                                ...content.layananPage.servicesDetail.items,
                              ];
                              updated[idx].title = e.target.value;
                              updateLayananPage("servicesDetail", {
                                ...content.layananPage.servicesDetail,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Deskripsi Layanan
                        </label>
                        <textarea
                          rows={3}
                          value={sd.description}
                          onChange={(e) => {
                            const updated = [
                              ...content.layananPage.servicesDetail.items,
                            ];
                            updated[idx].description = e.target.value;
                            updateLayananPage("servicesDetail", {
                              ...content.layananPage.servicesDetail,
                              items: updated,
                            });
                          }}
                          className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {layananSubTab === "whyUs" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Section Mengapa Memilih Kami
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge Section
                      </label>
                      <input
                        type="text"
                        value={content.layananPage.whyUs.badge}
                        onChange={(e) =>
                          updateLayananPage("whyUs", {
                            ...content.layananPage.whyUs,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Utama
                      </label>
                      <input
                        type="text"
                        value={content.layananPage.whyUs.title}
                        onChange={(e) =>
                          updateLayananPage("whyUs", {
                            ...content.layananPage.whyUs,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Deskripsi Pendukung
                    </label>
                    <textarea
                      rows={2}
                      value={content.layananPage.whyUs.description}
                      onChange={(e) =>
                        updateLayananPage("whyUs", {
                          ...content.layananPage.whyUs,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Daftar Poin Keunggulan ({content.layananPage.whyUs.items.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.layananPage.whyUs.items,
                            {
                              title: "Keunggulan Baru",
                              description: "Deskripsi keunggulan baru kami.",
                              icon: "star",
                            },
                          ];
                          updateLayananPage("whyUs", {
                            ...content.layananPage.whyUs,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Keunggulan
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.layananPage.whyUs.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-[#dbae6b]">
                              Keunggulan #{idx + 1}
                            </span>
                            {content.layananPage.whyUs.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = content.layananPage.whyUs.items.filter(
                                    (_, i) => i !== idx
                                  );
                                  updateLayananPage("whyUs", {
                                    ...content.layananPage.whyUs,
                                    items: updated,
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <FiTrash2 /> Hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">
                                Judul Keunggulan
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...content.layananPage.whyUs.items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    title: e.target.value,
                                  };
                                  updateLayananPage("whyUs", {
                                    ...content.layananPage.whyUs,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">
                                Icon (pen, layers, clock, shield, star)
                              </label>
                              <input
                                type="text"
                                value={item.icon || "star"}
                                onChange={(e) => {
                                  const updated = [...content.layananPage.whyUs.items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    icon: e.target.value,
                                  };
                                  updateLayananPage("whyUs", {
                                    ...content.layananPage.whyUs,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">
                              Deskripsi
                            </label>
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...content.layananPage.whyUs.items];
                                updated[idx] = {
                                  ...updated[idx],
                                  description: e.target.value,
                                };
                                updateLayananPage("whyUs", {
                                  ...content.layananPage.whyUs,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PORTOFOLIO PAGE */}
          {activeTab === "portofolio" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Kelola Halaman Portofolio (/portofolio)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Atur item galeri portofolio, kategori filter, gambar, lokasi,
                  dan headline.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-[#dbae6b]/20 pb-3">
                {[
                  { id: "intro", label: "Intro & Statistik" },
                  { id: "gallery", label: "Galeri Portofolio" },
                  { id: "banner", label: "Banner Konsultasi" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setPortfolioSubTab(sub.id as typeof portfolioSubTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      portfolioSubTab === sub.id
                        ? "bg-[#dbae6b] text-[#002044]"
                        : "bg-[#0b1728] text-gray-300 hover:bg-[#001c3d]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Portfolio Intro Editor */}
              {portfolioSubTab === "intro" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Intro Header & Statistik Portofolio
                  </h3>
                  <ImagePicker
                    label="Background Header Portofolio"
                    value={content.portofolioPage.intro.bgImage}
                    onChange={(val) =>
                      updatePortofolioPage("intro", {
                        ...content.portofolioPage.intro,
                        bgImage: val,
                      })
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge Intro
                      </label>
                      <input
                        type="text"
                        value={content.portofolioPage.intro.badge}
                        onChange={(e) =>
                          updatePortofolioPage("intro", {
                            ...content.portofolioPage.intro,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Baris Judul 1
                      </label>
                      <input
                        type="text"
                        value={content.portofolioPage.intro.titleLine1}
                        onChange={(e) =>
                          updatePortofolioPage("intro", {
                            ...content.portofolioPage.intro,
                            titleLine1: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Baris Judul 2 (Highlight Emas)
                    </label>
                    <input
                      type="text"
                      value={content.portofolioPage.intro.titleLine2}
                      onChange={(e) =>
                        updatePortofolioPage("intro", {
                          ...content.portofolioPage.intro,
                          titleLine2: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Deskripsi Portofolio
                    </label>
                    <textarea
                      rows={3}
                      value={content.portofolioPage.intro.description}
                      onChange={(e) =>
                        updatePortofolioPage("intro", {
                          ...content.portofolioPage.intro,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Angka Statistik ({content.portofolioPage.intro.stats.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.portofolioPage.intro.stats,
                            { number: "99+", label: "Klien Puas" },
                          ];
                          updatePortofolioPage("intro", {
                            ...content.portofolioPage.intro,
                            stats: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Stat
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {content.portofolioPage.intro.stats.map((st, idx) => (
                        <div
                          key={idx}
                          className="bg-[#001730] p-3.5 rounded-xl border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#dbae6b]">
                              Stat #{idx + 1}
                            </span>
                            {content.portofolioPage.intro.stats.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = content.portofolioPage.intro.stats.filter(
                                    (_, i) => i !== idx
                                  );
                                  updatePortofolioPage("intro", {
                                    ...content.portofolioPage.intro,
                                    stats: updated,
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Angka</label>
                            <input
                              type="text"
                              value={st.number}
                              onChange={(e) => {
                                const updated = [...content.portofolioPage.intro.stats];
                                updated[idx] = { ...updated[idx], number: e.target.value };
                                updatePortofolioPage("intro", {
                                  ...content.portofolioPage.intro,
                                  stats: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Label Keterangan</label>
                            <input
                              type="text"
                              value={st.label}
                              onChange={(e) => {
                                const updated = [...content.portofolioPage.intro.stats];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                updatePortofolioPage("intro", {
                                  ...content.portofolioPage.intro,
                                  stats: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {portfolioSubTab === "gallery" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                      Item Galeri Portofolio (
                      {content.portofolioPage.gallery.items.length})
                    </h4>
                    <button
                      onClick={() => {
                        const newId = Date.now();
                        const updated = [
                          ...content.portofolioPage.gallery.items,
                          {
                            id: newId,
                            category: "residential",
                            title: "Proyek Portofolio Baru",
                            location: "Jakarta",
                            type: "Residensial",
                            image: "/projects/residential.jpg",
                          },
                        ];
                        updatePortofolioPage("gallery", {
                          ...content.portofolioPage.gallery,
                          items: updated,
                        });
                      }}
                      className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                    >
                      <FiPlus /> Tambah Item Galeri
                    </button>
                  </div>

                  {content.portofolioPage.gallery.items.map((gt, idx) => (
                    <div
                      key={gt.id || idx}
                      className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-[#dbae6b]">
                          Galeri Item #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const updated =
                              content.portofolioPage.gallery.items.filter(
                                (_, i) => i !== idx,
                              );
                            updatePortofolioPage("gallery", {
                              ...content.portofolioPage.gallery,
                              items: updated,
                            });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <FiTrash2 /> Hapus
                        </button>
                      </div>

                      <ImagePicker
                        label={`Gambar ${gt.title}`}
                        value={gt.image}
                        onChange={(val) => {
                          const updated = [
                            ...content.portofolioPage.gallery.items,
                          ];
                          updated[idx].image = val;
                          updatePortofolioPage("gallery", {
                            ...content.portofolioPage.gallery,
                            items: updated,
                          });
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Judul Proyek
                          </label>
                          <input
                            type="text"
                            value={gt.title}
                            onChange={(e) => {
                              const updated = [
                                ...content.portofolioPage.gallery.items,
                              ];
                              updated[idx].title = e.target.value;
                              updatePortofolioPage("gallery", {
                                ...content.portofolioPage.gallery,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Lokasi
                          </label>
                          <input
                            type="text"
                            value={gt.location}
                            onChange={(e) => {
                              const updated = [
                                ...content.portofolioPage.gallery.items,
                              ];
                              updated[idx].location = e.target.value;
                              updatePortofolioPage("gallery", {
                                ...content.portofolioPage.gallery,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-400 mb-1">
                            Tag Tipe Proyek
                          </label>
                          <input
                            type="text"
                            value={gt.type}
                            onChange={(e) => {
                              const updated = [
                                ...content.portofolioPage.gallery.items,
                              ];
                              updated[idx].type = e.target.value;
                              updatePortofolioPage("gallery", {
                                ...content.portofolioPage.gallery,
                                items: updated,
                              });
                            }}
                            className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3 py-2 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Portfolio Banner Editor */}
              {portfolioSubTab === "banner" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Banner Bawah Portofolio
                  </h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Judul Banner
                    </label>
                    <input
                      type="text"
                      value={content.portofolioPage.banner.title}
                      onChange={(e) =>
                        updatePortofolioPage("banner", {
                          ...content.portofolioPage.banner,
                          title: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Sub-judul Banner
                    </label>
                    <input
                      type="text"
                      value={content.portofolioPage.banner.subtitle}
                      onChange={(e) =>
                        updatePortofolioPage("banner", {
                          ...content.portofolioPage.banner,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Teks Tombol
                      </label>
                      <input
                        type="text"
                        value={content.portofolioPage.banner.buttonText}
                        onChange={(e) =>
                          updatePortofolioPage("banner", {
                            ...content.portofolioPage.banner,
                            buttonText: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Link Target Tombol
                      </label>
                      <input
                        type="text"
                        value={content.portofolioPage.banner.buttonLink}
                        onChange={(e) =>
                          updatePortofolioPage("banner", {
                            ...content.portofolioPage.banner,
                            buttonLink: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TENTANG KAMI PAGE */}
          {activeTab === "tentang" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Kelola Halaman Tentang Kami (/tentang-kami)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Atur narasi profil perusahaan, visi, misi, nilai-nilai utama,
                  dan riwayat milestone.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-[#dbae6b]/20 pb-3">
                {[
                  { id: "intro", label: "Intro & Profil" },
                  { id: "vision", label: "Visi & Misi" },
                  { id: "values", label: "Nilai Utama" },
                  { id: "experience", label: "Pengalaman & Milestone" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setTentangSubTab(sub.id as typeof tentangSubTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      tentangSubTab === sub.id
                        ? "bg-[#dbae6b] text-[#002044]"
                        : "bg-[#0b1728] text-gray-300 hover:bg-[#001c3d]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {tentangSubTab === "intro" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <ImagePicker
                    label="Gambar Background Header"
                    value={content.tentangKamiPage.intro.bgImage}
                    onChange={(val) =>
                      updateTentangKamiPage("intro", {
                        ...content.tentangKamiPage.intro,
                        bgImage: val,
                      })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Baris Judul Header 1
                    </label>
                    <input
                      type="text"
                      value={content.tentangKamiPage.intro.titleLine1}
                      onChange={(e) =>
                        updateTentangKamiPage("intro", {
                          ...content.tentangKamiPage.intro,
                          titleLine1: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Baris Judul Header 2 (Highlight Emas)
                    </label>
                    <input
                      type="text"
                      value={content.tentangKamiPage.intro.titleLine2}
                      onChange={(e) =>
                        updateTentangKamiPage("intro", {
                          ...content.tentangKamiPage.intro,
                          titleLine2: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <ImagePicker
                    label="Gambar Section Siapa Kami"
                    value={content.tentangKamiPage.intro.whoWeAreImage}
                    onChange={(val) =>
                      updateTentangKamiPage("intro", {
                        ...content.tentangKamiPage.intro,
                        whoWeAreImage: val,
                      })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Paragraf Profil 1
                    </label>
                    <textarea
                      rows={3}
                      value={content.tentangKamiPage.intro.whoWeAreParagraph1}
                      onChange={(e) =>
                        updateTentangKamiPage("intro", {
                          ...content.tentangKamiPage.intro,
                          whoWeAreParagraph1: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Paragraf Profil 2
                    </label>
                    <textarea
                      rows={3}
                      value={content.tentangKamiPage.intro.whoWeAreParagraph2}
                      onChange={(e) =>
                        updateTentangKamiPage("intro", {
                          ...content.tentangKamiPage.intro,
                          whoWeAreParagraph2: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Tentang Kami: Vision & Mission */}
              {tentangSubTab === "vision" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Visi & Misi Perusahaan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge Visi & Misi
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.vision.badge}
                        onChange={(e) =>
                          updateTentangKamiPage("vision", {
                            ...content.tentangKamiPage.vision,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Utama
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.vision.title}
                        onChange={(e) =>
                          updateTentangKamiPage("vision", {
                            ...content.tentangKamiPage.vision,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Pernyataan Visi Perusahaan
                    </label>
                    <textarea
                      rows={3}
                      value={content.tentangKamiPage.vision.visionText}
                      onChange={(e) =>
                        updateTentangKamiPage("vision", {
                          ...content.tentangKamiPage.vision,
                          visionText: e.target.value,
                        })
                      }
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Bagian Misi
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.vision.missionTitle}
                        onChange={(e) =>
                          updateTentangKamiPage("vision", {
                            ...content.tentangKamiPage.vision,
                            missionTitle: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Poin-poin Misi ({content.tentangKamiPage.vision.missions.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.tentangKamiPage.vision.missions,
                            "Misi baru komitmen Hansen Projects.",
                          ];
                          updateTentangKamiPage("vision", {
                            ...content.tentangKamiPage.vision,
                            missions: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Misi
                      </button>
                    </div>

                    <div className="space-y-3">
                      {content.tentangKamiPage.vision.missions.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-[#dbae6b] font-bold w-6">{idx + 1}.</span>
                          <input
                            type="text"
                            value={m}
                            onChange={(e) => {
                              const updated = [...content.tentangKamiPage.vision.missions];
                              updated[idx] = e.target.value;
                              updateTentangKamiPage("vision", {
                                ...content.tentangKamiPage.vision,
                                missions: updated,
                              });
                            }}
                            className="flex-1 bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded"
                          />
                          {content.tentangKamiPage.vision.missions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = content.tentangKamiPage.vision.missions.filter(
                                  (_, i) => i !== idx
                                );
                                updateTentangKamiPage("vision", {
                                  ...content.tentangKamiPage.vision,
                                  missions: updated,
                                });
                              }}
                              className="text-red-400 hover:text-red-300 p-2"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tentang Kami: Values */}
              {tentangSubTab === "values" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Nilai-nilai Utama (Values)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge Nilai
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.values.badge}
                        onChange={(e) =>
                          updateTentangKamiPage("values", {
                            ...content.tentangKamiPage.values,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Section
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.values.title}
                        onChange={(e) =>
                          updateTentangKamiPage("values", {
                            ...content.tentangKamiPage.values,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Daftar Nilai ({content.tentangKamiPage.values.items.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.tentangKamiPage.values.items,
                            { title: "Nilai Baru", description: "Deskripsi nilai prinsip kerja." },
                          ];
                          updateTentangKamiPage("values", {
                            ...content.tentangKamiPage.values,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Nilai
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.tentangKamiPage.values.items.map((val, idx) => (
                        <div
                          key={idx}
                          className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-[#dbae6b]">
                              Nilai #{idx + 1}
                            </span>
                            {content.tentangKamiPage.values.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = content.tentangKamiPage.values.items.filter(
                                    (_, i) => i !== idx
                                  );
                                  updateTentangKamiPage("values", {
                                    ...content.tentangKamiPage.values,
                                    items: updated,
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <FiTrash2 /> Hapus
                              </button>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Judul Nilai</label>
                            <input
                              type="text"
                              value={val.title}
                              onChange={(e) => {
                                const updated = [...content.tentangKamiPage.values.items];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                updateTentangKamiPage("values", {
                                  ...content.tentangKamiPage.values,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Deskripsi</label>
                            <textarea
                              rows={2}
                              value={val.description}
                              onChange={(e) => {
                                const updated = [...content.tentangKamiPage.values.items];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                updateTentangKamiPage("values", {
                                  ...content.tentangKamiPage.values,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tentang Kami: Experience */}
              {tentangSubTab === "experience" && (
                <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6 max-w-4xl">
                  <h3 className="text-sm font-bold text-[#dbae6b] uppercase tracking-wider">
                    Pengalaman & Riwayat Milestone
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Badge
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.experience.badge}
                        onChange={(e) =>
                          updateTentangKamiPage("experience", {
                            ...content.tentangKamiPage.experience,
                            badge: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Judul Utama
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.experience.title}
                        onChange={(e) =>
                          updateTentangKamiPage("experience", {
                            ...content.tentangKamiPage.experience,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Sub-judul
                      </label>
                      <input
                        type="text"
                        value={content.tentangKamiPage.experience.subtitle}
                        onChange={(e) =>
                          updateTentangKamiPage("experience", {
                            ...content.tentangKamiPage.experience,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#dbae6b]">
                        Milestone Timeline ({content.tentangKamiPage.experience.items.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [
                            ...content.tentangKamiPage.experience.items,
                            {
                              year: "2026",
                              title: "Pencapaian Baru",
                              description: "Deskripsi pencapaian milestone.",
                            },
                          ];
                          updateTentangKamiPage("experience", {
                            ...content.tentangKamiPage.experience,
                            items: updated,
                          });
                        }}
                        className="bg-[#dbae6b]/20 text-[#dbae6b] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#dbae6b]/40"
                      >
                        <FiPlus /> Tambah Milestone
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.tentangKamiPage.experience.items.map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-[#001730] p-4 rounded-xl border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-[#dbae6b]">
                              Milestone #{idx + 1}
                            </span>
                            {content.tentangKamiPage.experience.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = content.tentangKamiPage.experience.items.filter(
                                    (_, i) => i !== idx
                                  );
                                  updateTentangKamiPage("experience", {
                                    ...content.tentangKamiPage.experience,
                                    items: updated,
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <FiTrash2 /> Hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-gray-400 mb-1">Tahun / Periode</label>
                              <input
                                type="text"
                                value={ex.year}
                                onChange={(e) => {
                                  const updated = [...content.tentangKamiPage.experience.items];
                                  updated[idx] = { ...updated[idx], year: e.target.value };
                                  updateTentangKamiPage("experience", {
                                    ...content.tentangKamiPage.experience,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-gray-400 mb-1">Judul Pencapaian</label>
                              <input
                                type="text"
                                value={ex.title}
                                onChange={(e) => {
                                  const updated = [...content.tentangKamiPage.experience.items];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  updateTentangKamiPage("experience", {
                                    ...content.tentangKamiPage.experience,
                                    items: updated,
                                  });
                                }}
                                className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Deskripsi Pencapaian</label>
                            <textarea
                              rows={2}
                              value={ex.description}
                              onChange={(e) => {
                                const updated = [...content.tentangKamiPage.experience.items];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                updateTentangKamiPage("experience", {
                                  ...content.tentangKamiPage.experience,
                                  items: updated,
                                });
                              }}
                              className="w-full bg-[#091322] border border-white/10 text-white text-xs px-3.5 py-2 rounded resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: FOOTER */}
          {activeTab === "footer" && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#dbae6b]">
                  Kelola Footer Website
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Atur deskripsi ringkas footer, hak cipta copyright, nomor
                  telepon, email, dan alamat.
                </p>
              </div>

              <div className="bg-[#0b1728] border border-[#dbae6b]/20 p-6 rounded-xl space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Teks Deskripsi Singkat Footer
                  </label>
                  <textarea
                    rows={3}
                    value={content.footer.aboutText}
                    onChange={(e) => updateFooter("aboutText", e.target.value)}
                    className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Teks Copyright
                  </label>
                  <input
                    type="text"
                    value={content.footer.copyrightText}
                    onChange={(e) =>
                      updateFooter("copyrightText", e.target.value)
                    }
                    className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Telepon Footer
                    </label>
                    <input
                      type="text"
                      value={content.footer.phone}
                      onChange={(e) => updateFooter("phone", e.target.value)}
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Email Footer
                    </label>
                    <input
                      type="text"
                      value={content.footer.email}
                      onChange={(e) => updateFooter("email", e.target.value)}
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Alamat / Kota Footer
                    </label>
                    <input
                      type="text"
                      value={content.footer.address}
                      onChange={(e) => updateFooter("address", e.target.value)}
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Akun Instagram Footer
                    </label>
                    <input
                      type="text"
                      value={content.footer.instagram}
                      onChange={(e) => updateFooter("instagram", e.target.value)}
                      className="w-full bg-[#001730] border border-[#dbae6b]/30 text-white text-xs px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
