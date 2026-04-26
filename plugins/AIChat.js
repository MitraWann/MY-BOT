/**
 * Plugin: AI Chat
 * Description: Mengobrol dan tanya jawab dengan AI
 * Location: ./plugins/ai.js
 */

const Ai4Chat = require('../scrape/Ai4Chat');

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Mengecek apakah user memasukkan pertanyaan (text)
    if (!text) {
        return m.reply(`☘️ *Contoh:* ${usedPrefix + command} Apa itu JavaScript?`);
    }

    // Mengirim pesan loading (Bisa disesuaikan dengan global.mess.wait jika ada)
    await m.reply('☕ *One Moment, Please*');

    try {
        // Memanggil fungsi scraper AI
        const lenai = await Ai4Chat(text);
        
        // Membalas pesan dengan hasil dari AI
        await m.reply(`*Wann AI*\n\n${lenai}`);
        
    } catch (error) {
        console.error("Error AI:", error);
        // Mengirim pesan error (Bisa disesuaikan dengan global.mess.error jika ada)
        await m.reply('⚠ *Gagal Saat Melakukan Proses*');
    }
}

handler.help = ['ai', 'ask', 'chatgpt']
handler.tags = ['ai']
handler.description = 'Fitur tanya jawab cerdas menggunakan Artificial Intelligence (AI)' // Menambahkan variabel deskripsi sesuai permintaan
handler.command = /^(ai|ask|chatgpt)$/i

// Pengaturan limit dan status premium
handler.limit = false
handler.premium = false

module.exports = handler;