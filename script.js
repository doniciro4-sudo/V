async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) return alert("Tempel link-nya dulu, Bos!");

    // Reset UI & Loading
    btn.innerText = "🔍 Mencari Video...";
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        let apiUrl = "";
        
        // LOGIKA PEMILIHAN API
        if (url.includes("tiktok.com")) {
            // Pakai TikWM (Paling Stabil buat TikTok)
            apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        } else if (url.includes("instagram.com")) {
            // Pakai API Publik Instagram (Kadang perlu refresh kalau gagal)
            apiUrl = `https://api.vkrfork.com/api/v1/instagram?url=${encodeURIComponent(url)}`;
        } else {
            throw new Error("Maaf, saat ini baru mendukung TikTok & Instagram.");
        }

        const response = await fetch(apiUrl);
        const json = await response.json();

        let finalVideoUrl = "";

        // AMBIL LINK BERDASARKAN SUMBERNYA
        if (url.includes("tiktok.com") && json.code === 0) {
            finalVideoUrl = json.data.play;
        } else if (url.includes("instagram.com") && json.data && json.data.main_url) {
            finalVideoUrl = json.data.main_url;
        } else {
            throw new Error("Video tidak ditemukan atau link salah.");
        }

        // FUNGSI DOWNLOAD (TETAP DI WEB KAMU)
        downloadBtn.onclick = async (e) => {
            e.preventDefault();
            downloadBtn.innerText = "📥 Mengunduh...";
            
            try {
                const res = await fetch(finalVideoUrl);
                const blob = await res.blob();
                const localUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = localUrl;
                a.download = `Downloader_${Date.now()}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(localUrl);
                
                downloadBtn.innerText = "✅ Berhasil!";
            } catch (err) {
                // Jika kena blokir keamanan browser, buka tab baru
                window.open(finalVideoUrl, '_blank');
                downloadBtn.innerText = "Klik Disini (Manual)";
            }
        };

        resultDiv.classList.remove('hidden');
        downloadBtn.innerText = "Download Video";

    } catch (err) {
        errorMsg.innerText = err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
