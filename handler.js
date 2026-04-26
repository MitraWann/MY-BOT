// Import Module Dasar
require('./config');
const fs = require('fs');
const path = require('path');

module.exports = async (wann, m) => {
    // Di Baileys, 'm' adalah object update, pesannya ada di m.messages[0]
    const msg = m.messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    
    // --- ADOPSI LOGIKA DARI HANDLER(1).JS & SIMPLE.JS ---
    
    // 1. Ambil ID Chat tujuan (Grup atau Private)
    let chat = msg.key.remoteJid;
    
    // 2. Deteksi Pengirim Tingkat Lanjut (Akurat 100%)
    let sender = msg.key.fromMe 
        ? (wann.user.id.split(':')[0] + '@s.whatsapp.net') // Jika bot sendiri yang mengetik
        : (msg.key.participant || msg.key.remoteJid || ""); // Jika pengguna lain

    // Membersihkan format ID dari nomor port (Contoh: 628xx:1@s.whatsapp.net menjadi 628xx@s.whatsapp.net)
    if (sender.includes(':')) {
        sender = sender.split(':')[0] + '@s.whatsapp.net';
    }
    
    // 3. Menerjemahkan LID menjadi nomor asli (Support Advanced Resolver)
    if (wann.resolveLid && sender.endsWith('@lid')) {
        sender = await wann.resolveLid(sender) || sender;
    }

    // 4. JURUS TERAKHIR: Fallback Group Metadata (Rahasia simple.js)
    if (sender.endsWith('@lid') && chat.endsWith('@g.us')) {
        try {
            // Mengintip data daftar anggota grup
            const groupMeta = await wann.groupMetadata(chat);
            // Mencari kecocokan LID pengguna di dalam daftar anggota
            const member = groupMeta.participants.find(p => p.lid === sender || p.id === sender);
            
            if (member && member.id && !member.id.endsWith('@lid')) {
                // Jika ketemu, timpa LID dengan nomor WA Aslinya!
                sender = member.id; 
            }
        } catch (err) {
            // Abaikan secara diam-diam jika bot belum menjadi admin atau gagal mengambil data
        }
    }
    
    // Injeksi data bersih ke object pesan agar dipakai oleh seluruh plugin
    msg.chat = chat;
    msg.sender = sender;
    msg.isGroup = chat.endsWith('@g.us');

    const pushname = msg.pushName || "Wann";
    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const text = args.join(" ");

    // Cek apakah pesan diawali dengan prefix
    if (!body.startsWith(global.prefix)) return;

    // --- POLYFILL UNTUK FORMAT PLUGIN BARU ---
    // m.reply sekarang membalas ke 'chat' (Grup/Private), bukan ke 'sender'
    msg.reply = async (teks) => {
        return await wann.sendMessage(msg.chat, { text: teks }, { quoted: msg });
    };

    const isGroup = msg.isGroup;
    const isAdmin = (global.admin.includes(sender));

    let isHandled = false;

    // --- SISTEM PENCARIAN PLUGIN MODULAR ---
    const pluginFolder = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginFolder)) {
        const plugins = fs.readdirSync(pluginFolder);
        
        for (let file of plugins) {
            if (file.endsWith('.js')) {
                const pluginPath = `./plugins/${file}`;
                
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                
                let isMatch = false;

                if (plugin.command instanceof RegExp) {
                    isMatch = plugin.command.test(command);
                } else if (typeof plugin.command === 'string') {
                    isMatch = (plugin.command === command || (plugin.aliases && plugin.aliases.includes(command)));
                }

                // Jika perintah cocok
                if (isMatch) {
                    isHandled = true; 
                    try {
                        if (typeof plugin === 'function') {
                            await plugin(msg, { 
                                conn: wann, 
                                usedPrefix: global.prefix, 
                                command: command, 
                                text: text,
                                args: args,
                                isGroup, 
                                isAdmin 
                            });
                        } else if (plugin.execute) {
                            const wannreply = (teks) => wann.sendMessage(msg.chat, { text: teks }, { quoted: msg });
                            await plugin.execute(wann, m, { msg, body, sender, pushname, args, q: text, wannreply, isGroup, isAdmin });
                        }
                    } catch (err) {
                        console.error(`Error di plugin ${file}:`, err);
                        msg.reply(global.mess.error);
                    }
                    break;
                }
            }
        }
    }

    if (!isHandled) {
        msg.reply(global.mess.default);
    }
};