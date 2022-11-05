const whatsapp = require("whatsapp-web.js")
const bot = new whatsapp.Client({
    puppeteer: {
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    }
})
const fs = require ("fs")
 

var forchat = ["557183334339-1503676340","557187681493-1555160547","557182060165","557187681493"]
//'556792117043-1588125882'
const qrcode = require ("qrcode-terminal");

bot.on("qr",qr=>qrcode.generate(qr,{small:true}))

bot.on("ready", ()=>{
    console.log("pronto")
    bot.sendMessage("557187681493@c.us", "Online metendo");
})

var prefixo = "/"
bot.on("message", async msg=>{
    var chat = await msg.getChat()

    if(!forchat.includes(chat.id.user)) return;
    if(!msg.body.startsWith(prefixo)) return;

    delete require.cache[require.resolve('./comandos')];
    var comandos = require("./comandos");

    var menssagem = msg.body.substring(prefixo.length);
    var separarPrimeiraPalavra = menssagem.split(' ')[0];
    var listaComandos = Object.keys(comandos)
    var keySelecionada = listaComandos.find(c=>c.split(", ").includes(separarPrimeiraPalavra))
    var comandoSelecionado = comandos[keySelecionada]
    //var comandoSelecionado = comandos[separarPrimeiraPalavra]

    if(comandoSelecionado){
        try {
            comandoSelecionado(msg,bot,whatsapp)
        } catch (e) {
            msg.reply("Erro!");
        }
    }
    else{
        msg.reply("Comando nao encontrado!")
    }
})
/*
   
    if(msg.body.startsWith(".contato")){
        const chat = await msg.getChat();
        await chat.sendMessage(`Hello @${contact.id.user}`, {
            mentions: [contact]
        });
        //console.log(contact);
        let menssagem = "Teste";
        chat.sendSeen();
        await bot.sendMessage(numero, menssagem);
    }

})*/
bot.initialize()