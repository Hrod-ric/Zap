const fs = require("fs")
const Util = require("whatsapp-web.js/src/util/Util")
Util.setFfmpegPath("ffmpeg")

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
    const re = /(?<=\n)(.*)(:)(.*)(?<=\$)/gi
    const textoSelecionado = texto.match(re)
    //console.log("\n\n");
    //console.log(re.exec(texto));
    if(!textoSelecionado) return;
    var atributos = textoSelecionado.map(p=>p.split(":")[0])
    var valores = textoSelecionado.map(p=>p.split(":")[1].replace("$","").substring(1))
    var input = `{ 
        ${atributos.map((e, i)=>`"` + e.toLowerCase() + `"`+ " : " + `"`+ valores[i]+`"`).join(", ")}
    }`
    var obj = JSON.parse(input)
    return obj;
}

var comandos = []

//Adicionar
comandos.adicionarComandos("adicionar","Cria um novo elemento na lista",async (msg)=>{
    var lista = []
    //⏳⌛💰🛒📚📌🔍🔎🔓🔒⌚🏹🏋️‍♂️🤸‍♀️🤺🥊❎✅🆗💤〽️⚠️👁️‍🗨️💪🥷🧙‍♂️
    //Pessoas
    lista.adicionarComandos("pessoas","Pessoas",async()=>{
        var input = msg.body.split("pessoas")[1];

            var texto = input.split("\n");
            texto = texto.map(p=>(p.charAt(p.length-1) != "$")?p+="$":p);
            input = texto.join(" \n");

        var pessoa =  await misto(input);
        if(!pessoa?.id)return msg.react("🔍");
        if(!pessoa?.lugar)pessoa.lugar = "extra";
    
        var Lista = listar("Extra");
        var encontrou = Lista.find(p=>p.id == pessoa.id);
        if(encontrou) return msg.react("⚠️");
    
        fs.writeFileSync("./Dados/Extra/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8");
        msg.react("✅");
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
    var list = listar("Players")
    var contat = (await contato(msg)).numero.replace("@c.us","")
    var usuario = list.find(e=>e.contato==contat)

    var comando = msg.body.toLowerCase().split(' ')[1]
    comando = comando.split('\n')[0]
    var comandoSelecionado = lista.find(e=>e.nome.startsWith(comando))
    
    if(comandoSelecionado) {
        if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
            comandoSelecionado.func()
        }else{
            msg.react("💤")
        }
    }
    else{
        msg.react("⚠️")
    }
    
},["Admin"])

//Alterar
comandos.adicionarComandos("alterar","Altera os dados de um elemento: Nome, Idade, Titulo, Descricao", async (msg)=>{
    var lista = []

    //Ficha
    lista.adicionarComandos("ficha","Ficha",async()=>{
        var listas = listar("Players")
        var numero = (await contato(msg)).numero
        var pessoa = listas.find(e=>e.contato == numero.replace("@c.us",""))
        if(pessoa) {
            var input = msg.body.split("ficha")[1]

            var texto = input.split("\n")
            texto = texto.map(p=>(p.charAt(p.length-1) != "$")?p+="$":p)
            input = texto.join(" \n")

            var obj = await misto(input)
            //if(input.charAt(input.length - 1) != ".") input+=".";

            if(!obj)return msg.react("⚠️")

            pessoa.nome = obj.nome? obj.nome : pessoa.nome
            pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
            pessoa.idade = obj.idade? obj.idade : pessoa.idade

            var image = fs.readdirSync("./Dados/Image").map(p=>p).join(`*`);
            var imagens = image.split(`*`);
            var encontrou = imagens.find(e=>e.split(".")[0] == obj.imagem);
            pessoa.imagem = encontrou? encontrou : "";

            var video = fs.readdirSync("./Dados/Video").map(p=>p).join(`*`);
            var videos = video.split(`*`);
            var encontrou = videos.find(e=>e.split(".")[0] == obj.video);
            pessoa.video = encontrou? encontrou : "";

            pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao

            pessoa.lugar = obj.lugar? obj.lugar : pessoa.lugar
            
            fs.writeFileSync("./Dados/Players/"+pessoa.usuario + ".json", JSON.stringify(pessoa, null, 4), "utf8")
            msg.react("✅")
        }
    },)

    //Pessoas
    lista.adicionarComandos("pessoas","Pessoas",async()=>{
        
        var lugar = msg.body.toLowerCase().split("\n")[0]
        lugar = lugar.split(" ")[2]
        if(lugar == "povoado" || lugar == "rollenspiel"){
            var input = msg.body.split(lugar)[1]
            var texto = input.split("\n")
                texto = texto.map(p=>(p.charAt(p.length-1) != "$")?p+="$":p)
                input = texto.join(" \n")

                var listas = listar(lugar)
                for(i=0 ; i < listas.length ; i++){
                    var pessoa = listas[i]
                    var obj = await misto(input)

                    if(!obj)return msg.react("⚠️")

                    pessoa.nome = obj.nome? obj.nome : pessoa.nome
                    pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
                    pessoa.idade = obj.idade? obj.idade : pessoa.idade

                    var image = fs.readdirSync("./Dados/Image").map(p=>p).join(`*`);
                    var imagens = image.split(`*`);
                    var encontrou = imagens.find(e=>e.split(".")[0] == obj.imagem);
                    pessoa.imagem = encontrou? encontrou : "";

                    var video = fs.readdirSync("./Dados/Video").map(p=>p).join(`*`);
                    var videos = video.split(`*`);
                    var encontrou = videos.find(e=>e.split(".")[0] == obj.video);
                    pessoa.video = encontrou? encontrou : "";

                    pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao

                    pessoa.lugar = obj.lugar? obj.lugar : pessoa.lugar

                    fs.writeFileSync("./Dados/"+pessoa.lugar+"/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
                    msg.react("〽️")
                }
            return
        }

        var input = msg.body.split("pessoas")[1]
        var texto = input.split("\n")

        var listas = listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Extra"))
        var pessoa = listas.find(e=>e.id == texto[0].substring(1))
        //console.log(texto);
        if(pessoa){
            try{
                texto = texto.map(p=>(p.charAt(p.length-1) != "$")?p+="$":p)
                input = texto.join(" \n")
                //console.log(input);
                var obj = await misto(input)
                //console.log(obj);
                if(!obj)return msg.react("⚠️")

                pessoa.nome = obj.nome? obj.nome : pessoa.nome
                pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
                pessoa.idade = obj.idade? obj.idade : pessoa.idade
                
                var image = fs.readdirSync("./Dados/Image").map(p=>p).join(`*`);
                var imagens = image.split(`*`);
                var encontrou = imagens.find(e=>e.split(".")[0] == obj.imagem);
                pessoa.imagem = encontrou? encontrou : "";

                var video = fs.readdirSync("./Dados/Video").map(p=>p).join(`*`);
                var videos = video.split(`*`);
                var encontrou = videos.find(e=>e.split(".")[0] == obj.video);
                pessoa.video = encontrou? encontrou : "";


                pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao

                pessoa.lugar = obj.lugar? obj.lugar : pessoa.lugar
        
                fs.writeFileSync("./Dados/"+pessoa.lugar+"/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
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
        var listas = listar("Feiticos").concat(listar("Extra2"))
        var texto = msg.body.toLowerCase().split("\n")[0]
        texto = texto.split(" ")[2]
        var feitico = listas.find(e=>e.id == texto)
        //console.log(texto);
        if(feitico){
            try{
                var input = msg.body.split("feiticos")[1]

                var texto = input.split("\n")
                texto = texto.map(p=>(p.charAt(p.length-1) != "$")?p+="$":p)
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
    var list = listar("Players")
    var contat = (await contato(msg)).numero.replace("@c.us","")
    var usuario = list.find(e=>e.contato==contat)

    var comando = msg.body.toLowerCase().split(' ')[1]
    comando = comando.split('\n')[0]
    var comandoSelecionado = lista.find(e=>e.nome.startsWith(comando))
    
    if(comandoSelecionado) {
        if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
            comandoSelecionado.func()
        }else{
            msg.react("💤")
        }
    }
    else{
        msg.react("⚠️")
    }
},["Jogador","Admin"])

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

//Comandos
comandos.adicionarComandos("comandos","Mostra todos os comandos",async (msg, bot, whatsapp)=>{
    var texto = comandos.map(e=>e.nome+" - "+e.desc).join("\n\n")
    msg.reply(texto)
})

//Consultar
comandos.adicionarComandos("consultar","Mostra a descrição de um elemento",async (msg, bot, whatsapp)=>{
    var Lista=listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Feiticos"),listar("Extra"),listar("Extra2"));
    var texto = msg.body.toLowerCase().split(' ').filter((_,i)=>i).join(" ")
    var encontrou = Lista.find(p=>p.id == texto);

    try{
        var ficha = `${encontrou.nome}`+
                    `${encontrou.titulo?"\nConhecido como "+encontrou.titulo:"\nConhecido como "+encontrou.id}`+
                    `${encontrou.descricao?"\n\nDescrição: "+encontrou.descricao:"\nSem descrição"}`;

        if(encontrou.imagem){
            var imagem = await whatsapp.MessageMedia.fromFilePath("./Dados/Image/"+encontrou.imagem)
            await bot.sendMessage(msg.from,imagem,{ caption: ficha, quotedMessageId: msg.id._serialized });
            return
        }
        if(encontrou.video){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Video/"+encontrou.video)
            await bot.sendMessage(msg.from, video,{ sendVideoAsGif: true, caption: ficha, quotedMessageId: msg.id._serialized });
            return
        }
        msg.reply(ficha)
    }catch{
        msg.react("⚠️")
    }
})

//Enviar
comandos.adicionarComandos("enviar","Alerta a pessoa mencionada com um audio",async (msg, bot, whatsapp)=>{
    try{
        var numero = msg.body.split(' ')[1];
            numero = numero.startsWith('@') ? numero.replace("@","") : numero
            numero = numero.includes('-') ? `${numero}@g.us` :
            numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    
        if(numero.includes("@c.us")){
            var re = /(55.{10,11})/gi
        }else{
            var re = /(55.{10,11}-.{10,11})/gi
        }
        var texto = msg.body.split(re)[2];
        
        if(texto.includes(".mp4")){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Video/"+texto)
            await bot.sendMessage(numero, video, { sendVideoAsGif: true })   
            msg.react("✅") 
        }else if(texto.includes(".mp3")){
            var audio = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto)
            await bot.sendMessage(numero, audio, { sendAudioAsVoice: true })
            msg.react("✅") 
        }
    }catch{
        msg.react("⚠️")
    }       
})

//Ficha
comandos.adicionarComandos("ficha","Informações sobre o seu personagem",async (msg, bot, whatsapp)=>{ 
    var Players=listar("Players");
    var numero = (await contato(msg)).numero;
    var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
    if(encontrou){
        var ficha = `${encontrou.nome} \n`+
                    `Idade: ${encontrou.idade}`+
                    `${encontrou.titulo?"\nConhecido como "+encontrou.titulo:"\nConhecido como "+encontrou.id}`+
                    `${encontrou.descricao?"\n\nDescrição: "+encontrou.descricao:""}`+
                    `${encontrou.habPassivas?"\n\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`+
                    `${encontrou.feiticosAprendidos?"\n\nFeitiços Aprendidos: "+encontrou.feiticosAprendidos.join(", "):""}`;

        if(encontrou.imagem){
            var imagem = await whatsapp.MessageMedia.fromFilePath("./Dados/Image/"+encontrou.imagem)
            await bot.sendMessage(numero, imagem,{ caption: ficha, quotedMessageId: msg.id._serialized });
            msg.react("🆗")
            return
        }
        if(encontrou.video){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Video/"+encontrou.video)
            await bot.sendMessage(numero, video,{ sendVideoAsGif: true, quotedMessageId: msg.id._serialized });
            await bot.sendMessage(numero, ficha)
            msg.react("🆗")
            return
        }

        await bot.sendMessage(numero, ficha, {quotedMessageId: msg.id._serialized})
        msg.react("🆗")
        }
},["Jogador","Admin"])

//Listar
comandos.adicionarComandos("listar","Mostra os elementos dentro de um grupo, sendo os grupos: Pessoas, Feiticos e Arquivos",async (msg, bot, whatsapp)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var numero = (await contato(msg)).numero
    texto = msg.body.toLowerCase().split(' ')[2]
    var lista = []

    //Pessoas
    lista.adicionarComandos("pessoas","Pessoas",async()=>{
        if(texto){
            var String= "🔍População do "+texto+"🔍\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
            msg.react("🆗")
            return
        }
        var String =    "🔍Lista de Pessoas🔍"+
                        "\n\nPlayers\n- " + listar("Players").map(p=>p.nome).join("\n- ") + 
                        "\n\nPovoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ") +
                        "\n\nRollenspiel\n- " + listar("Rollenspiel").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
        msg.react("🆗")
    })

    //Feitiços
    lista.adicionarComandos("feiticos","Feiticos",async()=>{
        if(texto){
            var String= "🔍Feiticos de "+texto+"🔍\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
            msg.react("🆗")
            return
        }

        var String = "🔍Lista de Feiticos🔍\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
        msg.react("🆗")
    })
    
    //Arquivos
    lista.adicionarComandos("arquivos","Arquivos",async()=>{
        if(texto){
            var String= "🔍Lista de Arquivos\n"
                        +texto+"🔍\n- " + fs.readdirSync("./Dados/"+texto).map(p=>p).join("\n- ")
            await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
            msg.react("🆗")
            return
        }

        var String =    "🔍Lista de Arquivos🔍"+
                        "\n\nImagens\n- " + fs.readdirSync("./Dados/Image").join("\n- ") +
                        "\n\nAudios\n- " + fs.readdirSync("./Dados/Audios").join("\n- ") +
                        "\n\nVideos\n- " + fs.readdirSync("./Dados/Video").join("\n- ")

        await bot.sendMessage(numero, String, {quotedMessageId: msg.id._serialized})
        msg.react("🆗")
    })

    //Comando
    var list = listar("Players")
    var contat = (await contato(msg)).numero.replace("@c.us","")
    var usuario = list.find(e=>e.contato==contat)

    var comando = msg.body.toLowerCase().split(' ')[1]
    var comandoSelecionado = lista.find(e=>e.nome.startsWith(comando))

    if(comandoSelecionado) {
        if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
            comandoSelecionado.func()
        }else{
            msg.react("💤")
        }
    }
    else{
        msg.react("⚠️")
    }
})

//Misc
comandos.adicionarComandos("misc","Alarme, Horario, Jogadores, Marcar e Salvar", async (msg, bot, whatsapp)=>{

    var lista = []

    //Alarme
    var exec = true;
    lista.adicionarComandos("alarme","Coloca um temporizador", async ()=>{
        //await bot.sendMessage(msg.from, `${tempo}`)
        list = listar("Players")
        var numero = (await contato(msg)).numero
        encontrou = list.find(p=>p.contato == numero.replace("@c.us",""))
        if(!encontrou)return console.log("saiu");;
        
        var input = msg.body.split(' ')[2]
        input = input? input : 3
        
        //console.log(encontrou);
        if(encontrou?.alarme){
            var pessoa = encontrou;
            pessoa.alarme = false;
            fs.writeFileSync("./Dados/Players/"+pessoa.usuario + ".json", JSON.stringify(pessoa, null, 4), "utf8")
            
            var tempo = -1;
            var alarme = setInterval(async() => {
                tempo++;
                var caractere = [ "🕐" , "🕒" , "🕕" , "🕘" ]
                if(tempo == 4){
                    await msg.react("🆗")
                    clearInterval(alarme);
                    pessoa.alarme = true;
                    fs.writeFileSync("./Dados/Players/"+pessoa.usuario + ".json", JSON.stringify(pessoa, null, 4), "utf8")
                }
                else{
                    await msg.react(caractere[tempo])
                }
            },input*1000);
        }
    },["Admin"])

    //Baixar
    lista.adicionarComandos("baixar","baixa o video", async ()=>{

        var texto = msg.body.substring(13).toLowerCase()

        if(!texto) texto = video_imagem.filename + video_imagem.filesize

        var video_imagem = await msg.downloadMedia()

        var type = video_imagem.mimetype.split("/")

        var list = [fs.readdirSync("./Dados/"+type[0]).map(p=>p).join(", ")]

        var encontrou = list.filter(e=>e == (texto + "." + type[1]))

        if(encontrou == []) return msg.react("❎")

        fs.writeFileSync("./Dados/" + type[0] + "/" + texto + "." + type[1] , video_imagem.data,"base64")
        msg.react("✅")
    })

    //Figurinha
    lista.adicionarComandos("figura","transforma em figurinha", async ()=>{
        if(!msg.hasMedia)return

        var video_imagem = await msg.downloadMedia()
        await bot.sendMessage(msg.from, video_imagem, { sendMediaAsSticker: true })
        msg.react("✅")
    })

    //Horario
    lista.adicionarComandos("horario","Mostra o horario", async ()=>{
        var data = new Date()
        var horas = data.getHours()
        var minutos = data.getMinutes()
        //console.log(msg);
        //console.log(await msg.getInfo());
        //msg.reply(data+"\n"+horas+":"+minutos)
        if(horas < 12){
            if(horas < 6){
                msg.react("🥱")
                
            }
            else{
                msg.react("🔅")
            }
        }else{
            if(horas < 18){
                msg.react("🔆")
            }
            else{
                msg.react("😴")
            }
        }
        //🔥❄️ ☀️☁️🌧️⛈️
        /*6 ate 12: manha
        12 ate 18: tarde
        18 até 24: noite
        24 até 6: madrugada*/
    },["Admin"])

    //Jogadores
    lista.adicionarComandos("jogadores","Mostra todos os membros e funções",async ()=>{
        var participantes = await msg.getChat()
        participantes = participantes.participants
        //console.log(participantes);
        var numeros = participantes.map(p=>p.id.user)
        //var texto = "@" + numeros.join("\n@")
        //await bot.sendMessage(msg.from, texto2, {mentions: participantes})

        var lista = listar("Players")

        var texto = "jogadores"
        var texto2 =    "```"+texto+" ".repeat(20).slice(texto.length)+"Função \n"+
                        "" + numeros.map(d=>{
                            var encontrou = lista.find(p=>p.contato == d)
                            return `${encontrou?.usuario}` + " ".repeat(20).slice(encontrou?.usuario?.length)+`[${encontrou?.role}]`
                        }).join("\n")+"```"

        await bot.sendMessage(msg.from, texto2, {quotedMessageId: msg.id._serialized})
        msg.react("✅")

    },["Jogador","Admin"])

    //Marcar
    lista.adicionarComandos("marcar","Marca a mensagem", async ()=>{
        if(msg.hasQuotedMsg){
            var texto = await msg.getQuotedMessage()
            //console.log(texto);
            await bot.sendMessage(msg.from, "marcado", /*{quotedMessageId: texto.id._serialized}*/);
        }
    },["Admin"])

    //Pegar
    lista.adicionarComandos("pegar","", async ()=>{

        var input = msg.body.toLowerCase().split("misc pegar ")[1]
        input = input.split("\n")[0]

        var data = new Date()
        var data = data.toString().split(" ")
        var tempo = " - " + data.filter((_,i)=>i<4).join(" ") + " - " + data[4].split(":").join(" ")

        await msg.getChat().then(e=>e.fetchMessages({limit:50000000})).then(ms=>{
            fs.writeFileSync("./Dados/Documentos/"+ tempo + ".json", JSON.stringify(ms, null, 4), "utf8");
            var encontrou = ms  .filter(m=>m.id.id != msg.id.id )
                                .filter(m=>!m.id.fromMe)
                                .filter(m=>!m.body.startsWith("/"))
                                .filter(m=>m.body.toLowerCase().split("\n")[0].includes(input))
                                encontrou.reverse()

            if(!encontrou.length) return msg.react("❎")
            if(encontrou.length >= 3) msg.reply(`${input} foi citado ${encontrou.length} vezes, as ultimas 3 mensagens serão marcadas`)

            encontrou.filter((_,i)=>i<3).forEach(e=>bot.sendMessage(msg.from, `.`, {quotedMessageId: e.id._serialized}))
            msg.react("✅")
        })
    })

    //salvar
    lista.adicionarComandos("salvar","Salva a mensagem", async ()=>{
        if(msg.hasQuotedMsg){
            var texto = await msg.getQuotedMessage()
        }else{
            var texto = msg
        }

        list = listar("Documentos")
        encontrou = list.find(p=>p.id.id == texto.id.id)
        if(encontrou) return msg.react("📦")
        

        var numero = texto.id.remote.user? texto.id.remote.user : texto.id.remote
        var data = new Date()
        var data = data.toString().split(" ")
        var tempo = " - " + data.filter((_,i)=>i<4).join(" ") + " - " + data[4].split(":").join(" ")

        fs.writeFileSync("./Dados/Documentos/"+ numero + tempo + ".json", JSON.stringify(texto, null, 4), "utf8")
        msg.react("💾")
    },["Admin"])

    //Comando
    var list = listar("Players")
    var contat = (await contato(msg)).numero.replace("@c.us","")
    var usuario = list.find(e=>e.contato==contat)

    var comando = msg.body.toLowerCase().split(' ')[1]
    var comandoSelecionado = lista.find(e=>e.nome.startsWith(comando))

    if(comandoSelecionado) {
        if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
            comandoSelecionado.func()
        }else{
            msg.react("💤")
        }
    }
    else{
        msg.react("⚠️")
    }
})

//Mochila
comandos.adicionarComandos("mochila","",async (msg, bot, whatsapp)=>{ 
    var lista = [];
    var players=listar("Players")
    var numero = (await contato(msg)).numero
    var inventarios=listar("Inventario")

    lista.adicionarComandos("checar","",async ()=>{ 
        var encontrou = inventarios.find(p=>p.contato == numero.replace("@c.us",""));
        if(!encontrou)return;
        console.log(encontrou.mochila);
        var ficha = `Mochila: ${encontrou.mochila.tipo?encontrou.mochila.tipo:"Não possui"}`+
                    `${encontrou.mochila.itens?"\nItens: \n"+encontrou.mochila.itens.join("\n"):""}`;

        await bot.sendMessage(numero, ficha, {quotedMessageId: msg.id._serialized})
    })

    lista.adicionarComandos("equipar","",async ()=>{
        var inv = inventarios.find(p=>p.contato == numero.replace("@c.us",""));
        if(!inv)return;

        console.log(inv.mochila);
        if(inv.mochila.tipo == null){
            var obj = inv;
            obj.mochila.tipo = "full";
            fs.writeFileSync("./Dados/Inventario/"+ inv.id + ".json", JSON.stringify(obj, null, 4), "utf8");
        }

        var texto = "mamaefalei";
        await bot.sendMessage(numero, texto, {quotedMessageId: msg.id._serialized});
    })
    //lista.adicionarComandos("adicionar","",async ()=>{})
    //lista.adicionarComandos("remover","",async ()=>{})
    //Comando
    var contat = (await contato(msg)).numero.replace("@c.us","")
    var usuario = players.find(e=>e.contato==contat)

    var comando = msg.body.toLowerCase().split(' ')[1]
    var comandoSelecionado = lista.find(e=>e.nome.startsWith(comando))

    if(comandoSelecionado) {
        if(comandoSelecionado.roles.includes(usuario.role)||!comandoSelecionado.roles.length){
            comandoSelecionado.func()
        }else{
            msg.react("💤")
        }
    }
    else{
        msg.react("⚠️")
    }
})

//⏳⌛💰🛒📚📌🔍🔎🔓🔒⌚🏹🏋️‍♂️🤸‍♀️🤺🥊❎✅🆗💤〽️⚠️👁️‍🗨️💪🥷🧙‍♂️
module.exports = comandos