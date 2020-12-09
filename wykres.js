let pInput = document.getElementById("p");
let kInput = document.getElementById("k");
let p;
let k;
const nazwaTwoichPunktow = 'Twoje punkty';
let dataSets_boundaries = [];

let komunikat = document.getElementById("komunikat");
let node = document.createElement("p");
node.style.color = "red";
node.textContent = "Wczytaj dane (ctrl + z)";
komunikat.appendChild(node);

const electron = require('electron');
const {ipcRenderer} = electron;
ipcRenderer.on('data', (event, data) => {
    //komunikat.removeChild(node);
    node.style.color = "green";
    node.textContent = "Pomyślnie wczytano dane, trwa przetwarzanie...";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
        processData(data.msg);
    }, 2500);
});

//Wyciągnięcie danych z innego okna danych jaki punkt ma być dodany
const addPointButton = document.getElementById("addPointButton");
addPointButton.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    ipcRenderer.send("showAddPoint");
});

let points = [];
ipcRenderer.on('point', (event, data) => {
    points.push(data);
    showChart();
});


const colorsBackground = ['rgba(0, 255, 0, 0.4)', 'rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.4)', 'rgba(100, 100, 100, 0.4)'];
const colorsBorder = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(100, 100, 100, 1)'];


function coordinate(x, y) {
    this.x = x;
    this.y = y;
}

let sortedData;
let names = [];
let test = [];
let data = [];

function processData(allText) {
    let inputs = document.getElementById("inputs");

    let lines = [];
    data = [];
    names = [];
    points = [];

    sortedData = new Map();

    //sortowanie do poszczególnych grup każdej lini
    let allTextLines = allText.split(/\r\n|\n/);

    for (let i = 0; i < allTextLines.length; i++) {
        lines.push(allTextLines[i].split(','));
    }

    let columns = lines[0].length;
    for (let line of lines) {
        if (columns !== line.length) {
            node.style.color = "red";
            node.textContent = "Niepoprawne dane";
            komunikat.appendChild(node);
            return;
        }
        for (let i = 0; i < line.length - 1; i++) {
            if (isNaN(line[i])) {
                node.style.color = "red";
                node.textContent = "Niepoprawny typ danych";
                komunikat.appendChild(node);
                return;
            }
        }
    }
    inputs.style.display = "";

    for (let line of lines) {
        let flag = false;
        for (let name of names) {
            if (name === line[line.length - 1])
                flag = true;
        }
        if (!flag) {
            names.push(line[line.length - 1]);
        }
    }
    names.forEach((name, i) => {
        data[i] = [];
        test[i] = [];
        for (let line of lines) {
            let xd = [];
            if (line[line.length - 1] === name) {
                line.pop();
                data[i].push(line);
                for (let l of line) {
                    xd.push(Number.parseFloat(l));
                }
                test[i].push(xd);
            }
        }
    });
    names.push(nazwaTwoichPunktow);

    data.forEach((d, i) => {
        sortedData.set(names[i], d);
    });


    ipcRenderer.send("lines", {msg: lines[0].length});

    //Dodawanie przycisków wybierania kolumn do wyświetlenia
    let selectCol1 = document.getElementById("selectCol1");
    selectCol1.textContent = "";
    selectCol1.className = "field opinion-scale";

    let ul = document.createElement("ul");
    selectCol1.appendChild(ul);
    let kolumna = document.createElement("p");
    kolumna.append("Wybierz kolumny:");
    kolumna.id = "kolumna";
    selectCol1.prepend(kolumna);

    for (let i = 0; i < lines[0].length; i++) {
        let li = document.createElement("li");
        ul.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion1-scale";
        node.value = i.toString();
        node.id = "option1-" + i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option1-" + i.toString();
        li.appendChild(label);
        label.append((i + 1).toString());
    }

    let selectCol2 = document.getElementById("selectCol2");
    selectCol2.textContent = "";
    selectCol2.className = "field opinion-scale";

    let ul2 = document.createElement("ul");
    selectCol2.appendChild(ul2);

    for (let i = 0; i < lines[0].length; i++) {

        let li = document.createElement("li");
        ul2.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion2-scale";
        node.value = i.toString();
        node.id = "option2-" + i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option2-" + i.toString();
        li.appendChild(label);
        label.append((i + 1).toString());
    }
}

