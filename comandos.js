const fs = require("fs")
const listar = (pasta)=>{
    var Lista = fs.readdirSync("./Dados/"+pasta).map(p=>JSON.parse(fs.readFileSync("./Dados/"+pasta+"/"+p)));
    return Lista;
}

Array.prototype.adicionarComandos = function(nome, desc, func, roles=[]){
    this.push({nome, desc, func, roles})
    return this
}

const contato = async (msg)=>{
    var chat = await msg.getChat()
    var contato = await msg.getContact();
    var numero = contato.id.user;
        numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    return {chat,numero,contato};
}
const getInput = (msgString, removeArgs = 0) => {
    return msgString.split(" ").filter((_, i)=>i>removeArgs).join(" ")
} 

const misto = async (texto)=>{
    //const regExp = /(\nome:)(.*)(\n|\.)/i
    //const re = new RegExp(`${parametro}` + `(.*)(\n|\.)`, 'i');
    const re = /(?<=\n)(.*)(:)(.*)(?<=\.)/gi
    const textoSelecionado = texto.match(re)
    //console.log("\n\n");
    //console.log(re.exec(texto));
    if(!textoSelecionado) return;
    var atributos = textoSelecionado.map(p=>p.split(":")[0])
    var valores = textoSelecionado.map(p=>p.split(":")[1].replace(".","").substring(1))
    var input = `{ 
        ${atributos.map((e, i)=>`"` + e.toLowerCase() + `"`+ " : " + `"`+ valores[i]+`"`).join(", ")}
    }`
    var obj = JSON.parse(input)
    return obj;
}

var comandos = []

//Alarme
var exec = true;
comandos.adicionarComandos("alarme","", async (msg, bot, whatsapp)=>{
    //await bot.sendMessage(msg.from, `${tempo}`)
    list = listar("Players")
    var numero = (await contato(msg)).numero
    encontrou = list.find(p=>p.contato == numero.replace("@c.us",""))

    if(!encontrou)return console.log("saiu");;

    //console.log(encontrou);
    if(encontrou?.alarme){
        var pessoa = encontrou;
        pessoa.alarme = false;
        fs.writeFileSync("./Dados/Players/"+pessoa.usuario + ".json", JSON.stringify(pessoa, null, 4), "utf8")

        var tempo = 0;
        msg.react("🕐")
        var alarme = setInterval(async() => {
            tempo++;
            var caractere = ["🕑" , "🕒" , "🕓" , "🕔" , "🕕" , "🕖" , "🕗" , "🕘" , "🕙" ,"🕚" ,"🕛"]
            //console.log(caractere);
            await msg.react(caractere[tempo])
            if(tempo == 10){
                await msg.react("🆗")
                clearInterval(alarme);
                pessoa.alarme = true;
                fs.writeFileSync("./Dados/Players/"+pessoa.usuario + ".json", JSON.stringify(pessoa, null, 4), "utf8")
            }
        },3000);
    }
})

//Comandos
comandos.adicionarComandos("comandos","Mostra todos os comandos",async (msg, bot, whatsapp)=>{
    var texto = comandos.map(e=>e.nome+" - "+e.desc).join("\n\n")
    msg.reply(texto)
})

//Jogadores
comandos.adicionarComandos("jogadores","Mostra todos os membros e funções",async (msg, bot, whatsapp)=>{
    var participantes = await msg.getChat()
    participantes = participantes.participants
    console.log(participantes);
    var numeros = participantes.map(p=>p.id.user)
    var info = await msg.getInfo()
    //var texto = "@" + numeros.join("\n@")
    //await bot.sendMessage(msg.from, texto2, {mentions: participantes})

    var lista = listar("Players")

    var texto = "jogadores"
    var texto2 =    "```"+texto+" ".repeat(20).slice(texto.length)+"Função \n"+
                    "" + numeros.map(d=>{
                        var encontrou = lista.find(p=>p.contato == d)
                        return `${encontrou?.usuario}` + " ".repeat(20).slice(encontrou?.usuario?.length)+`[${encontrou?.role}]`
                    }).join("\n")+"```"

    await bot.sendMessage(msg.from, texto2, {quotedMessageId: info.id._serialized})

},["Jogador","Admin"])

