async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) return alert("Tempel link TikTok dulu!");

    // UI Loading
    btn.innerText = "⏳ Sedang Memproses...";
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        // Panggil API TikWM
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) throw new Error("Gagal terhubung ke server API.");
        
        const json = await response.json();

        // Cek apakah data video ada
        if (json && json.data && json.data.play) {
            const videoUrl = json.data.play; 

            // Tombol Download Langsung
            downloadBtn.onclick = async (e) => {
                e.preventDefault();
                downloadBtn.innerText = "📥 Mengunduh...";
                downloadBtn.disabled = true;
                
                try {
                    // Cara paksa download agar masuk galeri
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
                    // Jika cara paksa gagal, buka di tab baru sebagai cadangan
                    window.open(videoUrl, '_blank');
                    downloadBtn.innerText = "SIMPAN KE GALERI";
                }
                downloadBtn.disabled = false;
            };

            resultDiv.classList.remove('hidden');
        } else {
            throw new Error(json.msg || "Video tidak ditemukan atau link salah.");
        }
    } catch (err) {
        errorMsg.innerText = "Error: " + err.message;
        errorMsg.classList.remove('hidden');
        console.error(err);
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
