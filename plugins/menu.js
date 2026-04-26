/**
 * Plugin: Menu Auto Detect
 * Description: Menampilkan daftar menu dinamis dari semua file plugin
 * Location: ./plugins/menu.js
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Tentukan lokasi folder plugins
    const pluginFolder = path.join(__dirname, '../plugins');
    
    // Baca semua file yang berakhiran .js di dalam folder plugins
    const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

    let menuData = {};
    let totalCommands = 0;

    // Looping untuk mengekstrak data dari masing-masing file plugin
    for (let file of files) {
        try {
            // Kita hapus cache agar menu selalu up-to-date jika ada perubahan tanpa restart bot
            delete require.cache[require.resolve(path.join(pluginFolder, file))];
            const plugin = require(path.join(pluginFolder, file));

            // Lewati file jika tidak memiliki tags dan help yang valid
            if (!plugin || !plugin.tags || !plugin.help) continue;

            // Pastikan format tags dan help adalah Array
            let tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags];
            let helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];

            // Kelompokkan perintah berdasarkan tags (kategori)
            for (let tag of tags) {
                if (!menuData[tag]) menuData[tag] = [];
                menuData[tag].push(...helps);
            }
            
            totalCommands += helps.length;
        } catch (e) {
            console.log(`Gagal membaca plugin ${file} untuk menu:`, e);
            continue; // Lewati jika file error
        }
    }

    // --- MULAI MERAKIT TEKS MENU ---
    const pushname = m.pushName || "Pengguna";
    let textMenu = `👋 Halo kak *${pushname}*!\n`;
    textMenu += `Berikut adalah daftar menu bot yang tersedia:\n`;
    textMenu += `📊 Total Perintah: *${totalCommands}*\n\n`;

    // Looping data yang sudah dikelompokkan tadi untuk ditampilkan
    for (let tag in menuData) {
        // Buat huruf pertama kategori menjadi kapital (contoh: 'umum' -> 'Umum')
        const categoryName = tag.charAt(0).toUpperCase() + tag.slice(1);
        
        textMenu += `╭─「 *${categoryName}* 」\n`;
        for (let help of menuData[tag]) {
            textMenu += `│ ◦ ${usedPrefix}${help}\n`;
        }
        textMenu += `╰────────────\n\n`;
    }

    textMenu += `💡 *Tips:* Ketik ${usedPrefix}help <nama_perintah> untuk melihat deskripsi (jika ada).\n`;
    textMenu += `© Wann Bot`;

    // Kirimkan menu ke pengguna
    await m.reply(textMenu.trim());
}

handler.help = ['menu', 'help', 'allmenu']
handler.tags = ['umum']
handler.description = 'Menampilkan daftar semua perintah bot secara otomatis'
handler.command = /^(menu|help|allmenu)$/i

handler.limit = false
handler.premium = false

module.exports = handler;