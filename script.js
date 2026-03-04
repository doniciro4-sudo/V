async function fetchVideo() {
    const input = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMsg = document.getElementById('errorMsg');

    const url = input.value.trim();
    if (!url) return alert("Tempel link-nya dulu!");

    btn.innerText = "🔍 Mencari Video...";
    btn.disabled = true;
    resultDiv.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        // Kita pakai API yang berbeda khusus untuk Instagram & TikTok
        // API ini lebih tahan banting terhadap blokir Instagram
        const api = `https://api.vkrfork.com/api/v1/all?url=${encodeURIComponent(url)}`;
        const response = await fetch(api);
        const res = await response.json();

        let videoUrl = "";

        // Cek data dari API
        if (res.data && res.data.main_url) {
            videoUrl = res.data.main_url;
        } else if (res.url) {
            videoUrl = res.url;
        } else if (res.medias && res.medias[0]) {
            videoUrl = res.medias[0].url;
        }

        if (!videoUrl) throw new Error("Video tidak ditemukan atau akun privat.");

        // --- CARA BARU: LANGSUNG KE SUMBER ---
        // Karena Instagram memblokir "sedot data", kita kasih link aslinya saja
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            // Buka di tab baru agar user bisa 'Save Video As' atau klik titik tiga
            window.open(videoUrl, '_blank');
        };

        resultDiv.classList.remove('hidden');
        downloadBtn.innerText = "Klik Untuk Download (MP4)";

    } catch (err) {
        errorMsg.innerText = "Gagal: " + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
