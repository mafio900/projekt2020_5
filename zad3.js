let uczacy = [];
let testujacy = [];

const splitInput = document.getElementById("splitInput");
const splitFile = document.getElementById("splitFile");
const calculate = document.getElementById("calculate");
splitFile.addEventListener("click", () => {
    if(!(data.length > 0)){
        node.textContent = "Nie wczytano pliku!";
        node.style.color = "red";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    uczacy = [];
    testujacy = [];
    let ileW = Number.parseInt(splitInput.value);
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);

    let toSlice = [];
    let all=0;
    for (let i = 0; i < data.length; i++) {
        toSlice[i] = [];
        for (let j = 0; j < data[i].length; j++) {
            toSlice[i][j] = data[i][j];
            all++;
        }
    }
    splitInput.value = "";
    if(ileW+1 >= all){
        node.textContent = "Podano błędną wielkość zbioru uczącego";
        node.style.color = "red";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        calculate.style.display = "none";
        return;
    }
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
                        //console.log(licz);
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
    node.style.color = "green";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
    }, 2500);
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

        //console.log("Podany punkt o wspolrzednych: " + po + " nalezy do: " + names[mv]);

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
        for (let ii = 0; ii < data.length; ii++) {
            for (let jj = 0; jj < data[ii].length; jj++) {
                if (po === data[ii][jj]) {
                    if (mv === ii) {
                        tr.style.backgroundColor = "green";
                        classificationPercent++;
                        break;
                    }
                    else {
                        tr.style.backgroundColor = "red";
                        break;
                    }
                }
            }
            table.appendChild(tr);
        }

    }
    //console.log(classificationPercent/testujacy.length);
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
    const div2 = document.createElement('div');
    div2.className = "section-table-1";
    const h = document.createElement('h3');
    h.innerHTML = "Zestaw uczących się";
    div2.appendChild(h);
    const table2 = document.createElement('table');
    table2.className = "table";
    let classificationPercent = 0;
    let iksde = 0;
    for(let i = 0; i < uczacy.length; i++){
        for (let j = 0; j < uczacy[i].length; j++) {
            const fn = find_neighbors(uczacy[i][j], uczacy);
            const mv = majority_vote(fn);

            const tr = document.createElement('tr');

            let td = document.createElement('td');
            td.appendChild(document.createTextNode(++iksde));
            tr.appendChild(td);

            td = document.createElement('td');
            td.appendChild(document.createTextNode(uczacy[i][j]));
            tr.appendChild(td);

            td = document.createElement('td');
            td.appendChild(document.createTextNode(names[mv]));
            tr.appendChild(td);

            for (let ii = 0; ii < data.length; ii++) {
                for (let jj = 0; jj < data[ii].length; jj++) {
                    if (uczacy[i][j] === data[ii][jj]) {
                        if (mv === ii) {
                            tr.style.backgroundColor = "green";
                            classificationPercent++;
                            break;
                        }
                        else {
                            tr.style.backgroundColor = "red";
                            break;
                        }
                    }
                }
                table2.appendChild(tr);
            }
        }
    }
    const classificationTr = document.createElement('tr');
    const classificationTd = document.createElement('td');
    let sum = 0;
    for(let [iks, lol] of uczacy.entries() ){
        sum += lol.length;
    }
    classificationTd.textContent = "Dokładność klasyfikacji wynosi: " + ((classificationPercent/sum)*100).toPrecision(4).toString() + "%";
    classificationTd.colSpan = 3;
    classificationTr.appendChild(classificationTd);
    table2.appendChild(classificationTr);
    div2.appendChild(table2);
    dataText.textContent = "";
    dataText.appendChild(div2);
}

