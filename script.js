async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) return alert("Link-nya kosong, Bos!");

    // Set Loading State
    btn.innerText = "🌀 Sedang Memproses...";
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        // 1. Minta bantuan API TikWM (Di belakang layar)
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.code === 0) {
            const videoUrl = json.data.play; 

            // 2. Logika Download Langsung (Blob)
            downloadBtn.onclick = async () => {
                downloadBtn.innerText = "📥 Mengunduh...";
                downloadBtn.disabled = true;

                try {
                    const res = await fetch(videoUrl);
                    const blob = await res.blob();
                    const localUrl = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = localUrl;
                    a.download = `VGet_${Date.now()}.mp4`; // Nama file custom
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(localUrl);

                    downloadBtn.innerText = "✅ Tersimpan!";
                } catch (e) {
                    // Jika Blob gagal (CORS), buka tab baru sebagai cadangan
                    window.open(videoUrl, '_blank');
                    downloadBtn.innerText = "Simpan ke Galeri";
                }
                downloadBtn.disabled = false;
            };

            resultDiv.classList.remove('hidden');
        } else {
            throw new Error("Link tidak valid atau video privat.");
        }
    } catch (err) {
        errorMsg.innerText = err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