//Listar
comandos.adicionarComandos("listar","Mostra os elementos dentro de um grupo, sendo os grupos: Pessoas, Feiticos e Arquivos",async (msg, bot, whatsapp)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var numero = (await contato(msg)).numero
    texto = msg.body.toLowerCase().split(' ')[2]
    var info = await msg.getInfo()
    var lista = []

    //Pessoas
    lista.adicionarComandos("pes","Pessoas",async()=>{
        if(texto){
            var String= "🔍População do "+texto+"🔍\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
            msg.react("🆗")
            return
        }
        var String =    "🔍Lista de Pessoas🔍"+
                        "\n\nPlayers\n- " + listar("Players").map(p=>p.nome).join("\n- ") + 
                        "\n\nPovoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ") +
                        "\n\nRollenspiel\n- " + listar("Rollenspiel").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
        msg.react("🆗")
    })

    //Feitiços
    lista.adicionarComandos("fei","Feiticos",async()=>{
        if(texto){
            var String= "🔍Feiticos de "+texto+"🔍\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
            msg.react("🆗")
            return
        }

        var String = "🔍Lista de Feiticos🔍\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
        msg.react("🆗")
    })
    
    //Arquivos
    lista.adicionarComandos("arq","Arquivos",async()=>{
        if(texto){
            var String= "🔍Lista de Arquivos\n"
                        +texto+"🔍\n- " + fs.readdirSync("./Dados/"+texto).map(p=>p).join("\n- ")
            await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
            msg.react("🆗")
            return
        }

        var String =    "🔍Lista de Arquivos🔍"+
                        "\n\nImagens\n- " + fs.readdirSync("./Dados/Imagens").join("\n- ") +
                        "\n\nAudios\n- " + fs.readdirSync("./Dados/Audios").join("\n- ") +
                        "\n\nVideos\n- " + fs.readdirSync("./Dados/Videos").join("\n- ")

        await bot.sendMessage(numero, String, {quotedMessageId: info.id._serialized})
        msg.react("🆗")
    })

    //Comando
    var comandoSelecionado= lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.react("⚠️")
        }
    }else{
        msg.react("⚠️")
    }
})

//Ficha
comandos.adicionarComandos("ficha","Informações sobre o seu personagem",async (msg, bot, whatsapp)=>{ 
    var Players=listar("Players")
    //var contact = (await contato(msg))
    //console.log(contact);
    var info = await msg.getInfo()
    var numero = (await contato(msg)).numero
    var chat = (await contato(msg)).chat
    var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
    if(encontrou){
        var ficha = `${encontrou.nome} \n`+
                    `Idade: ${encontrou.idade}`+
                    `${encontrou.titulo?"\nConhecido como "+encontrou.titulo:"\nConhecido como "+encontrou.id}`+
                    `${encontrou.descricao?"\n\nDescrição: "+encontrou.descricao:""}`+
                    `${encontrou.habPassivas?"\n\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`+
                    `${encontrou.feiticosAprendidos?"\n\nFeitiços Aprendidos: "+encontrou.feiticosAprendidos.join(", "):""}`;

        if(encontrou.imagem){
            var imagem = await whatsapp.MessageMedia.fromFilePath("./Dados/Imagens/"+encontrou.imagem)
            await bot.sendMessage(numero, imagem,{ caption: ficha, quotedMessageId: info.id._serialized });
            msg.react("🆗")
            return
        }
        if(encontrou.video){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Videos/"+encontrou.video)
            await bot.sendMessage(numero, video,{ sendVideoAsGif: true, quotedMessageId: info.id._serialized });
            await bot.sendMessage(numero, ficha)
            mmsg.react("🆗")
            return
        }

        await bot.sendMessage(numero, ficha, {quotedMessageId: info.id._serialized})
        msg.react("🆗")
        }
},["Jogador","Admin"])

