const express = require("express");
const path = require("path");
const fs = require("fs");

app = express();

app.set("view engine", "ejs");

console.log("Folder index.js: ", __dirname);
console.log("Calea fisierului: ", __filename);
console.log("Folderul curent: ", process.cwd());

obGlobal = {
    obErori: null
}

vectorFoldere=["temp"]
for (let folder of vectorFoldere){
    let folderAbsolutePath=path.join(__dirname,folder)
    if (!fs.existsSync(folderAbsolutePath))
        fs.mkdirSync(folderAbsolutePath)
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/ico/favicon.ico"));
})

app.get(["/", "/index", "/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip});
})

app.get(/^\/resurse\/[a-z0-9A-Z\/]*\/$/, function(req, res){ 
    afisareEroare(res, 403);
})

app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400);
})


app.get("/*", function(req, res){
    try{
        res.render("pagini" + req.url, function(err, rezRandare){
            if(err){
                if (err.message.startsWith("Failed to lookup")){
                    afisareEroare(res, 404, "Pagina nu a fost gasita", "Verificati URL-ul");
                }
                else {
                    afisareEroare(res, -1);
                }
            }
            else {
                res.send(rezRandare);
            }
        })
    }
    catch (err1){
        if (err1.message.startsWith("Cannot find module")){
            afisareEroare(res, 404, "Pagina nu a fost gasita","Verificati URL-ul");

        }
        else{
            afisareEroare(res, -1);
        }
    }

})


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");

    obGlobal.obErori = JSON.parse(continut);
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)

    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }

}

initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}
app.listen(8080);