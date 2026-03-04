async function fetchVideo() {
    const urlInput = document.getElementById('videoUrl');
    const btn = document.getElementById('btnAction');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadLink');

    const url = urlInput.value.trim();
    if (!url) return alert("Link mana bos?");

    btn.innerText = "⏳ Sedang Menyiapkan File...";
    btn.disabled = true;

    try {
        // 1. Ambil data dari API secara rahasia (di belakang layar)
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const result = await response.json();

        if (result.code === 0) {
            const videoUrl = result.data.play; 

            // 2. JANGAN kasih link asli ke tombol download. 
            // Kita kasih fungsi "Penyedot" saat tombol diklik
            downloadBtn.onclick = async (e) => {
                e.preventDefault(); 
                downloadBtn.innerText = "📥 Sedang Mengunduh...";
                
                // 3. Teknik Rahasia: Download video ke memori browser dulu
                const fileResponse = await fetch(videoUrl);
                const fileBlob = await fileResponse.blob();
                const localUrl = window.URL.createObjectURL(fileBlob);
                
                // 4. Buat link palsu yang otomatis nge-klik sendiri ke HP user
                const linkPalsu = document.createElement('a');
                linkPalsu.href = localUrl;
                linkPalsu.download = "Video_Saya.mp4"; // Nama file terserah kamu
                document.body.appendChild(linkPalsu);
                linkPalsu.click();
                
                // 5. Bereskan jejak
                document.body.removeChild(linkPalsu);
                window.URL.revokeObjectURL(localUrl);
                downloadBtn.innerText = "✅ Berhasil Disimpan!";
            };

            resultDiv.classList.remove('hidden');
        } else {
            alert("Video tidak ditemukan atau link salah!");
        }
    } catch (err) {
        alert("Server sibuk, coba lagi nanti!");
    } finally {
        btn.innerText = "Ambil Video";
        btn.disabled = false;
    }
}