//Consultar
comandos.adicionarComandos("consultar","Mostra a descrição de um elemento",async (msg, bot, whatsapp)=>{
    var Lista=listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Feiticos"),listar("Extra"),listar("Extra2"));
    var texto = msg.body.toLowerCase().split(' ').filter((_,i)=>i).join(" ")
    var encontrou = Lista.find(p=>p.id == texto);

    var info = await msg.getInfo()

    try{
        var ficha = `${encontrou.nome}`+
                    `${encontrou.titulo?"\nConhecido como "+encontrou.titulo:"\nConhecido como "+encontrou.id}`+
                    `${encontrou.descricao?"\n\nDescrição: "+encontrou.descricao:"\nSem descrição"}`;

        if(encontrou.imagem){
            var imagem = await whatsapp.MessageMedia.fromFilePath("./Dados/Imagens/"+encontrou.imagem)
            await bot.sendMessage(msg.from,imagem,{ caption: ficha, quotedMessageId: info.id._serialized });
            return
        }
        if(encontrou.video){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Videos/"+encontrou.video)
            await bot.sendMessage(msg.from, video,{ sendVideoAsGif: true, caption: ficha, quotedMessageId: info.id._serialized });
            return
        }
        msg.reply(ficha)
    }catch{
        msg.react("⚠️")
    }
})

//Adicionar
comandos.adicionarComandos("adicionar","Cria um novo elemento na lista",async (msg)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var lista = []

    //Pessoas
    lista.adicionarComandos("pessoas","Pessoas",async()=>{
        var input = msg.body.split("pessoas")[1]

            var texto = input.split("\n")
            texto = texto.map(p=>(p.charAt(p.length-1) != ".")?p+=".":p)
            input = texto.join(" \n")

        var pessoa =  await misto(input)
        //console.log(pessoa);
        if(!pessoa?.id)return msg.react("⚠️")
    
        var Lista = listar("Extra");
        var encontrou = Lista.find(p=>p.id == pessoa.id);
        if(encontrou) return msg.react("⚠️")
    
        fs.writeFileSync("./Dados/Extra/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
        msg.react("✅")
    })

    //Feitiços
    lista.adicionarComandos("feiticos","Feitiços",async()=>{
        var input = msg.body.split("feiticos")[1]

            var texto = input.split("\n")
            texto = texto.map(p=>(p.charAt(p.length-1) != ".")?p+=".":p)
            input = texto.join(" \n")

        var feitico =  await misto(input)
        //console.log(feitico);
        if(!feitico?.id)return msg.react("⚠️")
    
        var Lista = listar("Feiticos");
        var encontrou = Lista.find(p=>p.id == feitico.id);
        if(encontrou) return msg.react("⚠️")
    
        fs.writeFileSync("./Dados/Extra2/"+feitico.id + ".json", JSON.stringify(feitico, null, 4), "utf8")
        msg.react("✅")
    })

    //Comando
    var comandoSelecionado = lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.react("⚠️")
        }
    }else{
        msg.react("⚠️")
    }
    
},["Admin"])

