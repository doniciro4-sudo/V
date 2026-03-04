// Import Firebase SDK dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// TEMPEL CONFIG FIREBASE KAMU DI SINI (Dapatkan dari tombol + Add app di gambar)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "tiksave-pro.firebaseapp.com",
    databaseURL: "https://tiksave-pro-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tiksave-pro",
    storageBucket: "tiksave-pro.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fungsi untuk mencatat log ke Firebase
async function saveDownloadLog(videoUrl) {
    try {
        await push(ref(db, 'laporan_download'), {
            url_target: videoUrl,
            timestamp: serverTimestamp(),
            user_agent: navigator.userAgent,
            platform: navigator.platform
        });
    } catch (e) {
        console.error("Gagal mencatat log:", e);
    }
}

// Fungsi utama fetchVideo (Sudah digabung)
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

    // STATE LOADING
    btnText.innerText = "PROSES PENGECEKAN";
    if(btnLoader) btnLoader.classList.remove('hidden');
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
                downloadBtn.innerText = "MENYIMPAN DATA...";
                downloadBtn.disabled = true;
                
                // --- PROSES CATAT LOG KE DATABASE ---
                await saveDownloadLog(url);
                
                downloadBtn.innerText = "SEDANG MENGUNDUH...";
                
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
                    
                    downloadBtn.innerText = "UNDUH BERHASIL";
                    setTimeout(() => {
                        downloadBtn.innerText = "UNDUH SEKARANG";
                        downloadBtn.disabled = false;
                    }, 2000);
                } catch (err) {
                    // Fallback jika fetch blob gagal
                    window.open(videoUrl, '_blank');
                    downloadBtn.innerText = "UNDUH SEKARANG";
                    downloadBtn.disabled = false;
                }
            };

            resultDiv.classList.remove('hidden');
        } else {
            throw new Error("TAUTAN TIDAK VALID ATAU PRIVAT");
        }
    } catch (err) {
        errorMsg.innerText = "KESALAHAN: " + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btnText.innerText = "AMBIL VIDEO";
        if(btnLoader) btnLoader.classList.add('hidden');
        btn.disabled = false;
    }
}

// Hubungkan ke tombol HTML
document.getElementById('btnAction').addEventListener('click', fetchVideo);
