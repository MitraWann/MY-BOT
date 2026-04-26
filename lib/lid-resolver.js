/**
 * Module: LID Resolver (Advanced)
 * Fungsi: Menerjemahkan format @lid menjadi nomor WhatsApp asli (@s.whatsapp.net)
 * Location: ./lib/lid-resolver.js
 */

module.exports = (wann) => {
    // Fungsi global asynchronous untuk menukar LID menjadi Nomor WA Asli
    wann.resolveLid = async (senderId) => {
        if (!senderId || typeof senderId !== 'string') return senderId;
        
        // Jika formatnya @lid, bongkar database sesi internal Baileys
        if (senderId.endsWith('@lid')) {
            try {
                // Mengambil nomor asli dari memori sesi (WannSesi) yang tersimpan permanen
                let pn = await wann.signalRepository.lidMapping.getPNForLID(senderId);
                
                if (pn && typeof pn === 'string') {
                    // Membersihkan format jika ada port/device ID (misal :1)
                    if (pn.includes(':')) {
                        pn = pn.split(':')[0];
                    }
                    if (!pn.endsWith('@s.whatsapp.net')) {
                        pn += '@s.whatsapp.net';
                    }
                    return pn; // Mengembalikan nomor asli
                }
            } catch (err) {
                // Abaikan secara diam-diam jika data tidak ditemukan di repository
            }
        }
        
        // Jika bukan LID atau gagal diterjemahkan, kembalikan seperti semula
        return senderId; 
    };
};