//Alterar
comandos.adicionarComandos("alterar","Altera os dados de um elemento: Nome, Idade, Titulo, Descricao",(msg)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var lista = []

    //Ficha
    lista.adicionarComandos("ficha","Ficha",async()=>{
        var listas = listar("Players")
        var numero = (await contato(msg)).numero
        var pessoa = listas.find(e=>e.contato == numero.replace("@c.us",""))
        if(pessoa) {
            //var input = getInput(msg.body, 1)
            var input = msg.body.split("ficha")[1]

            var texto = input.split("\n")
            texto = texto.map(p=>(p.charAt(p.length-1) != ".")?p+=".":p)
            input = texto.join(" \n")

            var obj = await misto(input)
            //if(input.charAt(input.length - 1) != ".") input+=".";

            if(!obj)return msg.react("⚠️")

            pessoa.nome = obj.nome? obj.nome : pessoa.nome
            pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
            pessoa.idade = obj.idade? obj.idade : pessoa.idade
            pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao
            pessoa.imagem = obj.imagem? obj.imagem : pessoa.imagem
    
            fs.writeFileSync("./Dados/Players/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
            msg.react("✅")
        }
    })

    //Pessoas
    lista.adicionarComandos("pessoas","Pessoas",async()=>{
        var listas = listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Extra"))
        var texto = msg.body.toLowerCase().split("\n")[0]
        texto = texto.split(" ")[2]
        var pessoa = listas.find(e=>e.id == texto)
        //console.log(texto);
        if(pessoa){
            try{
                var input = msg.body.split("pessoas")[1]

                var texto = input.split("\n")
                texto = texto.map(p=>(p.charAt(p.length-1) != ".")?p+=".":p)
                input = texto.join(" \n")

                var obj = await misto(input)
                if(!obj)return msg.react("⚠️")

                pessoa.nome = obj.nome? obj.nome : pessoa.nome
                pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
                pessoa.idade = obj.idade? obj.idade : pessoa.idade
                pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao
                pessoa.imagem = obj.imagem? obj.imagem : pessoa.imagem
        
                fs.writeFileSync("./Dados/Extra/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
                msg.react("✅")
            }catch(e){
                msg.reply(e)
            }
        }else{
            msg.react("⚠️")
        }
    },["Admin"])

    //Feiticos
    lista.adicionarComandos("feiticos","Feiticos",async()=>{
        var listas = listar("Feiticos").concat(listar("Extra"))
        var texto = msg.body.toLowerCase().split("\n")[0]
        texto = texto.split(" ")[2]
        var feitico = listas.find(e=>e.id == texto)
        //console.log(texto);
        if(feitico){
            try{
                var input = msg.body.split("feiticos")[1]

                var texto = input.split("\n")
                texto = texto.map(p=>(p.charAt(p.length-1) != ".")?p+=".":p)
                input = texto.join(" \n")

                var obj = await misto(input)
                if(!obj)return msg.react("⚠️")

                feitico.nome = obj.nome? obj.nome : feitico.nome
                feitico.escola = obj.escola? obj.escola : feitico.escola
                feitico.tipo = obj.tipo? obj.tipo : feitico.tipo
                feitico.descricao = obj.descricao? obj.descricao : feitico.descricao
                feitico.imagem = obj.imagem? obj.imagem : feitico.imagem
        
                fs.writeFileSync("./Dados/Extra2/"+feitico.id + ".json", JSON.stringify(feitico, null, 4), "utf8")
                msg.react("✅")
            }catch(e){
                msg.reply(e)
            }
        }else{
            msg.react("⚠️")
        }
    },["Admin"])

    //Comando
    var comandoSelecionado = lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.react("⚠️")
        }
    }else{
        msg.react("⚠️")
    }
})

//Audio
comandos.adicionarComandos("audio","Escolha um audio para que o bot mande",async (msg, bot, whatsapp)=>{
    var texto = msg.body.toLowerCase().split("audio")[1];
    texto = texto.charAt(0) == " "? texto.substring(1) : texto
    try{
        var audio = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto+".mp3")
        await bot.sendMessage(msg.from,audio,{ sendAudioAsVoice: true })
    }catch{
        msg.react("⚠️")
    }
    
})

//Enviar
comandos.adicionarComandos("enviar","Alerta a pessoa mencionada com um audio",async (msg, bot, whatsapp)=>{
    try{
        var numero = msg.body.split(' ')[1];
            numero = numero.startsWith('@') ? numero.replace("@","") : numero
            numero = numero.includes('@g.us') ? numero :
            numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    
        const re = /(55.{10,11})/gi
        var texto = msg.body.split(re)[2];
        

        if(texto.includes(".mp4")){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Videos/"+texto)
            await bot.sendMessage(numero, video, { sendVideoAsGif: true })    
        }else if(texto.includes(".mp3")){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto)
            await bot.sendMessage(numero, video, { sendAudioAsVoice: true })
        }
    }catch{
        msg.react("⚠️")
    }       
},["Admin"])

//⏳⌛💰🛒📚📌🔍🔎🔓🔒⌚🏹🏋️‍♂️🤸‍♀️🤺🥊❎✅🆗💤〽️⚠️👁️‍🗨️💪🥷🧙‍♂️
module.exports = comandos