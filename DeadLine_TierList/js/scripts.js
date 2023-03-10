class DeadLine {
    static Ids = 0;
    relevance;
    title;
    description;
    dateTime;
    delay;
    complexity;
    id;
    time;


    constructor(relevance, title, description, dateTime, delay, complexity, time, id) {
        this.relevance = relevance;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.delay = delay;
        this.complexity = complexity;
        this.time = time;
        this.id = id;
    }


    calculateRelevance() {
        return 0;
    }
}

teerList = new Map([
    ["S", []],
    ["A", []],
    ["B", []],
    ["C", []],
    ["D", []],
    ["N", []]
]);

let objData = null;

function format(date) {
    date = date / 1000;
    return `${Math.floor(date / 60 / 60 / 24)}:${Math.abs(Math.floor(date / 60 / 60 % 24))}:${Math.abs(Math.floor(date / 60 % 60))}`
}

function append(cat, deadLine, isAdd, isSave) {
    if (isAdd === undefined)
        teerList.get(cat).push(deadLine);

    if(!isSave)
        localStorage.setItem('array', JSON.stringify(Array.from(teerList.entries())));

    let item = document.createElement("div");
    item.classList.add("element_teer");
    item.draggable = true;
    item.innerHTML = `${deadLine.title}<div class='date'>${format(deadLine.dateTime - new Date())}</div>`;
    item.id = "element_" + deadLine.id.toString();
    item.addEventListener(`dragstart`, (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("id", deadLine.id);
        e.target.classList.add("selected");
        return false;
    });
    item.addEventListener('click', (e) => {
        editDeadLine(deadLine);
    });

    item.addEventListener(`dragend`, (e) => {
        e.target.classList.remove("selected");
    });

    document.getElementById(cat).appendChild(item);
}

function deleteElement() {
    for (let i of teerList.values()) {
        let index = i.indexOf(objData);
        if (index === -1)
            continue;
        i.splice(i, 1);
    }
    document.getElementById("element_" + objData.id.toString()).remove();
    document.getElementById("modal").style.display = "none";
}


function createDeadLine() {
    objData = null;
    document.getElementById("count_symb").innerText = "осталось 30 симв.";
    document.getElementById("delete").style.display = "none";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("dateTime").value = "";
    document.getElementsByClassName("importance")[6].checked = true;
    document.getElementsByClassName("complexity")[3].checked = true;
    document.getElementsByClassName("delay")[0].checked = true;
    document.getElementById("hours").value = 1;


    document.getElementById("modal").style.display = "flex";
}

function editDeadLine(e) {
    objData = e;

    document.getElementById("count_symb").innerText = `осталось ${30 - e.title.length} симв.`;

    document.getElementById("delete").style.display = "none";

    document.getElementById("title").value = e.title;
    document.getElementById("description").value = e.description;
    console.log(e.dateTime.toISOString().split(0, 16));

    const formatted = new Date(e.dateTime.getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19);
    document.getElementById("dateTime").value = formatted;
    document.getElementById("hours").value = e.time;
    document.getElementsByClassName("importance")[e.relevance - 1].checked = true;
    document.getElementsByClassName("complexity")[e.complexity - 1].checked = true;
    document.getElementsByClassName("delay")[e.delay - 1].checked = true;

    document.getElementById("modal").style.display = "flex";
    document.getElementById("delete").style.display = "block";
}


function save() {
    if (document.getElementById("title").value.length === 0 ||
        document.getElementById("title").value.length > 30
        || Number(document.getElementById("hours").value) < 0 ||
        !document.getElementById("dateTime").value) {
        alert("Введенные данные неверны");
        return;
    }


    let deadLine;
    if (objData == null) {
        deadLine = new DeadLine(
            0,
            document.getElementById("title").value,
            document.getElementById("description").value,
            new Date(document.getElementById("dateTime").value),
            0, 0, Number(document.getElementById("hours").value), DeadLine.Ids++
        );
    } else {
        deadLine = objData;
        deadLine.title = document.getElementById("title").value;
        deadLine.description = document.getElementById("description").value;
        deadLine.dateTime = new Date(document.getElementById("dateTime").value);
        deadLine.time = Number(document.getElementById("hours").value);

        document.getElementById("element_" + deadLine.id.toString()).innerHTML = `${deadLine.title}<div class='date'>${format(deadLine.dateTime - new Date())}</div>`;
    }


    let importances = document.getElementsByClassName("importance");
    let skips = document.getElementsByClassName("complexity");
    let delays = document.getElementsByClassName("delay");
    for (let i = 0; i < 10; i++) {
        if (importances[i].checked) {
            deadLine.relevance = i + 1;
        }
        if (skips[i].checked) {
            deadLine.complexity = i + 1;
        }
        if (delays[i].checked) {
            deadLine.delay = i + 1;
        }
    }

    if (objData == null)
        append('N', deadLine);

    document.getElementById("modal").style.display = "none";

}