//tworzenie tabeli z wybranymi kolumnami do wyświetlenia po wciśnięciu przycisku
let c1;
let c2;
const showChart = () => {
    //wykres
    const canvas = document.getElementById("wykres");
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dataSet = [];
    const col1 = document.getElementsByName('opinion1-scale');
    const col2 = document.getElementsByName('opinion2-scale');


    for (let i = 0; i < col1.length; i++) {
        if (col1[i].checked) {
            c1 = col1[i].id.slice(8, col1[i].length);
            break;
        }
    }
    for (let i = 0; i < col2.length; i++) {
        if (col2[i].checked) {
            c2 = col2[i].id.slice(8, col2[i].length);
            break;
        }
    }

    for (name of names) {
        let tmp2 = [];
        if (name === nazwaTwoichPunktow && points !== []) {
            points.forEach((t) => {
                tmp2.push(new coordinate(Number.parseFloat(t[c1]), Number.parseFloat(t[c2])));
            });
        } else {
            let tmp = sortedData.get(name);
            tmp.forEach((t) => {
                tmp2.push(new coordinate(Number.parseFloat(t[c1]), Number.parseFloat(t[c2])));
            });
        }
        dataSet.push(tmp2);
    }
    //test = dataSet;

    let dataSets = [];
    dataSet.forEach((d, i) => {
        dataSets.push({
            label: names[i],
            data: d,
            backgroundColor: colorsBackground[i],
            borderColor: colorsBorder[i],
            borderWidth: 1,
            radius: 6,
            pointStyle: "circle"
        });
    });

    dataSets_boundaries = dataSets;
};

const testb = document.getElementById("test");
const classPoints = document.getElementById("classificationContent");
testb.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    if (points.length === 0) {
        return;
    }
    let l = 0;
    const tableClass = document.createElement('table');
    tableClass.className = "table";
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    for (let po of points) {
        const fn = find_neighbors(po, test);
        const mv = majority_vote(fn);
        const neighborsTable = [];
        for(let i = 0; i < fn.length; i++){
            neighborsTable.push(fn[i][0]);
        }

        const tr = document.createElement('tr');
        let td = document.createElement('td');
        td.appendChild(document.createTextNode(++l));
        tr.appendChild(td);

        td = document.createElement('td');
        const divPoint = document.createElement('div');
        divPoint.appendChild(document.createTextNode(po));
        divPoint.id = l.toString();
        divPoint.className = "classClick";
        const neighborsText = document.createElement('p');
        neighborsText.id = l.toString() + "n";
        neighborsText.className = "hideText";
        fn.forEach(neigh => {
            const neighborText = document.createElement("p");
            if(neigh[1] == mv){
                neighborText.textContent = neigh + "*";
            }else{
                neighborText.textContent = neigh;
            }
            neighborsText.appendChild(neighborText);
        });
        divPoint.appendChild(neighborsText);
        td.appendChild(divPoint);
        tr.appendChild(td);

        td = document.createElement('td');
        td.appendChild(document.createTextNode(names[mv]));
        tr.appendChild(td);
        tableClass.appendChild(tr);
    }

    classPoints.textContent = "";
    const infoH = document.createElement('h3');
    infoH.innerHTML = "Zklasyfikowane punkty";
    const infoP = document.createElement('p');
    infoP.appendChild(infoH);
    classPoints.appendChild(infoP);
    classPoints.appendChild(tableClass);

    const els = document.getElementsByClassName("classClick");
    Array.from(els).forEach((el) => {
        el.addEventListener("click", ()=>{
            const neighbor = document.getElementById(el.id.toString() + "n");
            if(neighbor.className === "hideText"){
                neighbor.className = "";
            }else{
                neighbor.className = "hideText";
            }
        });
    });
});

function distance(p1, p2) {
    let sum = 0;
    for (let i = 0; i < p1.length; i++) {
        sum += Math.pow(Math.abs(p1[i] - p2[i]), p);
    }
    sum = Math.pow(sum, 1 / p);
    return sum;
}

function find_neighbors(point, tt) {
    const dists = [];
    for (let i = 0; i < tt.length; i++) {
        for (let j = 0; j < tt[i].length; j++) {
            const dist = distance(point, tt[i][j]);
            dists.push([dist, [tt[i][j], i]]);
        }
    }
    dists.sort(function (a, b) {
        return a[0] - b[0]
    });
    const neighbors = [];
    for (let i = 0; i < k && i < dists.length; i++) {
        neighbors.push(dists[i][1]);
    }
    return neighbors;
}

function majority_vote(ps) {
    let votes = new Map();
    for (let c = 0; c < names.length - 1; c++) {
        votes.set(c, 0);
    }
    for (let c = 0; c < names.length - 1; c++) {
        for (let i = 0; i < ps.length; i++) {
            if (c === ps[i][1]) {
                votes.set(c, votes.get(c) + 1);
            }
        }
    }

    let max_votes = 0;
    let winner = null;
    for (let c = 0; c < names.length - 1; c++) {
        if (votes.get(c) === max_votes) {
            winner = null;
        }
        if (votes.get(c) > max_votes) {
            max_votes = votes.get(c);
            winner = c;
        }
    }
    if (winner === null) {
        let equalVoters = [];
        votes.forEach((value, key) => {
            if (value === max_votes) {
                equalVoters.push(key);
            }
        });
        let newWinnerLength = 0;
        for (let c = 0; c < equalVoters.length; c++) {
            if (data[c].length > newWinnerLength) {
                newWinnerLength = data[c].length;
                winner = c;
            }
        }
    }
    return winner;
}

