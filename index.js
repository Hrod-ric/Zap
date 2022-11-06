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



var forchat = ["557183334339-1503676340","557187681493-1555160547","557182060165","557187681493"]
//Rpg "557183334339-1503676340"
//La  "557187681493-1555160547"
//Fof "556792117043-1588125882"
const qrcode = require ("qrcode-terminal");
//console.log(require("./comandos").find(e=>e.nome.startsWith("comandos")).func);
bot.on("qr",qr=>qrcode.generate(qr,{small:true}))

bot.on("ready", ()=>{
    console.log("pronto")
    bot.sendMessage("557187681493@c.us", "Online metendo");
})

var prefixo = "/"
bot.on("message", async msg=>{
    var list = listar("PessoasFisicas")
    var chat = await msg.getChat();
    var contato = await msg.getContact();
    var id = contato.id.user
    var usuario = list.find(e=>e.id==id)
    if(!usuario)fs.writeFileSync("./Dados/PessoasFisicas/"+contato.name+" - "+ id + ".json", JSON.stringify({id, role:""}, null, 4), "utf8")

    usuario = list.find(e=>e.id==id)
    

    if(!forchat.includes(chat.id.user)) return;
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
            if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
                comandoSelecionado.func(msg,bot,whatsapp)
            }else{
                msg.reply("Voce nao tem permissão para usar esse comando!")
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