function import_() {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            let tier = new Map(JSON.parse(readerEvent.target.result));
            for (let i of tier.keys()) {
                for (let i1 of tier.get(i)) {
                    i1.dateTime = new Date(i1.dateTime);
                    i1.id = DeadLine.Ids++;
                    append(i, i1);
                }
            }
        }
    }
    input.click();
}

function changeTextSize(value){
    document.getElementById("count_symb").innerText = `осталось ${30 - value.length} симв.`;
}

function reset(){
    teerList = new Map([
        ["S", []],
        ["A", []],
        ["B", []],
        ["C", []],
        ["D", []],
        ["N", []]
    ]);
    objData = null;


    localStorage.setItem('array', null);
    let els = document.getElementsByClassName("element_teer");
    while (els[0]){
        els[0].remove();
    }
}

function export_() {
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(Array.from(teerList.entries()))], {
        type: 'application/json'
    });
    a.href = URL.createObjectURL(file);
    a.download = 'file.json';
    a.click();
}

function remove() {
    for (let i of teerList.keys()) {
        let result = teerList.get(i).filter(u => {
            if (u.dateTime >= new Date())
                return true;
            document.getElementById("element_" + u.id.toString()).remove();
            return false;
        });
        console.log(result);

        teerList.set(i, result);
    }
    console.log(teerList);
}

function sort() {
    for (let i of teerList.keys()) {
        let data = teerList.get(i);
        teerList.set(i, []);
        for (let i1 of data) {
            document.getElementById("element_" + i1.id.toString()).remove();
            let time = (i1.dateTime - new Date()) / 1000 / 60 / 60 / 24;
            let cat = "";
            if(time < 1)
                cat = "S";
            else if(time < 2)
                cat = "A";
            else if(time < 3)
                cat = "B";
            else if(time < 5)
                cat = "C";
            else
                cat = "D";
            append(cat, i1);
        }
    }
}

function generate() {
    let items = [];
    let mapped = [];
    for (let i of teerList.keys()) {
        for (let i1 of teerList.get(i)) {
            items.push({item: i1, value: calcRating(i1)});

            mapped.push(calcRating(i1));
            document.getElementById("element_" + i1.id.toString()).remove();
        }
        teerList.set(i, []);
    }

    items.sort((u, u1) => {
        return u.value - u1.value
    });


    let max = Math.max(...mapped), min = Math.min(...mapped);
    let array = ["S", "A", "B", "C", "D"];
    let perOne = (max - min) / array.length;


    for (let i = 0; i < items.length; i++) {
        let append_index;
        if(items.length < 5){
            append_index = i;
        }
        else{
            append_index = Math.round((items[i].value - min) / perOne);
            if(items[i].value < 0){
                append_index = Math.max(append_index, 0);
            }
            else{
                append_index = Math.min(append_index, array.length - 1);
            }
        }
        append(array[append_index], items[i].item);
    }
}

function calcRating(item) {
    if (item.dateTime - new Date() - (item.time * 60 * 60 * 1000) > 0) {
        return (11 - item.relevance) * (3.5 - item.complexity / 4) *  ((item.dateTime - new Date()) / 60 / 60 / 1000 - item.time) * (item.delay);
    } else {
        return (item.relevance) * (item.complexity / 4) * ((item.dateTime - new Date()) / 60 / 60 / 1000 - item.time) * (11 - item.delay);
    }
}


window.onload = function () {
    document.getElementById("close").onclick = function () {
        document.getElementById("modal").style.display = "none";
    };


    let array = localStorage.getItem('array');
    if(array){
        let tier = new Map(JSON.parse(array));
        for (let i of tier.keys()) {
            for (let i1 of tier.get(i)) {
                i1.dateTime = new Date(i1.dateTime);
                i1.id = DeadLine.Ids++;
                append(i, i1, undefined, true);
            }
        }
    }

    for (let item of document.getElementsByClassName("teer_row")) {
        item.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        item.addEventListener('drop', function (e) {
            e.dataTransfer.dropEffect = "move";
            e.preventDefault();
            e.stopPropagation();
            let doc = document.getElementsByClassName("selected")[0];

            let data;

            if (!e.target.classList.contains("teer_row"))
                return;

            for (let value of teerList.values()) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i].id == e.dataTransfer.getData("id")) {
                        data = value[i];
                        value.splice(i, 1);
                    }
                }
            }

            teerList.get(e.target.id).push(data);
            localStorage.setItem('array', JSON.stringify(Array.from(teerList.entries())));


            e.target.appendChild(doc);

            console.log(teerList);
        });
    }


    setInterval(function () {
        for (let i of teerList.values()) {
            for (let i1 of i) {
                document.getElementById("element_" + i1.id).getElementsByClassName("date")[0].innerHTML = format(i1.dateTime - new Date());
            }
        }
    }, 1000);
}

