// Import Module 
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")
const { resolve } = require("path")
const { version } = require("os")

// Metode Pairing
const usePairingCode = true

// Promt Input Terminal
async function question(promt) {
    process.stdout.write(promt)
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => r1.question("", (ans) => {
        r1.close()
        resolve(ans)
    }))
    
}

async function connectToWhatsApp() {
  // Folder sesi diubah menjadi WannSesi
  const { state, saveCreds } = await useMultiFileAuthState('./WannSesi')
  
  // Versi Terbaru
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Wann Using WA v${version.join('.')}, isLatest: ${isLatest}`)

  // Variabel utama diubah dari lenwy menjadi wann
  const wann = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version: version,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }
      return proto.Message.fromObject({})
    }
  })

  // Handle Pairing Code
  if (usePairingCode && !wann.authState.creds.registered) {
    try {
      const phoneNumber = await question('☘️ Masukan Nomor Yang Diawali Dengan 62 :\n')
      const code = await wann.requestPairingCode(phoneNumber.trim())
      console.log(`🎁 Pairing Code : ${code}`)
    } catch (err) {
      console.error('Failed to get pairing code:', err)
    }
  }
    // Menyimpan Sesi Login
    wann.ev.on("creds.update", saveCreds)

    // Integrasi Module LID Resolver
    require("./lib/lid-resolver")(wann)

    // Informasi Koneksi
    wann.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if ( connection === "close") {
            console.log(chalk.red("❌  Koneksi Terputus, Mencoba Menyambung Ulang"))
            connectToWhatsApp()
        } else if ( connection === "open") {
            console.log(chalk.green("✔  Bot Berhasil Terhubung Ke WhatsApp"))
        }
    })

    // Respon Pesan Masuk
    wann.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]

        if (!msg.message) return

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || "Wann" // Fallback nama pengguna diubah

        // Log Pesan Masuk Terminal
        const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"]
        const randomColor = listColor[Math.floor(Math.random() * listColor.length)]

        console.log(
            chalk.yellow.bold("Credit : Wann"), // Log nama di terminal
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body)
            
        )

        // Mengarahkan file ke handler baru (handler.js)
        require("./handler")(wann, m)
    })
    
}

// Jalankan Koneksi WhatsApp
connectToWhatsApp()

// ==========================================
// SISTEM AUTO RELOAD (HOT RELOAD)
// ==========================================
const fs = require('fs');

// Fungsi pemantau file
function watchFile(filepath) {
    fs.watchFile(require.resolve(filepath), () => {
        console.log(chalk.yellowBright(`[ HOT RELOAD ] File ${filepath} telah diubah. Memuat ulang file otomatis...`));
        // Menghapus cache lama agar file yang baru di-save langsung terbaca
        delete require.cache[require.resolve(filepath)];
    });
}

// Daftarkan file utama yang ingin dipantau (Tanpa format .js)
watchFile('./handler');
watchFile('./config'); // Ubah menjadi './config' jika sebelumnya kamu sudah me-rename filenya