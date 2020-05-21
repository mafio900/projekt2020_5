let uczacy = [];
let testujacy = [];

const splitInput = document.getElementById("splitInput");
const splitFile = document.getElementById("splitFile");
const calculate = document.getElementById("calculate");
splitFile.addEventListener("click", () => {
    let ileW = Number.parseInt(splitInput.value);
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);

    console.log('k: ' + k + ', p: ' + p);
    let toSlice = [];
    for (let i = 0; i < data.length; i++) {
        toSlice[i] = [];
        console.log('data[1]length: ' + data[i].length);
        for (let j = 0; j < data[i].length; j++) {
            toSlice[i][j] = data[i][j];
        }
    }
    splitInput.value = "";
    calculate.style.display = "";
    for(let [i,ts] of toSlice.entries()){
        uczacy[i] = [];
    }

    for(let i = 0; i < toSlice.length; i++) {
        const l = toSlice[i].length;
        for (let j = 0; j < ileW / toSlice.length && j < l; j++) {
            const r = Math.floor(Math.random() * (toSlice[i].length - 1));
            uczacy[i].push(toSlice[i][r]);
            toSlice[i].splice(r, 1);
        }
        if(uczacy[i].length < ileW/toSlice.length){
            let left = (ileW / toSlice.length) - uczacy[i].length;
            for(let ii = 0; ii < toSlice.length; ii++) {
                if(toSlice[ii].length > 0) {
                    const ll = toSlice[ii].length;
                    let licz = 0;
                    for (let j = 0; j < left && j < ll; j++) {
                        const r = Math.floor(Math.random() * (toSlice[ii].length - 1));
                        uczacy[ii].push(toSlice[ii][r]);
                        toSlice[ii].splice(r, 1);
                        licz++;
                        console.log(licz);
                    }
                    left -=licz;
                }
            }
        }
    }
    for(let d of toSlice){
        testujacy = [...testujacy, ...d];
    }

    node.textContent = "Podzielono na zbiory uczący i testujący.";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
    }, 2500)
});

const dataText = document.getElementById("dataText");
calculate.addEventListener("click", () => {
    addLearnTable();
    addTestingTable();
});

//wyswietla tabele ze zbiorem testujacym
function addTestingTable() {
    var div1 = document.createElement('div');
    div1.className = "section-table-2";
    var h = document.createElement('h3');
    h.innerHTML = "Zestaw testujących";
    div1.appendChild(h);
    var table = document.createElement('table');
    table.className = "table";
    let classificationPercent = 0;
    for (let [i, po] of testujacy.entries()) {
        const fn = find_neighbors(po, uczacy);
        const mv = majority_vote(fn);

        console.log("Podany punkt o wspolrzednych: " + po + " nalezy do: " + names[mv]);

        //tworzymy wiersze
        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(i + 1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(po));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(names[mv]));
        tr.appendChild(td);

        //dla każdego wiersza sprawdzamy czy wyliczona wartość mv jest zgodna z typem punktu z excela
        //jeśli jest zgodna to w tabeli zaznaczy się na kolor zielony jeśli nie to na czerwony
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (po === data[i][j]) {
                    if (mv === i) {
                        tr.style.backgroundColor = "green";
                        classificationPercent++;
                    }
                    else {
                        tr.style.backgroundColor = "red";
                    }
                }
            }
            table.appendChild(tr);
        }

    }
    console.log(classificationPercent/testujacy.length);
    const classificationTr = document.createElement('tr');
    const classificationTd = document.createElement('td');
    classificationTd.textContent = "Dokładność klasyfikacji wynosi: " + ((classificationPercent/testujacy.length)*100).toPrecision(4).toString() + "%";
    classificationTd.colSpan = 3;
    classificationTr.appendChild(classificationTd);
    table.appendChild(classificationTr);
    div1.appendChild(table);
    dataText.appendChild(div1);

}

//wyświetla tebelę ze zbiorem uczącym się
function addLearnTable() {
    var div2 = document.createElement('div');
    div2.className = "section-table-1";
    var h = document.createElement('h3');
    h.innerHTML = "Zestaw uczących się";
    div2.appendChild(h);
    var table2 = document.createElement('table');
    table2.className = "table";

    //najpierw uczacy[0] czyli lagodne
    for (j = 0; j < uczacy[0].length; j++) {
        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(j + 1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(uczacy[0][j]));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode('lagodny'));
        tr.appendChild(td);

        table2.appendChild(tr);
    }

    //potem wyswietlane uczacy[1] czyli zlosliwe  --mozna by to wyswietlac jakos randomowo ale nie wiem za bardzo jak 
    for (j = 0; j < uczacy[1].length; j++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(j + uczacy[0].length+1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(uczacy[1][j]));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode('zlosliwy'));
        tr.appendChild(td);

        table2.appendChild(tr);
    }
    div2.appendChild(table2);
    dataText.appendChild(div2);
}

