//REQUIRES
require('dotenv').config();
const axios = require('axios').default;
const moment = require('moment');
const cron = require("node-cron");
require('dotenv').config();

//EXPRESS
const express =  require('express');
const app = express();

//CONFIG DATABASE
const mysql = require('mysql');
const config = require('./config/database');
const connection = mysql.createConnection(config);

//TEST DATABASE
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected BD MYSQL!");
  });






  //CRON INTERVAL 30s
cron.schedule("*/20 * * * * *", () => {
    //SETANDO DATA/HORA ATUAL
    const value = Date.now();
    const datetime0 = moment(value)
    const dataAtual = datetime0.format("DD/MM/YYYY HH:mm:SS"); 
    
    
    //SETANDO HORA ATUAL - INTERVALO
    const time = moment.duration("50:00:00");
    const datetime1 = moment(value);
    datetime1.subtract(time);
    const dataAtualMenos2Horas = datetime1.format("DD/MM/YYYY HH:mm:SS");  

    console.log("\x1b[34m Hora Inicial:  ",dataAtualMenos2Horas);
    console.log(' Hora Final:    ',dataAtual, '\x1b[0m');


    const url =`${process.env.API_URL}?data_inicial=${dataAtualMenos2Horas}&data_final=${dataAtual}&servico=12&status=ENCERRADA&resultado=ATENDIDA&formato=json`;
    axios.get(url).then( res => {   
        let count = 0;
        res.data.RESULTADO.map( (row) => {
            if(row.tabulacao !== "")  {

                const sql = `INSERT INTO relatorio_de_chamadas_bkp (data, hora, origem, destino, tempo_total, codigo_usuario, nome_campanha, nome_tronco, tabulacao, gravacao_id, cpf_cliente) VALUES 
                ('${moment(row.data).format("YYYY-MM-DD")}', '${row.hora}', '${row.origem}', '${row.destino}',  '${row.tempo_total}', '${row.codigo_usuario}', '${row.nome_campanha}', '${row.nome_tronco}', '${row.tabulacao}', '${row.gravacao_id}', '${row.cpf}')`;
                  connection.query(sql, function (err, result) {

                    if (!err) {
                        console.log(`Registro de Chamada ${row.gravacao_id} inserido`);
                    }
                });   
            }

            count+=1
        })
        console.log(url);
        console.log(`\x1b[36m ${count} Registros Inseridos \x1b[8m`);
        console.log(`\x1b[36m


            888888  .d88888b.  888888b.        8888888888 Y88b   d88P 8888888888 .d8888b.  888     888 88888888888     d8888 8888888b.   .d88888b.  
            "88b d88P" "Y88b 888  "88b       888         Y88b d88P  888       d88P  Y88b 888     888     888        d88888 888  "Y88b d88P" "Y88b 
             888 888     888 888  .88P       888          Y88o88P   888       888    888 888     888     888       d88P888 888    888 888     888 
             888 888     888 8888888K.       8888888       Y888P    8888888   888        888     888     888      d88P 888 888    888 888     888 
             888 888     888 888  "Y88b      888           d888b    888       888        888     888     888     d88P  888 888    888 888     888 
             888 888     888 888    888      888          d88888b   888       888    888 888     888     888    d88P   888 888    888 888     888 
             88P Y88b. .d88P 888   d88P      888         d88P Y88b  888       Y88b  d88P Y88b. .d88P     888   d8888888888 888  .d88P Y88b. .d88P 
             888  "Y88888P"  8888888P"       8888888888 d88P   Y88b 8888888888 "Y8888P"   "Y88888P"      888  d88P     888 8888888P"   "Y88888P"  
           .d88P                                                                                                                                  
         .d88P"                                                                                                                                   
        888P"                                                                                                                                     
                                                                                                                           
 \x1b[0m                                                                                                                      
     `)       
     
     console.log('\x1b[36m20 Segundos para o Próximo JOB... \x1b[0m');


        
    }).catch(err => {
        console.log('0 Registros Inseridos');
    })

}
);


app.get('/', (req, res) => {
    res.send('Server ON!');
})


const port = process.env.PORT || 3001

app.listen(port, (req, res) => {
    // console.log(moment(Date.now()).format('DD/MM/YYYY HH:MM'));
    console.log(`Server Started on port ${port}`);
})
