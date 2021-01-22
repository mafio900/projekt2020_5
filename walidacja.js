
const splitValidation = document.getElementById("splitValidation");

let validationTables;

let toSlice = [];
splitValidation.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    toSlice = [];
    for (let i = 0; i < data.length; i++) {
        toSlice[i] = [];
        for (let j = 0; j < data[i].length; j++) {
            toSlice[i][j] = data[i][j];
        }
    }
    const parts = 10;
    validationTables = split(toSlice, parts);
    knn10(validationTables);
});


function split(arr, parts) {
    let vT = [];
    let l = [];
    let r = [];
    for (let i = 0; i < arr.length; i++) {
        l[i] = Math.floor(arr[i].length / parts);
        r[i] = arr[i].length % parts;
    }

    for (let k = 0; k < parts; k++) {
        vT[k] = [];
    }

    for (let i = 0; i < arr.length; i++) {
        let lol = 0;
        while (arr[i].length && lol < parts) {
            vT[lol++].push(arr[i].splice(0, l[i]));
        }
    }

    for (let i = 0; i < arr.length; i++) {
        for (let m = r[i] - 1; m >= 0; m--) {
            vT[m][i].push(arr[i][0]);
            arr[i].splice(0, 1);
        }
    }
    return vT;
}

function knn10(arr) {
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    const wal = document.getElementById('wal');
    wal.textContent = "";
    const hh = document.createElement('h3');
    wal.appendChild(hh);
    let s = 0;
    for (let m = 0; m < arr.length; m++) {
        let t = [];
        for (let o = 0; o < arr.length; o++) {
            if (m !== o)
                t.push(arr[o]);
        }

        const div1 = document.createElement('div');
        div1.className = "section-table-1";
        const h = document.createElement('h3');
        h.innerHTML = "Tabela nr: " + (m + 1);
        div1.appendChild(h);
        const testH = document.createElement('h4');
        div1.appendChild(testH);
        const table = document.createElement('table');
        table.className = "table";
        let classificationPercent = 0;

        let iksde = 0;
        let sum = 0;
        for (let i = 0; i < arr[m].length; i++) {
            sum += arr[m][i].length;
            for (let j = 0; j < arr[m][i].length; j++) {
                const fn = find_neighbors2(arr[m][i][j], t);
                const mv = majority_vote(fn);
                //tworzymy wiersze
                const tr = document.createElement('tr');

                let td = document.createElement('td');
                td.appendChild(document.createTextNode(++iksde));
                tr.appendChild(td);

                td = document.createElement('td');
                const divPoint = document.createElement('div');
                divPoint.appendChild(document.createTextNode(arr[m][i][j]));
                divPoint.id = iksde.toString() + m;
                divPoint.className = "classClickk";
                const neighborsText = document.createElement('p');
                neighborsText.id = divPoint.id + "n";
                neighborsText.className = "hideText";
                fn.forEach(neigh => {
                    const neighborText = document.createElement("p");
                    let przesuniecie = [];
                    let odleglosc = 0;
                    if (neigh[1] == mv) {
                        for(let iii = 0; iii<neigh.length; iii++){
                            przesuniecie.push(Number.parseFloat(arr[m][i][j]) - Number.parseFloat(neigh[0][iii]));
                        }
                        przesuniecie.forEach(prz => {
                            odleglosc += prz * prz;
                        });
                        odleglosc = Math.sqrt(odleglosc);
                        neighborText.textContent = neigh[0] + " " + names[neigh[1]] + " Odległość: " + odleglosc.toPrecision(4).toString();
                    } else {
                        for(let iii = 0; iii<neigh.length; iii++){
                            przesuniecie.push(Number.parseFloat(arr[m][i][j]) - Number.parseFloat(neigh[0][iii]));
                        }
                        przesuniecie.forEach(prz => {
                            odleglosc += prz * prz;
                        });
                        odleglosc = Math.sqrt(odleglosc);
                        neighborText.textContent = neigh[0] + " " + names[neigh[1]] + " Odległość: " + odleglosc.toPrecision(4).toString();
                    }
                    neighborsText.appendChild(neighborText);
                });
                divPoint.appendChild(neighborsText);
                td.appendChild(divPoint);
                tr.appendChild(td);

                td = document.createElement('td');
                td.appendChild(document.createTextNode(names[mv]));
                tr.appendChild(td);

                //dla każdego wiersza sprawdzamy czy wyliczona wartość mv jest zgodna z typem punktu z excela
                //jeśli jest zgodna to w tabeli zaznaczy się na kolor zielony jeśli nie to na czerwony
                for (let ii = 0; ii < data.length; ii++) {
                    for (let jj = 0; jj < data[ii].length; jj++) {
                        if (arr[m][i][j] === data[ii][jj]) {
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
        }
        s += classificationPercent / sum;
        testH.innerHTML = "Dokładność klasyfikacji wynosi: " + ((classificationPercent / sum) * 100).toPrecision(4).toString() + "%";
        div1.appendChild(table);
        wal.appendChild(div1);
        const els = document.getElementsByClassName("classClickk");
        Array.from(els).forEach((el) => {
            el.addEventListener("click", () => {
                const neighbor = document.getElementById(el.id.toString() + "n");
                if (neighbor.className === "hideText") {
                    neighbor.className = "";
                } else {
                    neighbor.className = "hideText";
                }
            });
        });
    }
        hh.innerHTML = "Dokładność klasyfikacji ogólnej wynosi: " + ((s / arr.length) * 100).toPrecision(4).toString() + "%";
        
}

function find_neighbors2(point, tt) {
    const dists = [];
    for (let kk = 0; kk < tt.length; kk++) {
        for (let i = 0; i < tt[kk].length; i++) {
            for (let j = 0; j < tt[kk][i].length; j++) {
                const dist = distance(point, tt[kk][i][j]);
                dists.push([dist, [tt[kk][i][j], i]]);
            }
        }
    }
    dists.sort(function (a, b) { return a[0] - b[0] });
    const neighbors = [];
    for (let i = 0; i < k && i < dists.length; i++) {
        neighbors.push(dists[i][1]);
    }
    return neighbors;
}