async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) return alert("Masukkan link TikTok dulu!");

    // UI Loading
    btn.innerText = "⏳ Sedang Memproses...";
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        // Kerjasama dengan API TikWM
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.code === 0) {
            const videoUrl = json.data.play; // Ini link video HD tanpa watermark

            // Logika Download Langsung (Memaksa browser simpan file)
            downloadBtn.onclick = async (e) => {
                e.preventDefault();
                downloadBtn.innerText = "📥 Mengunduh...";
                
                try {
                    const videoRes = await fetch(videoUrl);
                    const blob = await videoRes.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = `TikTok_${Date.now()}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                    
                    downloadBtn.innerText = "✅ Berhasil Disimpan!";
                } catch (err) {
                    // Jika browser memblokir download paksa, buka di tab baru sebagai cadangan
                    window.open(videoUrl, '_blank');
                    downloadBtn.innerText = "SIMPAN KE GALERI";
                }
            };

            resultDiv.classList.remove('hidden');
        } else {
            throw new Error("Link tidak valid atau video tidak ditemukan.");
        }
    } catch (err) {
        errorMsg.innerText = "Error: " + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
