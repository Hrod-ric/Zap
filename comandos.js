const fs = require("fs")
const listar = (pasta)=>{
    var Lista = fs.readdirSync("./Dados/"+pasta).map(p=>JSON.parse(fs.readFileSync("./Dados/"+pasta+"/"+p)));
    var Lista2 = (Lista[0].Pessoas).concat(Lista[1].Pessoas)
    console.log(Lista,Lista2);
    return Lista2;
}
const contato = async (msg)=>{
    var chat = await msg.getChat()
    var contato = await msg.getContact();
    var numero = contato.id.user;
        numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    return {chat,numero,contato};
}
module.exports = {
    "comandos" : async (msg, bot, whatsapp)=>{
        bot.sendMessage(msg.from,
            `".ficha"\n`+
            `"Informações sobre o seu personagem"\n\n`+
            `".lista (grupo)"\n`+
            `"Mostra os nomes de um grupo"\n\n`+
            `".populacao (lugar)"\n`+
            `"Mostra os habitantes de um lugar"\n\n`+
            `".consulta (algo)"\n`+
            `"para pesquisar um elemento e receber a descricao"`)
    },

    "lista" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.split(' ')[1]
        var numero = (await contato(msg)).numero
        if(texto == "feiticos"){
            var String = "Lista de Feiticos\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
            msg.reply("Enviado!")
            await bot.sendMessage(numero, String)
        }   
    },

    "ficha" : async (msg, bot, whatsapp)=>{ 
        var Players=listar("Lugares")
        var numero = (await contato(msg)).numero
        var chat = (await contato(msg)).chat
        var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
        //console.log(chat);
        if(encontrou){
            msg.reply("Enviado!")
            await bot.sendMessage(numero, 
                `Nome: ${encontrou.nome} \n`+
                `Idade: ${encontrou.idade}`+
                `${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}`+
                `${encontrou.habPassivas?"\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`+
                `${encontrou.feiticosAprendidos?"\nFeitiços Aprendidos: "+encontrou.feiticosAprendidos.join(", "):""}`)
        }
    },

    "populacao" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.split(' ')[1]
        if(texto == "povoado"){
            var Pessoas= "População do povoado\n- " + listar("Lugares").map(p=>p.nome).join("\n- ");
            msg.reply(Pessoas);
        }
    },

    "consulta" : async (msg, bot, whatsapp)=>{
        var Lista=listar("Lugares");
        var texto = msg.body.slice(10);
        //console.log(texto);
        var encontrou = Lista.find(p=>p.nome == texto);
        /*if(!encontrou){
            Lista=listar("Feiticos");
            encontrou = Lista.find(p=>p.nome == texto);
        }*/

        try{
            msg.reply(
                `Nome: ${encontrou.nome}`+
                `${encontrou.descricao?"\nDescrição: "+encontrou.descricao:"Sem descrição"}`
            )
        }catch{
            msg.reply("Não foi encontrado!")
        }
    },

    "erro" : ()=>{
        throw "Teste de erro"
    },

    "adicionar" :   (msg)=>{
        var input = msg.body.toLowerCase().split(' ')[1]
        if(input == "pessoas"){
            var Lista = listar("Lugares")
        }
    }




}