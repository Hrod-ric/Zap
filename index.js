const whatsapp = require("whatsapp-web.js")
const bot = new whatsapp.Client({
    puppeteer: {
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    }
})
const fs = require ("fs")
/*const client = new Client({
    puppeteer: {
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    }
})*/
 

var forchat = ["557183334339-1503676340","557187681493-1555160547"]

const qrcode = require ("qrcode-terminal");

bot.on("qr",qr=>qrcode.generate(qr,{small:true}))

bot.on("ready", ()=>{
    console.log("pronto")
    bot.sendMessage("557187681493@c.us", "Online metendo");
})

var prefixo = "."
bot.on("message", async msg=>{
    var chat = await msg.getChat()
    if(!forchat.includes(chat.id.user)) return;
    if(!msg.body.startsWith(prefixo)) return;

    delete require.cache[require.resolve('./comandos')];
    var comandos = require("./comandos");

    var menssagem = msg.body.substring(prefixo.length);
    var separarPrimeiraPalavra = menssagem.split(' ')[0];
    var comandoSelecionado = comandos[separarPrimeiraPalavra]
    console.log(menssagem, separarPrimeiraPalavra, comandoSelecionado, comandos);
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
/*bot.on("message", async msg=>{
    var chat = await msg.getChat()
    const contact = await msg.getContact();
    let numero = contact.id.user;
        numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    if(!forchat.includes(chat.id.user)) return

    if(msg.body.startsWith(".comandos")){
        bot.sendMessage(msg.from,`".ficha"\n"Informações sobre o seu personagem"\n\n".pessoa"\n"para pesquisar um nome e receber a sua descricao"\n\n".feitico"\n"para pesquisar um feitico e receber a sua descricao"`)
    }

    else if(msg.body.startsWith(".contato")){
        const chat = await msg.getChat();
        await chat.sendMessage(`Hello @${contact.id.user}`, {
            mentions: [contact]
        });
        //console.log(contact);
        let menssagem = "Teste";
        chat.sendSeen();
        await bot.sendMessage(numero, menssagem);
    }

    else if(msg.body.startsWith(".ficha")){
        var Players=listaDePlayers()
        var encontrou = Players.find(p=>p.contato == contact.id.user);
        if(encontrou){
            msg.reply("Enviado!")
            await bot.sendMessage(numero, `Nome: ${encontrou.nome} \nIdade: ${encontrou.idade} ${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}${encontrou.habPassivas?"\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`)
        }
        else{
            msg.reply("Não encontrei!")
        }
    }

    else if(msg.body.startsWith(".lista")){
        var texto = msg.body.split(' ')[1]
        if(texto == "feiticos"){
            var String = "Lista de Feiticos\n- " + listaDeFeiticos().map(p=>p.nome).join("\n- ")
            msg.reply("Enviado!")
            await bot.sendMessage(numero, String)
        }
    }

    else if(msg.body.startsWith(".pessoa")){
        var Pessoas=listaDePessoas()
        var texto = msg.body.slice(8)
        var encontrou = Pessoas.find(p=>p.nome == texto);

        if(encontrou){
            msg.reply(`Encontrei: \nNome: ${encontrou.nome} \nIdade: ${encontrou.idade} ${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}${encontrou.lista?"\nLista: "+encontrou.lista.join(", "):""}`)
            if(encontrou.imagem) {
                var imagem = await whatsapp.MessageMedia.fromFilePath("./Imagens/"+encontrou.imagem)
                bot.sendMessage(msg.from,imagem)
            }
        }
        else{
            msg.reply("Não encontrei!")
        }
    }
    else if(msg.body.startsWith(".feitico")){
        var Feiticos=listaDeFeiticos()
        var texto = msg.body.slice(9)
        var encontrou = Feiticos.find(p=>p.nome == texto);
        if(encontrou){
            msg.reply("Enviado!")
            await bot.sendMessage(numero,`Nome: ${encontrou.nome} \nTipo: ${encontrou.tipo} \nEscola: ${encontrou.escola} ${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}`)
        }else{
            msg.reply("Não existe!")
        }
    }
    if(msg.body=="a"){
        var messagetext = await msg.getChat()
        console.log(messagetext);
    }
})*/
bot.initialize()