const whatsapp = require("whatsapp-web.js")
const bot = new whatsapp.Client({
    authStrategy: new whatsapp.LocalAuth(),
    puppeteer: {
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    }
})
const fs = require ("fs")

const listar = (pasta)=>{
    var Lista = fs.readdirSync("./Dados/"+pasta).map(p=>JSON.parse(fs.readFileSync("./Dados/"+pasta+"/"+p)));
    return Lista;
}


const numeros = require("./numeros");
var forchat = [""];//digite os numeros aqui
forchat += numeros;

const qrcode = require ("qrcode-terminal");
//console.log(require("./comandos").find(e=>e.nome.startsWith("comandos")).func);
bot.on("qr",qr=>qrcode.generate(qr,{small:true}))

bot.on("ready", ()=>{
    console.log("pronto")
    bot.sendMessage("557187681493@c.us", "Online");
})

bot.on("message", async msg=>{
    var chat = await msg.getChat();
    //console.log(msg.mediaKey);

    if(msg.mediaKey == "8YaU/thWJ2g2mruDgMSr9DLjCjQLRk3STacefpvwmyI=" || msg.mediaKey == "Jbc7FZLIRij7vXGAWijkuZik9ya6Ke2GngLtkwLUFH0="){
        var audio = whatsapp.MessageMedia.fromFilePath("./Dados/Audios/pegar.mp3")
        bot.sendMessage(msg.from, audio, { sendAudioAsVoice: true, quotedMessageId: msg.id._serialized})
    }

    if(!forchat.includes(chat.id.user)) return;if(!forchat.includes(chat.id.user)) return;

    var pessoa = await msg.getContact();
    var contato = pessoa.id.user;

    var Players = listar("Players");
    var Pl = Players.find(e=>e.contato==contato);
    if(!Pl){
        fs.writeFileSync("./Dados/Players/"+pessoa.name + ".json", JSON.stringify({
            usuario: pessoa.name,
            contato,
            role: "Visitante",
            alarme: false,
            id: "",
            nome: "",
            titulo: "",
            idade: "",
            imagem: "",
            video: "",
            descricao: "",
            habPassivas: null,
            feiticosAprendidos: null
        }, null, 4), "utf8");
    }

    var Inventarios = listar("Inventario");
    var In = Inventarios.find(e=>e.contato==contato);
    if(!In){
        fs.writeFileSync("./Dados/Inventario/"+pessoa.name + ".json", JSON.stringify({
            contato, 
            usuario: pessoa.name,
            mochila:  {
                tipo:null, 
                itens:null
            }, 
            reserva:null
        }, null, 4), "utf8");
    }
    
    var prefixo = "/"
    if(!msg.body.startsWith(prefixo)) return;

    delete require.cache[require.resolve('./comandos')];
    var comandos = require("./comandos");

    var menssagem = msg.body.substring(prefixo.length);
    var separarPrimeiraPalavra = menssagem.toLowerCase().split(' ')[0];
    //var listaComandos = Object.keys(comandos)
    //var keySelecionada = listaComandos.find(c=>c.split(", ").includes(separarPrimeiraPalavra))
    //var comandoSelecionado = comandos[keySelecionada]
    var comandoSelecionado= comandos.find(e=>e.nome.startsWith(separarPrimeiraPalavra))

    if(comandoSelecionado){
        try {
            if(comandoSelecionado.roles.includes(Pl.role)||!comandoSelecionado.roles.length){
                comandoSelecionado.func(msg,bot,whatsapp)
            }else{
                msg.react("💤")
            }
        } catch (e) {
            msg.reply("Erro!");
            console.log(e);
        }
    }
    else{
        msg.reply("Comando nao encontrado!")
    }
})
bot.initialize()

// PREVENT CRASH
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) console.log('Erro de Sintaxe');
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));