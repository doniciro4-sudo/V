// Import Firebase SDK dari CDN (Versi Lite agar cepat)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// KONFIGURASI FIREBASE KAMU (SUDAH TERISI)
const firebaseConfig = {
  apiKey: "AIzaSyBdPyIdAM2WThbACPMXuO4BR0862sjJvGk",
  authDomain: "tiksave-pro-e32c5.firebaseapp.com",
  projectId: "tiksave-pro-e32c5",
  storageBucket: "tiksave-pro-e32c5.firebasestorage.app",
  messagingSenderId: "163327438786",
  appId: "1:163327438786:web:b1526c29d2a80f3ac2305b",
  measurementId: "G-69N55XZYVZ",
  // URL Database otomatis mengikuti region Singapore/Default
  databaseURL: "https://tiksave-pro-e32c5-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fungsi mencatat log ke Firebase
async function saveDownloadLog(videoUrl) {
    try {
        await push(ref(db, 'laporan_download'), {
            url_target: videoUrl,
            timestamp: serverTimestamp(),
            info_perangkat: navigator.userAgent
        });
        console.log("Log berhasil masuk ke Firebase");
    } catch (e) {
        console.error("Gagal mencatat ke Firebase:", e);
    }
}

// Fungsi utama aplikasi (Gabungan)
async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) {
        input.style.borderColor = "#ff0050";
        setTimeout(() => input.style.borderColor = "rgba(255, 255, 255, 0.1)", 1000);
        return;
    }

    // TAMPILAN LOADING
    btnText.innerText = "SEDANG MENCARI...";
    if (btnLoader) btnLoader.classList.remove('hidden');
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.code === 0) {
            const videoUrl = json.data.play;

            downloadBtn.onclick = async (e) => {
                e.preventDefault();
                downloadBtn.innerText = "MENGIRIM LOG...";
                downloadBtn.disabled = true;
                
                // --- CATAT SIAPA YANG DOWNLOAD ---
                await saveDownloadLog(url);
                
                downloadBtn.innerText = "MENGUNDUH VIDEO...";
                
                try {
                    const res = await fetch(videoUrl);
                    const blob = await res.blob();
                    const bUrl = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = bUrl;
                    a.download = `TIKSAVE_${Date.now()}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    downloadBtn.innerText = "BERHASIL!";
                    setTimeout(() => {
                        downloadBtn.innerText = "UNDUH SEKARANG";
                        downloadBtn.disabled = false;
                    }, 2000);
                } catch (err) {
                    // Fallback jika browser blokir download otomatis
                    window.open(videoUrl, '_blank');
                    downloadBtn.innerText = "UNDUH SEKARANG";
                    downloadBtn.disabled = false;
                }
            };

            resultDiv.classList.remove('hidden');
        } else {
            throw new Error("Tautan tidak valid atau video privat.");
        }
    } catch (err) {
        errorMsg.innerText = "Error: " + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btnText.innerText = "AMBIL VIDEO";
        if (btnLoader) btnLoader.classList.add('hidden');
        btn.disabled = false;
    }
}

// Pasang event klik ke tombol
document.getElementById('btnAction').addEventListener('click', fetchVideo);