// przyciski p i k
jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
jQuery('.quantity').each(function () {
    var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        btnUp = spinner.find('.quantity-up'),
        btnDown = spinner.find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

    btnUp.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

    btnDown.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");

    });

});
// koniec przyciski p i k

//eldo - granice

const bound = document.getElementById("boundaries");
bound.addEventListener("click", ()=>{
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    showChart();
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    testDiv.style.display = "";

    const prevChart = document.getElementById('wykres');
    prevChart.style.display = "none";
    const canv = document.getElementById('wykres2');
    const showNumbersCheckbox = document.getElementById('showNumbers');
    const showNumbers = showNumbersCheckbox.checked;
    canv.width = 500;
    canv.height = 500;
    const ctxv = canv.getContext('2d');

    ctxv.clearRect(0, 0, canv.width, canv.height);

    const pointSize = 10;
    let areaPadding = 10;

    let pointies = [];

    let areaLoading = 0;
    let areaLengthLoading = 0;

    let minx=0;
    let miny=0;
    let maxx=0;
    let maxy=0;

    dataSets_boundaries.forEach((d, c)=>{
        d.data.forEach((coord, k) => {
            if(coord.x < minx)
                minx = coord.x;
            if(coord.y < miny)
                miny = coord.y;
            if(coord.x > maxx)
                maxx = coord.x;
            if(coord.y > maxy)
                maxy = coord.y;

            pointies.push([coord,c]);
        });
    });


    let wdth = canv.width/(maxx - minx)-2;
    let hght = canv.height/(maxy - miny)-2;

    if(wdth<hght)
        hght = wdth;
    else
        wdth = hght;

    let px, py = 0;

//  if(minx<miny)
        px = (-1)*minx+2;
//  else
        py = (-1)*miny+2;

//   px = py;

    if(areaPadding < px)
        areaPadding = areaPadding + px/2;


    let area = [];

    for (let x = minx-areaPadding; x <= maxx+areaPadding; x+=0.1)
        for (let y = miny-areaPadding; y <= maxy+areaPadding; y= y+=0.1)
            area.push([x,y]);

    areaLengthLoading = area.length;
    areaLengthLoading = parseInt(areaLengthLoading/100)

    let tmp_loading = 0;

    for(let po of area){
        const fn = find_neighbors(po, test);
        const mv = majority_vote(fn);

        if (mv !== null) {
            ctxv.globalAlpha = 0.4;
            ctxv.fillStyle = colorsBackground[mv];
            ctxv.fillRect(
                (po[0] + px) * wdth,
                (po[1] + py) * hght,
                wdth/10, hght/10);
        }

    // progress couter

        areaLoading++;
        if(areaLoading%areaLengthLoading == 0 )
            console.log("wczytano: " + areaLoading + " z " + areaLengthLoading + " |" + parseInt(areaLoading/areaLengthLoading)+"%");
    }


    pointies.forEach((p, i) => {

        ctxv.globalAlpha = 1.0;
        ctxv.fillStyle = colorsBackground[p[1]];
        ctxv.beginPath();
        ctxv.arc(
                (p[0].x + px) * wdth ,
                (p[0].y + py) * hght ,
                pointSize/2,
                0,
                2 * Math.PI);
                ctxv.fill();
    });

//kreska X
    ctxv.globalAlpha = 1.0;
    ctxv.fillStyle = "black";
    ctxv.fillRect(
            0,
            py * hght-1,
            10000,
            2);

//liczby Y
    if(showNumbers)
    for(let wy = maxy+areaPadding; wy>=miny-areaPadding; wy--){
        ctxv.save();
        ctxv.scale(1, -1);
        ctxv.fillText(""+wy, py*hght+hght/2, -1*(wy+py)*hght+4);
        ctxv.restore();
    }

//podzial X
    for(let wy = miny-areaPadding; wy<=maxy+areaPadding; wy++){
        ctxv.fillRect(
            (wy+py) * hght + pointSize/2 - 1 -6 ,
            py * hght - 6,
            2,
            12);
    }

//kreska Y
    ctxv.globalAlpha = 1.0;
    ctxv.fillStyle = "black";
    ctxv.fillRect(
            px * wdth-1,
            0,
            2,
            10000);
//liczby x
    for(let wx = minx-areaPadding*2; wx<=maxx+areaPadding*2; wx++){
        if(showNumbers){
            ctxv.font = "10px Arial";
            ctxv.save();
            ctxv.scale(1, -1);
            ctxv.fillText(""+wx, (wx+px)*wdth-4, -px*wdth+wdth/2+40);
            ctxv.restore();
        }

//podział Y
        ctxv.fillRect(
            px * wdth - 6,
            (wx+px)*wdth+pointSize/2 - 1 -6,
            12,
            2);
    }
});
